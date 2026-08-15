mod modules;

use modules::fs::save_projects::newProject;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations(
                    "sqlite:glownote.db",
                    vec![
                        tauri_plugin_sql::Migration {
                            version: 1,
                            description: "create projects and pages tables",
                            sql: "
                                CREATE TABLE IF NOT EXISTS projects (
                                    id TEXT PRIMARY KEY,
                                    title TEXT NOT NULL,
                                    created_at INTEGER NOT NULL,
                                    updated_at INTEGER NOT NULL
                                );

                                CREATE TABLE IF NOT EXISTS pages (
                                    id TEXT PRIMARY KEY,
                                    project_id TEXT NOT NULL,
                                    title TEXT NOT NULL,
                                    emoji TEXT,
                                    document_path TEXT NOT NULL,
                                    parent_id TEXT,
                                    position INTEGER NOT NULL DEFAULT 0,
                                    created_at INTEGER NOT NULL,
                                    updated_at INTEGER NOT NULL,

                                    FOREIGN KEY (project_id)
                                        REFERENCES projects(id)
                                        ON DELETE CASCADE,

                                    FOREIGN KEY (parent_id)
                                        REFERENCES pages(id)
                                        ON DELETE CASCADE
                                );
                            ",
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            newProject
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}