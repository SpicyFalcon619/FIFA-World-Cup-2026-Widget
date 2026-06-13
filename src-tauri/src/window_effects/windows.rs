#![cfg(target_os = "windows")]

use window_vibrancy::{apply_acrylic, clear_blur};
use windows::Win32::Graphics::Dwm::{DwmSetWindowAttribute, DWMWA_BORDER_COLOR, DWMWA_COLOR_NONE};
use windows::Win32::Foundation::HWND;

pub fn apply_windows_acrylic(window: &tauri::WebviewWindow) {
    let _ = clear_blur(window);

    // Completely remove the Windows 11 DWM border on transparent windows
    if let Ok(hwnd) = window.hwnd() {
        let hwnd_w = HWND(hwnd.0 as _);
        unsafe {
            let color = DWMWA_COLOR_NONE;
            let _ = DwmSetWindowAttribute(
                hwnd_w,
                DWMWA_BORDER_COLOR,
                &color as *const _ as *const core::ffi::c_void,
                std::mem::size_of::<u32>() as u32,
            );
        }
    }
}
