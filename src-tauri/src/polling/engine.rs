use std::time::Duration;
use tokio::time::interval;

pub fn start_polling_engine(handle: tauri::AppHandle) {
    // Task A: Live Scores (Throttled to 4-5 mins)
    let handle_a = handle.clone();
    tauri::async_runtime::spawn(async move {
        // Initial delay
        tokio::time::sleep(Duration::from_secs(2)).await;
        // 30 seconds for live scores
        let mut int = interval(Duration::from_secs(30));
        loop {
            int.tick().await;
            if let Err(e) = crate::polling::live_scores::fetch_and_emit(&handle_a).await {
                log::warn!("Live scores polling failed: {}", e);
            }
        }
    });

    // Task B: Schedule (Every 5 mins)
    let handle_b = handle.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(Duration::from_secs(4)).await;
        // 300s = 5 minutes
        let mut int = interval(Duration::from_secs(300));
        loop {
            int.tick().await;
            if let Err(e) = crate::polling::schedule::fetch_and_emit(&handle_b).await {
                log::warn!("Schedule polling failed: {}", e);
            }
        }
    });

    // Task C: Standings (Every 5 mins)
    let handle_c = handle.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(Duration::from_secs(6)).await;
        // 300s = 5 minutes
        let mut int = interval(Duration::from_secs(300));
        loop {
            int.tick().await;
            if let Err(e) = crate::polling::standings::fetch_and_emit(&handle_c).await {
                log::warn!("Standings polling failed: {}", e);
            }
        }
    });
}
