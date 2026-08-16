# GlowNote Design System

Single source of truth for GlowNote's visual language. Every value below is derived from the live code (`src/App.css`, `src/components/`, `src/pages/`); if a token here disagrees with the code, the code wins and this file should be updated.

## 1. Design Language

**"Warm glow, calm surface."** GlowNote is a local-first notes app; the interface is a quiet, warm-neutral surface with one accent family. The identity comes from three deliberate choices:

- **Coffee-brown primary** (`#644a40`) instead of a default blue — the accent is warm and organic, never corporate.
- **Amber secondary** (`#ffdfb5`) — the "glow" of the name: used for active states, the theme-switcher pill, and chart accents.
- **Large radii + soft springs** — surfaces feel soft and alive (`--radius: 16px`, pill CTAs, springy morphs) against a hairline-border, low-shadow depth system.

Restraint is the rule: near-white/near-black neutrals, one accent family, no gradients except on the wordmark, shadows barely visible.

## 2. Color

Semantic tokens are defined in `src/App.css` under `:root` (light) and `.dark` (dark), mapped into Tailwind theme utilities via `@theme inline` (e.g. `bg-background`, `text-muted-foreground`). Use semantic classes; never raw hex in components.

### Light

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f9f9f9` | App background |
| `--foreground` | `#202020` | Primary text |
| `--card` | `#fcfcfc` | Cards, popovers |
| `--card-foreground` | `#202020` | Text on cards |
| `--popover` | `#fcfcfc` | Popovers |
| `--primary` | `#644a40` | Coffee brown — primary buttons, focus rings |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#ffdfb5` | Amber — active pills, secondary buttons |
| `--secondary-foreground` | `#582d1d` | Dark brown on amber |
| `--muted` | `#efefef` | Hover fills, icon tiles |
| `--muted-foreground` | `#646464` | Secondary text, icons |
| `--accent` | `#e8e8e8` | Accent fills |
| `--destructive` | `#e54d2e` | Errors, close hover |
| `--border` | `#d8d8d8` | Hairline borders |
| `--input` | `#d8d8d8` | Input borders |
| `--ring` | `#644a40` | Focus rings |
| `--sidebar` / `--sidebar-*` | `#fbfbfb` family | Sidebar surfaces |

### Dark

| Token | Value | Usage |
|---|---|---|
| `--background` | `#111111` | App background |
| `--foreground` | `#eeeeee` | Primary text |
| `--card` / `--popover` | `#191919` | Elevated surfaces |
| `--primary` | `#ffe0c2` | Inverted accent — amber-primary on dark |
| `--primary-foreground` | `#081a1b` | Near-black on amber |
| `--secondary` | `#393028` | Muted brown |
| `--secondary-foreground` | `#ffe0c2` | Amber on brown |
| `--muted` | `#222222` | Hover fills |
| `--muted-foreground` | `#b4b4b4` | Secondary text |
| `--border` | `#201e18` | Hairline borders (warm-tinted black) |
| `--input` | `#484848` | Input borders |
| `--ring` | `#ffe0c2` | Focus rings |
| `--sidebar` | `#18181b` | Sidebar surfaces |

**Chart tokens** (`--chart-1..5`) mirror the palette: brown, amber, light, `#ffe6c4`, `#66493e` (light); amber, `#393028`, `#2a2a2a`, `#42382e`, `#ffe0c1` (dark).

**Palette rules:** only one accent family (brown → amber). Neutral ramps stay warm (`#201e18` borders in dark, not pure black). Destructive is the only hue that leaves the family, by design.

## 3. Typography

Fonts are **system stacks** defined in `src/App.css` (`--font-sans`, `--font-serif`, `--font-mono`) — no webfont is imported (`@fontsource-variable/geist` is installed but never loaded; `index.html` loads no fonts). Don't add webfonts without a discussion; system fonts keep the app fast and native-feeling.

### Scale (as used in the app)

| Usage | Classes | Where |
|---|---|---|
| Hero headline | `text-5xl → md:text-7xl font-extrabold tracking-tight` | Welcome page |
| Page heading | `text-4xl font-extrabold tracking-tight` | Home page `h1` |
| Modal heading | `text-2xl font-medium tracking-tight` | CenterMorphModal title |
| Card/row title | `text-base font-semibold` (Card default `font-medium`) | Home cards, project rows |
| Default body | `text-sm` | Buttons, inputs, paragraphs |
| Meta/captions | `text-xs text-muted-foreground` | Timestamps, footnotes |
| Wordmark | `font-extrabold` + `GradientText` | TitleBar |

