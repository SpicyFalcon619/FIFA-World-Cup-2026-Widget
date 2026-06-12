#![allow(dead_code)]
#![allow(unused_imports)]

use serde::{Deserialize, Deserializer, Serialize};

// ------------------------------------
// New Models for worldcup26.ir API
// ------------------------------------

/// Handles both valid JSON strings AND the raw PostgreSQL array literals
/// that the worldcup26.ir API embeds directly (e.g. `{"J. Quiñones 9'","R. Jiménez 67'"}`).
/// serde_json will give us the raw bytes if the field is any JSON value.
fn deserialize_any_as_string<'de, D: Deserializer<'de>>(d: D) -> Result<String, D::Error> {
    use serde::de::Visitor;
    struct AnyString;
    impl<'de> Visitor<'de> for AnyString {
        type Value = String;
        fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            write!(f, "any value")
        }
        fn visit_str<E: serde::de::Error>(self, v: &str) -> Result<String, E> { Ok(v.to_owned()) }
        fn visit_string<E: serde::de::Error>(self, v: String) -> Result<String, E> { Ok(v) }
        fn visit_none<E: serde::de::Error>(self) -> Result<String, E> { Ok(String::new()) }
        fn visit_unit<E: serde::de::Error>(self) -> Result<String, E> { Ok(String::new()) }
        fn visit_i64<E: serde::de::Error>(self, v: i64) -> Result<String, E> { Ok(v.to_string()) }
        fn visit_u64<E: serde::de::Error>(self, v: u64) -> Result<String, E> { Ok(v.to_string()) }
    }
    d.deserialize_any(AnyString)
}

#[derive(Deserialize, Debug, Clone)]
pub struct WcGamesResponse {
    pub games: Vec<WcGame>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct WcGame {
    pub id: String,
    pub home_team_id: String,
    pub away_team_id: String,
    pub home_score: String,
    pub away_score: String,
    /// Raw PostgreSQL array or "null" string — must use any-string deserializer
    #[serde(default, deserialize_with = "deserialize_any_as_string")]
    pub home_scorers: String,
    #[serde(default, deserialize_with = "deserialize_any_as_string")]
    pub away_scorers: String,
    pub group: String,
    pub matchday: String,
    pub local_date: String,
    pub finished: String,
    pub time_elapsed: String,
    #[serde(default)]
    pub stadium_id: String,
    #[serde(rename = "type")]
    pub match_type: String,
    pub home_team_label: Option<String>,
    pub away_team_label: Option<String>,
    pub home_team_name_en: Option<String>,
    pub away_team_name_en: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct WcTeamsResponse {
    pub teams: Vec<WcTeam>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct WcTeam {
    pub id: String,
    pub name_en: String,
    pub flag: String,
}

#[derive(Deserialize, Debug, Clone)]
pub struct WcGroupsResponse {
    pub groups: Vec<WcGroup>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct WcGroup {
    pub name: String,
    pub teams: Vec<WcGroupTeam>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct WcGroupTeam {
    pub team_id: String,
    pub mp: String,
    pub w: String,
    pub l: String,
    pub d: String,
    pub pts: String,
    pub gf: String,
    pub ga: String,
    pub gd: String,
}
