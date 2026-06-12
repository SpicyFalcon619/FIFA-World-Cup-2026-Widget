fn main() {
    println!("cargo:rustc-env=API_FOOTBALL_KEY={}", std::env::var("API_FOOTBALL_KEY").unwrap_or_default());
    tauri_build::build()
}