**Conventions:** headings use `tracking-tight` (the smaller the size, the more tracking matters); secondary text is always `text-muted-foreground`, never a lighter foreground. Flips/shimmer text uses `font-light tracking-tighter`.

## 4. Radius, Shadow, Spacing

- **Radius:** `--radius: 1rem` → `rounded-sm` 12px, `rounded-md` 14px, `rounded-lg` 16px, `rounded-xl` 20px. *Caution:* Tailwind v4 defaults are overridden; `rounded-lg` is 16px here, not 8px.
- **Usage tiers:** controls `rounded-lg`; surfaces `rounded-xl`; panels `rounded-2xl/3xl`; **signature surfaces** `rounded-[30px]` (morph modal) and `rounded-[32px]` (dialog); pills `rounded-full` (primary CTAs: "Getting Started", "Continue", New Project).
- **Shadows:** deliberately subtle — all 2xs→2xl variants are `0 1px 3px hsl(0 0% 0% / 0.05–0.1)`; only `shadow-2xl` reaches `0.25` opacity. Prefer `ring-1` over shadows for depth (see §7).
- **Spacing:** Tailwind default `--spacing: 0.25rem`. Cards use a `--card-spacing` CSS var (16px; 12px at `size="sm"`) instead of fixed padding.

## 5. Theme System

- `ThemeProvider` (`src/components/theme/theme-provider.tsx`) toggles the `dark` class on `<html>`; values `'light' | 'dark' | 'system'` (system follows `prefers-color-scheme`).
- `ThemeSwitcher` (`src/components/optics/theme-switcher.tsx`) is the segmented control (Sun/Moon/Monitor) with a spring `layoutId="activeTheme"` pill.
- **Gotcha — two persistence keys:** `ThemeProvider` persists to `vite-ui-theme` (default param), but `src/storage/settings.ts` persists a *separate* `glownote-preferences` object, and the Welcome page re-implements system-theme tracking itself with its own `useEffect`. Changing theme in one place does not update the other. Prefer `storage/settings.ts` for new preferences; the duplication should eventually be consolidated.
- Dark mode is opt-out per component: use `dark:` variants when hardcoded values exist (e.g. modal borders, sidebar neutrals).

## 6. Motion Language

All animation uses `motion/react`. Canonical curves in `src/lib/ease.ts` — **use these constants, don't inline curves**:

- **Signature ease:** `EASE_OUT = [0.16, 1, 0.3, 1]` — every overlay/panel entrance.
- **Springs:** `SPRING_PRESS` (tappable press), `SPRING_SWAP` (content swaps), `SPRING_PANEL` (overlay entrances), `SPRING_LAYOUT` (shared-layout morphs), `SPRING_MOUSE` (cursor-follow), `SPRING_GLIDE` (dragged values, critically damped).
- **Durations:** entrances 0.2–0.6s; the morph-modal unfold is 0.43s with constant radius (`CENTER_UNFOLD_TRANSITION`); opacity fades 0.28–0.4s.

**Patterns:**
- Shared-layout morphs via `layoutId` for pills (theme switcher, sidebar hover background).
- Signature move: `CenterMorphModal` unfolds from the center with a `clip-path: inset(48% 48% ...)` → open animation.
- List reveals stagger children 0.035s (Select items).
- **Reduced motion is respected** — `useReducedMotion()` in Select + CenterMorphModal, `prefers-reduced-motion` in `GradientText`, `motion-safe:` on shine. New animated components must do the same.

## 7. Component Catalog

Sources: shadcn/ui `base-nova` style (`components.json`), Base UI primitives (`@base-ui/react`), beui motion components, grootstudio/optics registries.

### Core (components/ui)
- **Button** — variants `default | outline | secondary | ghost | destructive | link`; sizes `xs | sm | default | lg | icon | icon-xs | icon-sm | icon-lg`. Default `h-8 rounded-lg text-sm font-medium`; press feedback `active:translate-y-px`; icons 16px (`[&_svg]:size-4`); focus `ring-3 ring-ring/50`. Destructive is a tint (`bg-destructive/10`), not a fill. Pill CTAs: add `rounded-full` + `h-11` + `px-6`.
- **Input** — `h-8 rounded-lg border-input bg-transparent`, focus `ring-3 ring-ring/50`, dark variant `bg-input/30`. File inputs styled via `file:` utilities.
- **Card** — `rounded-xl bg-card ring-1 ring-foreground/10`, `--card-spacing` padding, `size="sm"` variant. CardFooter is `bg-muted/50 border-t`. Titles `text-base font-medium`.
- **Modal** (`dialog.tsx`) — frosted-glass dialog: `rounded-[32px] backdrop-blur-2xl`, thick light border (`border-[6px] border-[#F2F2F2]`), dark mode glow blob + radial vignette. **Contains hardcoded colors** — the one place that intentionally breaks token discipline; keep it that way or migrate to tokens deliberately.
- **GooeyInput** — search field that morphs icon-bubble → input via an SVG gooey filter (`feGaussianBlur` + color matrix). Surface is inverted: `bg-foreground text-background`. Spring `bounce: 0.25, duration: 0.4`.
- **ShineBorder** — animated gradient border (mask-composite), `motion-safe:animate-shine` keyframes in `App.css`.

