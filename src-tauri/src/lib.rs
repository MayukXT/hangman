/// Detects whether the app is running as a properly-installed binary
/// (via NSIS or MSI) or as a standalone portable EXE.
///
/// On Windows, Tauri's NSIS installer places the app in:
///   %LOCALAPPDATA%\Programs\<AppName>   (user-level install)
///   C:\Program Files\<AppName>           (system-level install)
///
/// A portable EXE is run from any other path (Desktop, USB, Downloads…).
/// We return "portable" in that case so the frontend can redirect the user
/// to download a new portable manually instead of running the NSIS installer.
#[tauri::command]
fn get_install_type() -> String {
  #[cfg(target_os = "windows")]
  {
    let exe = match std::env::current_exe() {
      Ok(p) => p,
      Err(_) => return "unknown".to_string(),
    };
    let exe_lower = exe.to_string_lossy().to_lowercase();

    let is_installed = exe_lower.contains("\\appdata\\local\\programs\\")
      || exe_lower.contains("\\program files\\")
      || exe_lower.contains("\\program files (x86)\\");

    if is_installed {
      "installed".to_string()
    } else {
      "portable".to_string()
    }
  }

  // On macOS / Linux there's no portable concept, treat as installed
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
