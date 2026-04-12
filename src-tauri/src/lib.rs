/// Detects whether the app is running from a proper installation or as a
/// standalone portable EXE. This drives the update UI in the frontend so
/// portable users are redirected to download rather than trying to auto-update.
///
/// Detection strategy (Windows):
///   1. NSIS installers always drop an "Uninstall *.exe" file right next to
///      the app binary in the installation directory — we look for that first.
///   2. MSI installers place the app under Program Files and register it with
///      Windows Installer — we fall back to a path check for those.
///   3. Anything that matches neither is treated as portable.
///
/// On non-Windows platforms (Linux, Android, etc.) we always return "installed"
/// because those platforms do not have a portable-EXE concept and the in-app
/// updater or the platform store handles updates natively.
#[tauri::command]
fn get_install_type() -> String {
  #[cfg(target_os = "windows")]
  {
    let exe = match std::env::current_exe() {
      Ok(p) => p,
      Err(_) => return "unknown".to_string(),
    };

    // ── NSIS check ────────────────────────────────────────────────────────
    // Tauri names the NSIS uninstaller "Uninstall {productName}.exe".
    // Scanning the sibling files is more reliable than any path heuristic
    // because the user can choose any install directory during setup.
    if let Some(dir) = exe.parent() {
      let has_nsis_uninstaller = std::fs::read_dir(dir)
        .map(|entries| {
          entries.filter_map(|e| e.ok()).any(|entry| {
            let name = entry.file_name().to_string_lossy().to_lowercase();
            name.starts_with("uninstall") && name.ends_with(".exe")
          })
        })
        .unwrap_or(false);

      if has_nsis_uninstaller {
        return "installed".to_string();
      }
    }

    // ── MSI / system-wide check ───────────────────────────────────────────
    // MSI always installs to Program Files (no local uninstaller next to exe).
    let exe_lower = exe.to_string_lossy().to_lowercase();
    if exe_lower.contains("\\program files\\")
      || exe_lower.contains("\\program files (x86)\\")
    {
      return "installed".to_string();
    }

    // Nothing matched — treat as portable
    "portable".to_string()
  }

  #[cfg(not(target_os = "windows"))]
  "installed".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .invoke_handler(tauri::generate_handler![get_install_type])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
