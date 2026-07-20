# Library

A cozy, offline-first personal writing space where writing feels like collecting
beautiful books. Create diaries, novels, recipe collections, dream journals, and
more — each rendered as a book on your shelf — then write entry by entry with
automatic saving. Everything lives locally in your browser via IndexedDB, so your
words stay private and available even without a connection.

Built as a static single-page app with **React + TypeScript + Vite**, and designed
to deploy anywhere static files can be hosted (GitHub Pages out of the box).

## Features

- **A shelf of books** — organize your writing into books of different formats
  (Diary, Novel, Storybook, Travel Journal, Dream Journal, Recipe Book, Research
  Notebook, Poetry, Sketchbook, or a fully custom type).
- **Beautiful covers** — pure-CSS 3D book covers with a palette of preset colors.
- **Distraction-free editor** — a paper-textured writing surface with an
  auto-growing text area.
- **Automatic saving** — debounced auto-save with a live save-status indicator, so
  your work is never lost.
- **Drag-to-reorder entries** — arrange chapters/entries by dragging.
- **Local-first persistence** — data is stored in the browser via IndexedDB.
- **Swappable backend** — the UI talks only to a `Repository`, so moving from
  local storage to a cloud backend is a one-line change.

## Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for dev server and bundling
- [React Router](https://reactrouter.com/) (HashRouter, for static-host friendliness)
- IndexedDB for local persistence

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (bundled with Node.js)

### Install

```bash
npm install
```

### Run the development server

```bash
npm start
# or, equivalently:
npm run dev
```

This starts Vite's dev server (default: http://localhost:5173) with hot module
reload. Open the printed URL in your browser.

### Build for production

```bash
npm run build
```

This type-checks the project with `tsc -b` and then produces an optimized static
bundle in the `dist/` directory.

### Preview the production build locally

```bash
npm run preview
```

Serves the contents of `dist/` so you can verify the production build before
deploying.

## Project Structure

```
src/
├── components/     UI, library, and editor React components
│   ├── ui/         Reusable primitives (Button, Modal, Select, ...)
│   ├── library/    Book cover, card, and creation modal
│   └── editor/     Editor and entry list
├── lib/            Repository, React context, hooks, utilities
├── models/         Domain types, formats, and cover colors
├── pages/          Library and Book Detail pages
├── storage/        StorageProvider interface, IndexedDB provider, backup
├── styles/         Global design-system styles
├── App.tsx         Router + provider wiring
└── main.tsx        App entry point
```

The layering is strict: components never touch storage directly. They go through
[`Repository`](src/lib/repository.ts), which sits on top of a `StorageProvider`.
To swap the backend, change the single line in
[`LibraryContext.tsx`](src/lib/LibraryContext.tsx) that constructs
`new Repository(new IndexedDbProvider())`.

## Deployment

The app is a fully static site. It uses `HashRouter` and Vite's `base: './'`
(relative asset paths), so it works under any subpath and page refreshes never
404 — making it a great fit for GitHub Pages.

### Deploy to GitHub Pages

A one-command deploy is preconfigured using [`gh-pages`](https://www.npmjs.com/package/gh-pages):

```bash
npm run deploy
```

This runs `npm run build` and publishes the `dist/` directory to the `gh-pages`
branch of your repository. Then, in your repository settings, set **Pages** to
serve from the `gh-pages` branch.

### Deploy anywhere else

Since the output is static, you can host `dist/` on any static host (Netlify,
Vercel, Cloudflare Pages, S3, nginx, etc.):

```bash
npm run build
# then upload the contents of dist/ to your host
```

## Testing

There is no automated test suite configured yet. Before shipping, verify the
project with the build step, which includes a full TypeScript type-check:

```bash
npm run build
```

A clean build (no `tsc` errors and a successful Vite bundle) is the current
quality gate.

When adding tests later, [Vitest](https://vitest.dev/) pairs naturally with Vite:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Then add a `"test": "vitest"` script to `package.json` and run `npm test`.

## License

This project is provided as-is for personal use.