### Motion (components/motion)
- **CenterMorphModal** (beui) — portal dialog unfolding from center via clip-path; full a11y (focus trap, Escape, aria); `rounded-[30px] border-border bg-background`; close button `bg-foreground/[0.05]` circle.
- **Select** (beui) — trigger + panel pinch apart (near corners flatten, gap springs open, chevron flips with a bouncy spring); placement flips top/bottom automatically; items stagger-in `y: -6 + blur(3px)`.

### Grootstudio / optics
- **GradientText** — animated gradient wordmark (orb blobs + morphing border-radius), used for the title-bar "GLowNote" and only there (keep it exclusive).
- **ShimmerTextFlip** — cycles headline phrases with blur+y flip (Welcome hero).
- **ThemeSwitcher** — see §5.

### Modules
- **TitleBar** — see §8.
- **NewPage** — page-create dialog; emoji picker (`emoji-picker-react`) with expand/collapse animation. Uses raw `gray-50`/`#1c1c1c` values — should migrate to tokens.
- **MacOSSidebar** — collapsible page rail: `rounded-3xl` container, panel `rounded-2xl` animating width 240px ↔ 64px (`spring, bounce 0.4`), selected item pill `bg-neutral-200 dark:bg-neutral-700` with `layoutId` hover background. Uses raw `neutral-*` utilities — **should migrate to sidebar tokens**.

## 8. Layout & Window Chrome

- **Borderless window** (1200×700, `decorations: false`) with custom `TitleBar`: fixed `h-10` (40px), `z-[9999]`, drag region via `data-tauri-drag-region`, window controls `w-12` (48px) buttons; close button hovers `bg-destructive`. Pages offset content with `mt-10`.
- **App shell:** `html/body/#root` are 100% height with `overflow: hidden`; content scrolls in inner containers (`min-h-0 flex-1 overflow-auto`). **Scrollbars are hidden globally** (`scrollbar-width: none` / `::-webkit-scrollbar display: none`) — don't rely on them.
- **Page widths:** Welcome `max-w-5xl`, Home `max-w-6xl`, centered.
- **Home patterns:** section headers = small icon + `text-sm font-semibold text-muted-foreground`; project list = `max-h-[320px] rounded-xl border divide-y` rows with `hover:bg-muted/50`, `9x9` icon tile `rounded-lg bg-muted`; event grid `sm:grid-cols-2 lg:grid-cols-3`.
- **Welcome:** dotted grid background (`radial-gradient` at 20px), `bg-background/65 backdrop-blur-[1px]` scrim, hero centered.
- Direction: `dir` attribute honored via stored preference (`ltr | rtl`).

## 9. Usage Rules

1. Use semantic tokens (`bg-card`, `text-muted-foreground`, `ring-border`) — never raw hex, except the documented Modal/NewPage/sidebar exceptions (§7).
2. Depth via `ring-1` before shadows; shadows stay at `0.1`-ish opacity.
3. Focus states always visible: `focus-visible:ring-3 ring-ring/50` (controls), `ring-2 ring-ring` (gooey/select).
4. All animated components must respect `prefers-reduced-motion`.
5. Copy in UI: active voice, specific labels ("Getting Started", "Continue", "Save"), sentence case.
6. Hover fills: `hover:bg-muted` (buttons/ghosts), `hover:bg-muted/50` (list rows).
7. Icons from `lucide-react`, 16px default in controls.

## 10. Known Deviations (cleanup candidates)

- `dark:--sidebar-primary: #2c2c2e` — off-palette blue, breaks the brown/amber family.
- Raw `neutral-*` utilities in `MacOSSidebar`, `gray-*`/`#1c1c1c` in `NewPage`, `#F2F2F2`/`#131313`/`#232323` in `Modal`.
- Two theme persistence keys (`vite-ui-theme` vs `glownote-preferences`) — §5.
- Geist font dependency unused; `squircle-none` utility used in ThemeSwitcher but not defined in `App.css` (no-op unless a registry provides it).
- `useControlledState` in `src/hooks/` is untyped (`any`) despite strict TS elsewhere.