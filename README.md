# Text to PDF

A production-quality, privacy-first **Text to PDF** web application. Write or import
text, style it exactly how you want, preview it live, and export a beautifully
formatted PDF — all **100% in your browser**. No servers, no uploads, no tracking.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Features

### Editor
- Large, distraction-free writing area
- Live **word / character / paragraph** counts + reading-time estimate
- **Undo / Redo** with smart edit coalescing
- **Find & Replace** (case-sensitive, replace-all)
- **Auto-save** to the browser (survives refreshes)
- **Drag & drop** file import — `.txt`, `.md`, `.docx`
- Paste without formatting
- Keyboard shortcuts

### PDF Generation
- One-click, high-quality PDF export powered by **pdf-lib**
- Smart line wrapping with no text clipping
- Preserves paragraphs & spacing, automatic page breaks
- Multi-page support (handles very large documents)
- Runs entirely client-side

### Page & Layout
- Page sizes: **A4, Letter, Legal, A3, A5, Custom**
- Portrait / landscape orientation
- Margin presets (narrow / normal / wide) + custom margins

### Typography
- Fonts: Helvetica, Arial, Times New Roman, Georgia, Courier, Roboto, Open Sans
- Font size, line spacing, letter spacing, paragraph spacing
- Bold, italic, underline
- Left / center / right / justify alignment

### Header, Footer & Watermark
- Optional headers/footers with title, date, page numbers & custom text
- Text watermark with configurable opacity, rotation, size & position

### Experience
- Beautiful **light / dark / system** themes with smooth transitions
- **Live PDF preview** with zoom, fullscreen & page navigation
- Toast notifications, empty states, loading states, error handling
- Fully responsive — desktop, tablet & mobile
- Accessible: keyboard navigable, ARIA labels, screen-reader friendly

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm run start
```

## Tech Stack

| Layer      | Choice                        |
| ---------- | ----------------------------- |
| Framework  | Next.js 15 (App Router)       |
| Language   | TypeScript (strict)           |
| Styling    | Tailwind CSS                  |
| PDF engine | pdf-lib                       |
| DOCX parse | mammoth (lazy-loaded)         |
| Icons      | lucide-react                  |

## Project Structure

```
src/
├── app/                  # Next.js app router (layout, page, globals)
├── components/
│   ├── ui/               # Reusable primitives (Button, Select, Toggle…)
│   ├── layout/           # Header, Sidebar
│   ├── editor/           # Editor, toolbar, stats, find & replace
│   ├── settings/         # Settings panel sections
│   └── preview/          # Live PDF preview
├── hooks/                # useSettings, useUndoRedo, useTheme, useToast…
├── lib/
│   ├── pdf/              # PDF generation engine + font loading
│   ├── constants.ts      # Defaults, page sizes, presets
│   ├── utils.ts          # Helpers (stats, download, debounce…)
│   └── fileImport.ts     # TXT / MD / DOCX import
└── types/                # Shared TypeScript types
```

## Privacy

Everything happens locally in your browser. Your text is never uploaded to any
server — PDF generation, file import, and auto-save all run client-side. The only
optional network request is fetching Roboto / Open Sans web-font files for
embedding (falls back to a standard font if offline).

## Deployment

Deploy to **Vercel** (recommended) or any Node host:

```bash
# Vercel
vercel deploy

# or any platform supporting Next.js
npm run build && npm run start
```

## Keyboard Shortcuts

| Shortcut          | Action              |
| ----------------- | ------------------- |
| `Ctrl/Cmd + S`    | Download PDF        |
| `Ctrl/Cmd + F`    | Find & Replace      |
| `Ctrl/Cmd + Z`    | Undo                |
| `Ctrl/Cmd + Y`    | Redo                |

## License

MIT
