#[tauri::command]
pub fn set_always_on_top(window: tauri::WebviewWindow, enable: bool) -> Result<(), String> {
    window.set_always_on_top(enable).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn drag_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_desktop_layer(window: tauri::WebviewWindow, enable: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::WindowsAndMessaging::{
            SetWindowPos, HWND_BOTTOM, HWND_NOTOPMOST, SWP_NOMOVE, SWP_NOSIZE, SWP_NOACTIVATE,
        };

        if let Ok(hwnd) = window.hwnd() {
            let hwnd = windows::Win32::Foundation::HWND(hwnd.0 as _);
            unsafe {
                if enable {
                    let _ = SetWindowPos(
                        hwnd,
                        HWND_BOTTOM,
                        0,
                        0,
                        0,
                        0,
                        SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
                    );
                } else {
                    let _ = SetWindowPos(
                        hwnd,
                        HWND_NOTOPMOST,
                        0,
                        0,
                        0,
                        0,
                        SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
                    );
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        log::warn!("set_desktop_layer stub: window={}, enable={}", window.label(), enable);
    }

    Ok(())
}
