import { db } from "../lib/database.ts";

export default async function ConfiDB(){
 await db.execute(`
 CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

 CREATE TABLE IF NOT EXISTSCREATE TABLE pages (
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
        ON DELETE CASCADE
);
`);
}