use tauri::Manager;
use tauri::Emitter;
use crate::models::api_response::{WcGroupsResponse, WcTeamsResponse};
use crate::models::standings_model::{Group, TeamStanding};
use crate::polling::cache::DiskCache;

pub async fn fetch_and_emit(handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let cache = DiskCache::new(handle.app_handle()).unwrap();
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
                team_map.insert(team.id.clone(), (team.name_en, team.flag));
            }
        }
    }

    // Fetch Groups
    let groups_res = client
        .get("https://worldcup26.ir/get/groups")
        .send()
        .await;

    let mut groups: Option<Vec<Group>> = None;

    if let Ok(res) = groups_res {
        if res.status().is_success() {
            if let Ok(payload) = res.json::<WcGroupsResponse>().await {
                let mut parsed_groups = Vec::new();
                for group in payload.groups {
                    let mut standings = Vec::new();
                    
                    // Sort teams by points (pts) in descending order, then goal difference (gd)
                    let mut sorted_teams = group.teams.clone();
                    sorted_teams.sort_by(|a, b| {
                        let pts_a = a.pts.parse::<u8>().unwrap_or(0);
                        let pts_b = b.pts.parse::<u8>().unwrap_or(0);
                        if pts_a != pts_b {
                            pts_b.cmp(&pts_a)
                        } else {
                            let gd_a = a.gd.parse::<i8>().unwrap_or(0);
                            let gd_b = b.gd.parse::<i8>().unwrap_or(0);
                            gd_b.cmp(&gd_a)
                        }
                    });

                    for (i, t) in sorted_teams.iter().enumerate() {
                        let (name, flag) = team_map.get(&t.team_id).cloned().unwrap_or((format!("Team {}", t.team_id), String::new()));
                        standings.push(TeamStanding {
                            position: (i + 1) as u8,
                            team: name,
                            flag,
                            played: t.mp.parse().unwrap_or(0),
                            won: t.w.parse().unwrap_or(0),
                            drawn: t.d.parse().unwrap_or(0),
                            lost: t.l.parse().unwrap_or(0),
                            gf: t.gf.parse().unwrap_or(0),
                            ga: t.ga.parse().unwrap_or(0),
                            gd: t.gd.parse().unwrap_or(0),
                            points: t.pts.parse().unwrap_or(0),
                        });
                    }

                    parsed_groups.push(Group {
                        name: group.name,
                        standings,
                    });
                }
                
                // Sort groups alphabetically
                parsed_groups.sort_by(|a, b| a.name.cmp(&b.name));

                if !parsed_groups.is_empty() {
                    let _ = cache.write_json("standings", &parsed_groups);
                    groups = Some(parsed_groups);
                }
            }
        }
    }

    if groups.is_none() {
        groups = cache.read_json("standings").unwrap_or(None);
    }

    let g_to_emit = groups.unwrap_or_else(Vec::new);
    handle.emit("standings-update", &g_to_emit)?;

    Ok(())
}
