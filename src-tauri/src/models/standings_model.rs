use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TeamStanding {
    pub position: u8,
    pub team: String,
    pub flag: String,
    pub played: u8,
    pub won: u8,
    pub drawn: u8,
    pub lost: u8,
    pub gf: u8,
    pub ga: u8,
    pub gd: i8,
    pub points: u8,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Group {
    pub name: String,
    pub standings: Vec<TeamStanding>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct TopScorer {
    pub player: String,
    pub team: String,
    pub flag: String,
    pub goals: u8,
    pub assists: u8,
}
