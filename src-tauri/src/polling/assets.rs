#![allow(dead_code)]
#![allow(unused_imports)]

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Deserialize, Debug)]
pub struct SportsDbResponse {
    pub teams: Option<Vec<SportsDbTeam>>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SportsDbTeam {
    #[serde(rename = "strTeam")]
    pub str_team: String,
    #[serde(rename = "strTeamBadge")]
    pub str_team_badge: Option<String>,
}

#[derive(Clone, Default)]
pub struct AssetCache {
    /// Maps team name (lowercase) to badge URL
    pub badges: HashMap<String, String>,
}

impl AssetCache {
    pub fn get_badge(&self, team_name: &str) -> Option<String> {
        self.badges.get(&team_name.to_lowercase()).cloned()
    }
}

pub async fn fetch_assets(client: &Client) -> anyhow::Result<AssetCache> {
    let url = "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=FIFA%20World%20Cup";
    let resp = client.get(url).send().await?;
    
    if !resp.status().is_success() {
        log::error!("Failed to fetch from TheSportsDB: {}", resp.status());
        return Ok(AssetCache::default());
    }

    let payload: SportsDbResponse = resp.json().await?;
    let mut cache = AssetCache::default();

    if let Some(teams) = payload.teams {
        for team in teams {
            if let Some(badge) = team.str_team_badge {
                cache.badges.insert(team.str_team.to_lowercase(), badge);
            }
        }
    }

    Ok(cache)
}
