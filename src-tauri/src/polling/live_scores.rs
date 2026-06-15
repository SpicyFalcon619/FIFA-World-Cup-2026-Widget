use tauri::Manager;
use tauri::Emitter;
use crate::models::api_response::{EspnScoreboard, WcTeamsResponse};
use crate::models::match_model::{Match, MatchStatus};

fn get_stat<'a>(stats: &'a [crate::models::api_response::EspnStatistic], name: &str) -> Option<String> {
    stats.iter()
        .find(|s| s.name == name)
        .map(|s| s.display_value.clone())
}

pub async fn fetch_and_emit(handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let client = reqwest::Client::new();
    
    // Fetch Teams from old API purely for flags
    let teams_res = client
        .get("https://worldcup26.ir/get/teams")
        .send()
        .await;

    let mut team_map = std::collections::HashMap::new();
    if let Ok(res) = teams_res {
        if let Ok(payload) = res.json::<WcTeamsResponse>().await {
            for team in payload.teams {
                team_map.insert(team.name_en.to_lowercase(), team.flag);
            }
        }
    }

    // Fetch Games from ESPN API
    // We only fetch today's live/scheduled/finished games on the scoreboard
    let games_res = client
        .get("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard")
        .send()
        .await;

    let mut live_games: Option<Vec<Match>> = None;

    if let Ok(res) = games_res {
        if res.status().is_success() {
            if let Ok(payload) = res.json::<EspnScoreboard>().await {
                let mut parsed_matches = Vec::new();
                for event in payload.events {
                    if let Some(competition) = event.competitions.first() {
                        if competition.competitors.len() >= 2 {
                            let home = competition.competitors.iter().find(|c| c.home_away == "home").unwrap_or(&competition.competitors[0]);
                            let away = competition.competitors.iter().find(|c| c.home_away == "away").unwrap_or(&competition.competitors[1]);

                            let home_flag = team_map.get(&home.team.name.to_lowercase()).cloned().unwrap_or_default();
                            let away_flag = team_map.get(&away.team.name.to_lowercase()).cloned().unwrap_or_default();

                            let status = match event.status.status_type.state.as_str() {
                                "in" => MatchStatus::Live,
                                "pre" => MatchStatus::Scheduled,
                                "post" => MatchStatus::Finished,
                                _ => MatchStatus::Scheduled,
                            };

                            let display_clock = event.status.display_clock.clone();
                            let match_state = event.status.status_type.description.clone();

                            // Calculate red/yellow cards
                            let mut home_red_cards = 0;
                            let mut home_yellow_cards = 0;
                            let mut away_red_cards = 0;
                            let mut away_yellow_cards = 0;
                            
                            let mut home_scorers = String::new();
                            let mut away_scorers = String::new();

                            for detail in &competition.details {
                                let is_home = detail.team.id == home.team.id;
                                let is_away = detail.team.id == away.team.id;
                                
                                if detail.detail_type.text.contains("Red Card") {
                                    if is_home { home_red_cards += 1; }
                                    if is_away { away_red_cards += 1; }
                                } else if detail.detail_type.text.contains("Yellow Card") {
                                    if is_home { home_yellow_cards += 1; }
                                    if is_away { away_yellow_cards += 1; }
                                } else if detail.detail_type.text.contains("Goal") {
                                    let athlete = detail.athletes_involved.as_ref().and_then(|a| a.first()).map(|a| a.short_name.clone()).unwrap_or_else(|| "Unknown".to_string());
                                    let goal_str = format!("{} {}", athlete, detail.clock.display_value);
                                    if is_home {
                                        if !home_scorers.is_empty() { home_scorers.push_str(", "); }
                                        home_scorers.push_str(&goal_str);
                                    }
                                    if is_away {
                                        if !away_scorers.is_empty() { away_scorers.push_str(", "); }
                                        away_scorers.push_str(&goal_str);
                                    }
                                }
                            }

                            parsed_matches.push(Match {
                                id: event.id.parse().unwrap_or(0),
                                home_team: home.team.name.clone(),
                                away_team: away.team.name.clone(),
                                home_flag,
                                away_flag,
                                utc_kickoff: event.date.clone(),
                                local_kickoff: String::new(),
                                status,
                                minute: None, // We will use display_clock exclusively now
                                display_clock: Some(display_clock),
                                match_state: Some(match_state),
                                home_score: home.score.parse().ok(),
                                away_score: away.score.parse().ok(),
                                home_red_cards,
                                away_red_cards,
                                home_yellow_cards,
                                away_yellow_cards,
                                home_possession: get_stat(&home.statistics, "possessionPct"),
                                away_possession: get_stat(&away.statistics, "possessionPct"),
                                home_shots: get_stat(&home.statistics, "totalShots"),
                                away_shots: get_stat(&away.statistics, "totalShots"),
                                home_shots_on_target: get_stat(&home.statistics, "shotsOnTarget"),
                                away_shots_on_target: get_stat(&away.statistics, "shotsOnTarget"),
                                home_corners: get_stat(&home.statistics, "wonCorners"),
                                away_corners: get_stat(&away.statistics, "wonCorners"),
                                home_fouls: get_stat(&home.statistics, "foulsCommitted"),
                                away_fouls: get_stat(&away.statistics, "foulsCommitted"),
                                group: "Group Stage".to_string(),
                                stage: "GROUP".to_string(),
                                home_scorers,
                                away_scorers,
                                stadium_id: 0,
                                matchday: 1,
                            });
                        }
                    }
                }

                // Goal Detection Logic
                let cache = crate::polling::cache::DiskCache::new(handle.app_handle()).unwrap();
                let prev_games: Option<Vec<Match>> = cache.read_json("live_games").unwrap_or(None);
                
                if let Some(old_games) = prev_games {
                    for current_game in &parsed_matches {
                        if let Some(old_game) = old_games.iter().find(|g| g.id == current_game.id) {
                            let old_h = old_game.home_score.unwrap_or(0);
                            let old_a = old_game.away_score.unwrap_or(0);
                            let new_h = current_game.home_score.unwrap_or(0);
                            let new_a = current_game.away_score.unwrap_or(0);

                            if new_h > old_h || new_a > old_a {
                                #[derive(serde::Serialize, Clone)]
                                struct GoalEvent {
                                    match_id: u32,
                                    home_team: String,
                                    away_team: String,
                                    home_score: u8,
                                    away_score: u8,
                                    scoring_team: String,
                                    display_clock: String,
                                }
                                
                                let scoring_team = if new_h > old_h { &current_game.home_team } else { &current_game.away_team };
                                
                                let event = GoalEvent {
                                    match_id: current_game.id,
                                    home_team: current_game.home_team.clone(),
                                    away_team: current_game.away_team.clone(),
                                    home_score: new_h,
                                    away_score: new_a,
                                    scoring_team: scoring_team.to_string(),
                                    display_clock: current_game.display_clock.clone().unwrap_or_default(),
                                };
                                
                                let _ = handle.emit("goal-event", &event);
                            }
                        }
                    }
                }
                
                // Save new state
                let _ = cache.write_json("live_games", &parsed_matches);

                live_games = Some(parsed_matches);
            }
        }
    }

    let games_to_emit = live_games.unwrap_or_else(Vec::new);
    handle.emit("live-scores-update", &games_to_emit)?;

    Ok(())
}
