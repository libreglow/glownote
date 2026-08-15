use std::fs;
use tauri::Manager;

#[tauri::command]
pub fn newProject(app : tauri::AppHandle ,   page_id: String, projectId : String , content  : String) -> Result<() , String> {
  let documents = app.path().document_dir().map_err(|e| e.to_string())?;

  let pages_dir = documents.join("glownote").join("projects").join(projectId).join("pages");

  fs::create_dir_all(&pages_dir).map_err(|e| e.to_string())?;

  let page_path = pages_dir.join(format!("{}.md" , page_id));

  fs::write(&page_path , content).map_err(|e| e.to_string())?;

     Ok(())
}