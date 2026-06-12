use tauri_plugin_notification::NotificationExt;

#[allow(dead_code)]
pub fn send_goal_notification(
    handle: &tauri::AppHandle,
    home: &str,
    away: &str,
    scorer_team: &str,
    minute: u8,
) {
    let title = format!("⚽ GOAL! {} vs {}", home, away);
    let body = format!("{} scored in the {}' !", scorer_team, minute);

    if let Err(e) = handle
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show()
    {
        log::warn!("Failed to send goal notification: {}", e);
    }
}
