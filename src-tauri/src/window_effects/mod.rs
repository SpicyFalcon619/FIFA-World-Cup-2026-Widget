#[cfg(target_os = "macos")]
pub mod macos;
#[cfg(target_os = "windows")]
pub mod windows;

pub fn apply_effects(window: &tauri::WebviewWindow) {
    #[cfg(target_os = "macos")]
    macos::apply_macos_vibrancy(window);
    
    #[cfg(target_os = "windows")]
    windows::apply_windows_acrylic(window);
}
