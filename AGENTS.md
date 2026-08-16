# AGENTS.md

Tauri 2 desktop app: React 19 + TypeScript + Vite frontend in `src/`, Rust backend in `src-tauri/`, SQLite via `tauri-plugin-sql`, page content stored as Markdown files on disk. No tests and no linter exist anywhere in the repo.

## Commands

- `npm run tauri dev` — run the full desktop app (Vite on strict port 1420 + `cargo run`). The app only works inside Tauri; `npm run dev` alone serves the frontend but all `@tauri-apps/plugin-sql` and `invoke` calls fail.
- `npm run build` — `tsc && vite build`. There is no separate typecheck script; `tsc` only runs inside this build. Type errors are caught by `npm run build` (or `npx tsc`).
- `npx prettier --write .` — frontend formatting (`.prettierrc`: semi, singleQuote, trailingComma all).
- Rust: `cargo fmt`, `cargo check`, `cargo clippy` run in `src-tauri/`. New Rust code should follow the repo-local `rust-best-practices` skill (`.agents/skills/`).

## Architecture

- **No react-router.** Routing is a hand-rolled zustand store (`src/store/navigation-store.ts`) with routes `welcome` | `home` | `editor`; `src/App.tsx` switches on `current.name`. New pages must be added to the `Route` type, the store, and the switch.
- **SQL is executed from the frontend**, not Rust. `src/lib/database.ts` loads the DB at module top level (`await Database.load('sqlite:glownote.db')`); pages run raw SQL via `db.select`/`db.execute`. E.g. `src/pages/editor/editor.tsx:24`.
- **Schema lives in Rust**: migrations are inline in `src-tauri/src/lib.rs` via `tauri_plugin_sql::Builder::add_migrations`. Changing the schema = add a new migration in `lib.rs` AND update the frontend queries. Never edit an existing migration.
- **Rust commands**: `#[tauri::command]` fns under `src-tauri/src/modules/`, manually registered in `generate_handler![...]` in `lib.rs`. Names are camelCase (e.g. `newProject`), not snake_case. `newProject` writes markdown to `~/Documents/glownote/projects/{projectId}/pages/{id}.md`.
- **Window is borderless** (`"decorations": false` in `tauri.conf.json`) with a custom `TitleBar` in `src/components/modules/title-bar.tsx`. Window controls use capabilities from `src-tauri/capabilities/default.json`; new window/plugin permissions must be added there (e.g. `sql:allow-execute`).

## Frontend conventions

- Path alias `@/*` → `./src/*`.
- Tailwind v4, CSS-first config in `src/App.css` (no `tailwind.config`). shadcn/ui config in `components.json` (style `base-nova`) with extra registries `@grootstudio`, `@beui`, `@optics`; add generated components with `npx shadcn add <name> -r <registry>`. Component categories: `components/ui` (shadcn), `components/grootstudio`, `components/motion`, `components/optics`, `components/modules`.
- State: zustand; UI components should stay thin and call the SQL/`invoke` layer (`src/lib`, `src/storage`) rather than inlining queries.

## Gotchas

- No CI workflows exist (`.github/` absent) and no test framework is installed — verification = `cargo check` + `npm run build` + manual run of `npm run tauri dev`.
- `src/App.tsx:18` renders `<Editor id="" />` but the editor actually reads `current.params` from the store; don't rely on the `id` prop.
- Repo-local agent skills live in `.agents/skills/` (frontend-design, react, rust-best-practices), pinned by `skills-lock.json` — load them via the skill tool when the task matches.