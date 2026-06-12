use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub struct DiskCache {
    cache_dir: PathBuf,
}

impl DiskCache {
    pub fn new(app: &AppHandle) -> anyhow::Result<Self> {
        let path = app.path().app_data_dir()?.join("wc2026_cache");
        if !path.exists() {
            fs::create_dir_all(&path)?;
        }
        Ok(Self { cache_dir: path })
    }

    pub fn write_json<T: serde::Serialize>(&self, key: &str, data: &T) -> anyhow::Result<()> {
        let file_path = self.cache_dir.join(format!("{}.json", key));
        let json = serde_json::to_string(data)?;
        fs::write(file_path, json)?;
        Ok(())
    }

    pub fn read_json<T: serde::de::DeserializeOwned>(&self, key: &str) -> anyhow::Result<Option<T>> {
        let file_path = self.cache_dir.join(format!("{}.json", key));
        if file_path.exists() {
            let json = fs::read_to_string(file_path)?;
            let data: T = serde_json::from_str(&json)?;
            Ok(Some(data))
        } else {
            Ok(None)
        }
    }
}
