# GlowNote

A fast, local-first note-taking and knowledge management application built with **Tauri, React, Rust, and SQLite**.

GlowNote is designed to provide a simple and powerful workspace for creating projects, organizing pages, and storing content locally without depending on a cloud service.

## Features

- Local-first architecture
- Projects and nested pages
- Markdown-based page storage
- SQLite for application metadata
- Fast native backend powered by Rust
- React-based user interface
- Desktop application powered by Tauri
- Offline-first
- Lightweight and resource-efficient
- Automatic page and project organization
- Emoji support for pages

## Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend

- Rust
- Tauri

### Storage

- SQLite
- Markdown (`.md`) files

## Architecture

GlowNote separates application metadata from document content.

```text
GlowNote
│
├── React
│   └── User Interface
│
├── Tauri
│   └── Application bridge
│
├── Rust
│   ├── Filesystem
│   └── Native operations
│
├── SQLite
│   └── Metadata
│
└── Markdown files
    └── Page content
````

### SQLite

SQLite stores metadata and relationships between projects and pages.

```text
projects
├── id
├── title
├── created_at
└── updated_at

pages
├── id
├── project_id
├── title
├── emoji
├── document_path
├── parent_id
├── position
├── created_at
└── updated_at
```

### Markdown Files

Page content is stored separately as Markdown files.

Example:

```text
Documents/
└── glownote/
    └── projects/
        └── project-id/
            └── pages/
                ├── page-id.md
                ├── another-page.md
                └── ...
```

This keeps the database small and makes document content portable and human-readable.

## Project Structure

```text
glownote/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── ...
│
├── src-tauri/
│   ├── src/
│   │   ├── modules/
│   │   │   └── fs/
│   │   │       └── save_projects.rs
│   │   │
│   │   └── lib.rs
│   │
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── package.json
└── README.md
```

## Storage Model

GlowNote uses two separate storage layers.

### Application Database

SQLite is used for:

* Projects
* Pages
* Page hierarchy
* Titles
* Emojis
* File paths
* Positions
* Timestamps

### Document Storage

Markdown files are used for:

* Page content
* Large text documents
* Human-readable document data

This avoids storing large documents directly inside SQLite rows.

## Development

### Requirements

* Node.js
* npm
* Rust
* Cargo
* Tauri prerequisites for your operating system

### Install dependencies

```bash
npm install
```

### Start development

```bash
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

The production build can be performed through GitHub Actions to avoid using local system resources.

## Database

GlowNote uses `tauri-plugin-sql` for SQLite.

The database is managed separately from the document files.

Example:

```text
SQLite
~/.local/share/com.libreglow.glownote/glownote.db

Documents
~/Documents/glownote/projects/
```

The exact application data directory depends on the platform and application identifier.

## Design Goals

GlowNote is being designed around a few principles:

### Local First

Your notes should remain available without an internet connection.

### Fast

Heavy operations should be handled by Rust whenever possible.

### Simple Storage

Documents should remain understandable outside of GlowNote.

### Privacy

User documents should not require a cloud backend.

### Extensible

The architecture should allow future features such as:

* Search
* Full-text search
* Tags
* Backlinks
* Attachments
* Import/export
* Encryption
* Sync
* Version history
* Themes
* Plugins

## Roadmap

* [x] Tauri application
* [x] React interface
* [x] Rust filesystem operations
* [x] SQLite integration
* [x] Project creation
* [x] Markdown page storage
* [x] Page hierarchy database schema

## Contributing

Contributions, ideas, bug reports, and feature requests are welcome.

Before submitting a pull request, make sure the project builds successfully and that the existing functionality continues to work.

## License

MIT
---

**GlowNote** — A local-first workspace for your notes and knowledge.

