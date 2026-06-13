use tauri::Manager;
use tauri::Emitter;
use crate::models::api_response::{WcGamesResponse, WcTeamsResponse};
use crate::models::match_model::{Match, MatchStatus};

pub async fn fetch_and_emit(handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let client = reqwest::Client::new();
    
    // Fetch Teams
    let teams_res = client
        .get("https://worldcup26.ir/get/teams")
        .send()
        .await;

    let mut team_map = std::collections::HashMap::new();
    if let Ok(res) = teams_res {
        if let Ok(payload) = res.json::<WcTeamsResponse>().await {
            for team in payload.teams {
                team_map.insert(team.id, team.flag);
            }
        }
    }

    // Fetch Games
    let games_res = client
        .get("https://worldcup26.ir/get/games")
        .send()
        .await;

    let mut live_games: Option<Vec<Match>> = None;

    if let Ok(res) = games_res {
        if res.status().is_success() {
            if let Ok(payload) = res.json::<WcGamesResponse>().await {
                let mut parsed_matches = Vec::new();
                for game in payload.games {
                    if game.finished.to_lowercase() != "true" && game.time_elapsed != "notstarted" {
                        let minute_str = game.time_elapsed.replace("'", "");
                        let minute = minute_str.parse::<u8>().ok();

                        let home_flag = team_map.get(&game.home_team_id).cloned().unwrap_or_default();
                        let away_flag = team_map.get(&game.away_team_id).cloned().unwrap_or_default();

                        let stage = match game.match_type.to_lowercase().as_str() {
                            "group" => "GROUP",
                            "r32" => "R32",
                            "r16" => "R16",
                            "qf" => "QF",
                            "sf" => "SF",
                            "third" => "THIRD",
                            "final" => "F",
                            _ => "F",
                        }.to_string();

                        parsed_matches.push(Match {
                            id: game.id.parse().unwrap_or(0),
                            home_team: game.home_team_name_en.clone().or(game.home_team_label.clone()).unwrap_or_else(|| "TBD".to_string()),
                            away_team: game.away_team_name_en.clone().or(game.away_team_label.clone()).unwrap_or_else(|| "TBD".to_string()),
                            home_flag,
                            away_flag,
                            utc_kickoff: game.local_date,
                            local_kickoff: String::new(),
                            status: MatchStatus::Live,
                            minute,
                            home_score: game.home_score.parse().ok(),
                            away_score: game.away_score.parse().ok(),
                            home_red_cards: 0,
                            away_red_cards: 0,
                            group: game.group.clone(),
                            stage,
                            home_scorers: game.home_scorers.clone(),
                            away_scorers: game.away_scorers.clone(),
                            stadium_id: game.stadium_id.parse().unwrap_or(0),
                            matchday: game.matchday.parse().unwrap_or(0),
                        });
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
                                    minute: u8,
                                }
                                
                                let scoring_team = if new_h > old_h { &current_game.home_team } else { &current_game.away_team };
                                
                                let event = GoalEvent {
                                    match_id: current_game.id,
                                    home_team: current_game.home_team.clone(),
                                    away_team: current_game.away_team.clone(),
                                    home_score: new_h,
                                    away_score: new_a,
                                    scoring_team: scoring_team.to_string(),
                                    minute: current_game.minute.unwrap_or(0),
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
