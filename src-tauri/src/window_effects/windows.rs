#![cfg(target_os = "windows")]

use window_vibrancy::apply_acrylic;

pub fn apply_windows_acrylic(window: &tauri::WebviewWindow) {
    // Relying on CSS backdrop-filter for clipping to rounded corners instead
    // let _ = apply_acrylic(window, Some((10, 10, 10, 125)));
}
