# Palette Studio

Enter one key color, get a complete ten-step scale from light to dark. Palette Studio implements the [TDesign x Tencent Open Source 2026](https://tdesign.gtimg.com/docs/summer-of-code-2026/tdesign-task.html) challenge, extended with a dark mode scale and harmonized neutrals.

The UI supports color input with a picker, preset swatches, one-click HEX copy, contrast inspection, and CSS / JSON export, with a live component preview themed by the generated palette. All color math runs locally in the browser.

## Tech Stack

- **React 19** + **TypeScript 6**
- **Vite+ 1.3** (`vp`): unified toolchain wrapping Vite, Rolldown, Vitest, Oxlint and Oxfmt
- **Tailwind CSS 4** + **shadcn/ui** for the component preview
- **Culori** for color parsing and OKLCH / OKLab computation
- **React Compiler** via `@rolldown/plugin-babel`

## Getting Started

Prerequisite: the global [`vp`](https://viteplus.dev/guide/) CLI, which manages Node.js and the package manager for you (no separate Node.js or Bun install needed):

```bash
curl -fsSL https://vite.plus | bash
```

Then, from the project root:

```bash
vp install   # resolve the toolchain and install dependencies
vp dev       # start the dev server with HMR
```

Open the printed URL (`http://localhost:5173` by default). Type a key color or pick a preset, toggle light / dark, click a swatch to copy its HEX, and use "Export scale" to download CSS or JSON.

## Commands

| Command        | What it does                                         |
| -------------- | ---------------------------------------------------- |
| `vp dev`       | Start the dev server with HMR                        |
| `vp run build` | Type-check (`tsc -b`) and build to `dist/`           |
| `vp preview`   | Preview the production build                         |
| `vp lint`      | Lint with Oxlint (type-aware, type-checking enabled) |
| `vp fmt`       | Format with Oxfmt (`vp fmt --check` to verify only)  |
| `vp test`      | Run the test suite once with Vitest                  |
| `vp check`     | Format + lint + type-check in one pass               |

## Core API

[`src/lib/palette.ts`](src/lib/palette.ts) is a standalone TypeScript module that depends only on Culori, not on React or the DOM:

```ts
import { generatePalette, generateTheme } from "./src/lib/palette";
import { exportTheme } from "./src/lib/theme";

const light = generatePalette("#0052D9");
const dark = generatePalette("#0052D9", { mode: "dark" });
const neutral = generatePalette("#0052D9", { neutral: true });

const theme = generateTheme("#0052D9");
// theme: { source, light, dark, neutralLight, neutralDark }
const css = exportTheme(theme, "css");
const json = exportTheme(theme, "json");
```

Input and output contract:

- Accepts opaque HEX, RGB, HSL, OKLCH and CSS named colors; wide-gamut input is mapped into sRGB first. Invalid input, transparent colors and context-dependent colors throw `ColorInputError`.
- Each scale is a readonly ten-element tuple of uppercase `#RRGGBB` values, ordered 1 = lightest to 10 = darkest in both light and dark modes.
- The key color sets hue and chroma but is not guaranteed to appear as an exact step; the normalized source color is kept in `theme.source`.
- CSS and JSON exports both contain all four scales. The CSS output provides `:root` and `[data-theme="dark"]` blocks with `--brand-*`, `--neutral-*` and shadcn/ui semantic variables; load it after your base styles. Semantic variables cover this project's preview surface and do not include full success / warning / error status themes.

## Reading the Source

Start with the scale engine, then the theme mapping, then the UI:

| File                                                 | Responsibility                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| [`src/lib/palette.ts`](src/lib/palette.ts)           | Color parsing, gamut mapping, ten-step scale and contrast math          |
| [`src/lib/theme.ts`](src/lib/theme.ts)               | Semantic tokens, shadcn/ui variables and CSS / JSON export              |
| [`src/App.tsx`](src/App.tsx)                         | Workspace state, input handling and mode switching                      |
| [`src/components/`](src/components/)                 | Scale display, details, component preview and export dialog             |
| [`src/styles/`](src/styles/)                         | Layered stylesheets: base, shell, studio, preview, overlays, responsive |
| [`src/lib/palette.test.ts`](src/lib/palette.test.ts) | Algorithm boundary, contrast and export tests (131 cases)               |

## Deployment

The project builds to a fully static site in `dist/` and can be deployed to any static host (Vercel, Netlify, GitHub Pages) with build command `vp run build` and output directory `dist`.
