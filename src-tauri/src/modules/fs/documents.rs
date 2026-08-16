use std::fs;
use tauri::Manager;

#[tauri::command]
pub fn readDocument(app: tauri::AppHandle, path: String) -> Result<String, String> {
    let documents = app.path().document_dir().map_err(|e| e.to_string())?;

    let file_path = documents.join("glownote").join(path);

    fs::read_to_string(file_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn saveDocument(app: tauri::AppHandle, path: String, content: String) -> Result<(), String> {
    let documents = app.path().document_dir().map_err(|e| e.to_string())?;

    let file_path = documents.join("glownote").join(path);

    fs::write(file_path, content).map_err(|e| e.to_string())
}