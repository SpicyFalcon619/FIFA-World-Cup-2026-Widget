#![cfg(target_os = "macos")]

use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

pub fn apply_macos_vibrancy(window: &tauri::WebviewWindow) {
    let _ = apply_vibrancy(window, NSVisualEffectMaterial::UnderWindow, None, Some(16.0));
}
