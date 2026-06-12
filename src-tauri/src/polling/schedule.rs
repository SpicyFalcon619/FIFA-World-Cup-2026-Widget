use tauri::Manager;
use tauri::Emitter;
use crate::models::api_response::{WcGamesResponse, WcTeamsResponse};
use crate::models::match_model::{Match, MatchStatus};
use crate::polling::cache::DiskCache;
use std::collections::HashMap;

pub async fn fetch_and_emit(handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let cache = DiskCache::new(handle.app_handle()).unwrap();
    
    // Fetch Teams
    let client = reqwest::Client::new();
    let teams_res = client
        .get("https://worldcup26.ir/get/teams")
        .send()
        .await;

    let mut team_map = HashMap::new();
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

    let mut matches: Option<Vec<Match>> = None;

    if let Ok(res) = games_res {
        if res.status().is_success() {
            if let Ok(payload) = res.json::<WcGamesResponse>().await {
                let mut parsed_matches = Vec::new();
                for game in payload.games {
                    let status = if game.finished.to_lowercase() == "true" {
                        MatchStatus::Finished
                    } else if game.time_elapsed != "notstarted" {
                        MatchStatus::Live
                    } else {
                        MatchStatus::Scheduled
                    };

                    let minute = game.time_elapsed.parse::<u8>().ok();

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
                        status,
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

                if !parsed_matches.is_empty() {
                    let _ = cache.write_json("schedule", &parsed_matches);
                    matches = Some(parsed_matches);
                }
            }
        }
    }

    if matches.is_none() {
        matches = cache.read_json("schedule").unwrap_or(None);
    }

    let m_to_emit = matches.unwrap_or_else(Vec::new);
    handle.emit("schedule-update", &m_to_emit)?;

    Ok(())
}
