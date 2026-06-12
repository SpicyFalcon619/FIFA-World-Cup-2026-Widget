use std::str::FromStr;

#[tauri::command]
pub fn get_system_timezone() -> String {
    iana_time_zone::get_timezone().unwrap_or_else(|_| "UTC".to_string())
}

#[tauri::command]
pub fn convert_utc_to_local(utc_iso: String, tz_name: String) -> Result<String, String> {
    let dt = chrono::DateTime::parse_from_rfc3339(&utc_iso).map_err(|e| e.to_string())?;
    let tz = chrono_tz::Tz::from_str(&tz_name).map_err(|e| e.to_string())?;
    let local_dt = dt.with_timezone(&tz);
    Ok(local_dt.format("%d %b %H:%M").to_string())
}
