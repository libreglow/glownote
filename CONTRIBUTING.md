# Contributing to GlowNote

Thank you for your interest in contributing to GlowNote.

GlowNote is an open-source, local-first note-taking application built with React, TypeScript, Rust, Tauri, and SQLite.

Contributions are welcome, including bug fixes, improvements, documentation, testing, and new features.

## Before You Start

Before making a contribution, please:

1. Check the existing issues.
2. Search for existing discussions or pull requests.
3. Make sure your contribution fits the project's goals.
4. For large features, open an issue first to discuss the idea.

This helps avoid duplicated work and keeps the project focused.

## Development Environment

### Requirements

You will need:

- Node.js
- npm
- Rust
- Cargo
- Tauri system dependencies
- Git

### Clone the Repository

```bash
git clone https://github.com/LibreGlow/GlowNote.git
cd GlowNote
````

### Install Dependencies

```bash
npm install
```

### Start the Development Application

```bash
npm run tauri dev
```

## Project Structure

```text
GlowNote/
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
├── README.md
└── CONTRIBUTING.md
```

## Architecture

GlowNote separates application metadata from document content.

```text
React
  │
  ▼
Tauri
  │
  ▼
Rust
  │
  ├── SQLite
  │     └── Metadata
  │
  └── Filesystem
        └── Markdown documents
```

When working on the project, keep this separation in mind.

### React

React is responsible for:

* UI
* User interactions
* Application state
* Rendering

### Rust / Tauri

Rust is responsible for:

* Filesystem operations
* Native operations
* Commands exposed to the frontend
* Operations that should not be performed directly by the frontend

### SQLite

SQLite stores metadata such as:

* Projects
* Pages
* Page hierarchy
* Titles
* Emojis
* Paths
* Positions
* Timestamps

### Markdown

Markdown files contain the actual page content.

## Coding Guidelines

### TypeScript

Use TypeScript instead of JavaScript for new code.

Prefer clear types over `any`.

```ts
type Project = {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
};
```

Keep components focused and avoid putting large amounts of business logic directly inside UI components.

### React

Prefer functional components and React hooks.

Avoid unnecessary global state.

Keep data access logic separate from presentation where possible.

### Rust

Follow standard Rust conventions.

Use:

```bash
cargo fmt
```

before committing Rust code.

Check the project with:

```bash
cargo check
```

Avoid unnecessary `unwrap()` in production code.

Prefer returning meaningful errors:

```rust
Result<T, String>
```

or an appropriate custom error type.

### Formatting

Use Prettier for frontend code:

```bash
npx prettier --write .
```

Use Rust Formatter:

```bash
cargo fmt
```

## Database Changes

Database schema changes should be handled through migrations.

Do not modify an existing migration that may already have been released.

Instead, create a new migration.

For example:

```text
Migration 1
    ↓
Initial database

Migration 2
    ↓
Add tags

Migration 3
    ↓
Add backlinks
```

This keeps existing user databases compatible with newer versions of GlowNote.

## Filesystem Changes

Be careful when modifying filesystem operations.

GlowNote stores user documents on disk.

Never:

* Delete user documents without an explicit reason.
* Overwrite unrelated files.
* Construct unsafe paths from untrusted input.
* Assume a specific user's home directory.
* Store absolute user-specific paths in SQLite when a relative path is sufficient.

Prefer platform-independent path handling with Rust's `PathBuf` and `Path`.

## Pull Requests

Create a separate branch for your work.

Example:

```bash
git checkout -b feature/search
```

or:

```bash
git checkout -b fix/page-loading
```

Make your changes and commit them:

```bash
git add .
git commit -m "feat: add page search"
```

Push the branch:

```bash
git push origin feature/search
```

Then open a Pull Request.

## Commit Messages

Use clear and descriptive commit messages.

Preferred format:

```text
feat: add page search
fix: prevent duplicate project creation
refactor: improve filesystem module
docs: update installation instructions
chore: update dependencies
```

Common prefixes:

* `feat` — New feature
* `fix` — Bug fix
* `refactor` — Code restructuring
* `docs` — Documentation
* `test` — Tests
* `chore` — Maintenance
* `perf` — Performance improvement

## Pull Request Guidelines

A good Pull Request should:

* Have a clear title.
* Explain what was changed.
* Explain why the change was necessary.
* Keep the scope focused.
* Avoid unrelated changes.
* Include screenshots for significant UI changes.
* Include tests when appropriate.
* Pass formatting and build checks.

For example:

```md
## What changed?

Added lazy loading for the project list.

## Why?

Large projects lists should not load every project into React at once.

## Testing

- Tested with 1,000 projects.
- Verified pagination.
- Verified empty state.
```

## Bug Reports

When reporting a bug, provide:

* Operating system
* GlowNote version
* Steps to reproduce
* Expected behavior
* Actual behavior
* Error messages
* Screenshots or logs when useful

Example:

```md
## Bug

Projects disappear after restarting GlowNote.

## Steps to Reproduce

1. Create a project.
2. Close GlowNote.
3. Reopen GlowNote.
4. Project is missing.

## Expected Behavior

The project should remain available after restarting the application.

## Environment

OS: Ubuntu 24.04
GlowNote: 0.1.0
```

## Feature Requests

Feature requests are welcome.

Please explain:

* What problem the feature solves.
* Why it would be useful.
* How you expect it to work.
* Any alternative solutions you considered.

Avoid requesting a feature only because another application has it.

GlowNote should remain focused on its own design goals.

## Security Issues

Please do not publicly disclose serious security vulnerabilities before they can be investigated.

For security-sensitive issues, contact the project maintainers privately.

Do not include:

* Passwords
* API keys
* Private documents
* Personal information
* Authentication tokens

in issues or pull requests.

## Performance

Performance matters to GlowNote.

When working on performance-sensitive areas:

* Avoid unnecessary database queries.
* Avoid loading large document collections into memory.
* Prefer pagination for large lists.
* Avoid unnecessary React re-renders.
* Use Rust for filesystem-heavy operations when appropriate.
* Do not sacrifice correctness for micro-optimizations.

## Code of Conduct

All contributors are expected to communicate respectfully and constructively.

Harassment, personal attacks, discrimination, and intentionally disruptive behavior are not acceptable.

Technical disagreements are normal. Focus discussions on the code, architecture, and evidence rather than individuals.

## License

By contributing to GlowNote, you agree that your contributions may be distributed under the project's license.

The project license will be specified in the repository.

## Questions

If you are unsure about an implementation or architectural decision, open an issue or discussion before making a large change.

Small improvements and bug fixes can usually be submitted directly as Pull Requests.

Thank you for contributing to GlowNote.