use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MatchStatus {
    Scheduled,
    Live,
    Paused,
    Finished,
    Postponed,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Match {
    pub id: u32,
    pub home_team: String,
    pub away_team: String,
    pub home_flag: String,
    pub away_flag: String,
    pub utc_kickoff: String,
    pub local_kickoff: String,
    pub status: MatchStatus,
    pub minute: Option<u8>,
    pub display_clock: Option<String>,
    pub match_state: Option<String>,
    pub home_score: Option<u8>,
    pub away_score: Option<u8>,
    pub home_red_cards: u8,
    pub away_red_cards: u8,
    pub home_yellow_cards: u8,
    pub away_yellow_cards: u8,
    pub home_possession: Option<String>,
    pub away_possession: Option<String>,
    pub home_shots: Option<String>,
    pub away_shots: Option<String>,
    pub home_shots_on_target: Option<String>,
    pub away_shots_on_target: Option<String>,
    pub home_corners: Option<String>,
    pub away_corners: Option<String>,
    pub home_fouls: Option<String>,
    pub away_fouls: Option<String>,
    pub group: String,
    pub stage: String,
    pub home_scorers: String,
    pub away_scorers: String,
    pub stadium_id: u8,
    pub matchday: u8,
}
