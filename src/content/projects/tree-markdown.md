---
slug: tree-markdown
title_en: "Tree Markdown Parser"
title_de: "Tree Markdown Parser"
description_en: "Render ASCII directory trees as structured, collapsible HTML in Markdown previews and exports."
description_de: "Rendert ASCII-Verzeichnisbaeume als strukturierte, einklappbare HTML-Ansicht in Markdown-Previews und Exports."
tech:
  - TypeScript
  - Node.js
  - remark/rehype
  - markdown-it
  - Pandoc
  - WeasyPrint
features_en:
  - Parses ASCII tree blocks into an AST and renders HTML, Mermaid, or plain text.
  - Collapsible folders via native <details>/<summary> (no JS).
  - CLI preprocessor with CSS injection for HTML/PDF exports.
  - VS Code extension for live preview rendering.
  - Strict/tolerant parsing modes for messy trees.
features_de:
  - Parst ASCII-Baumstrukturen in ein AST und rendert HTML, Mermaid oder Plain Text.
  - Einklappbare Ordner ueber native <details>/<summary> (ohne JS).
  - CLI-Preprocessor mit CSS-Injektion fuer HTML/PDF-Exports.
  - VS Code-Extension fuer Live-Preview-Rendering.
  - Strikte/tolerante Parsing-Modi fuer unordentliche Trees.
liveUrl: "https://github.com/amanssur-tech/tree-markdown-parser"
repoUrl: "https://github.com/amanssur-tech/tree-markdown-parser"
heroImage: "/portfolio/before-after.avif"
heroImageDark: "/portfolio/before-after-dark.avif"
hideLiveUrl: true
published: true
selected: true
---

## Overview

Tree Markdown Parser turns fenced `tree` blocks into a structured AST and renders them as clean, collapsible HTML without JavaScript. It supports CLI previews, stable HTML/PDF exports, and live rendering in VS Code.

## Why it exists

Markdown previews and exports often render directory trees inconsistently. This tool standardizes tree rendering across previews, CLI workflows, and document exports.

## Interfaces

- CLI: `tmd` (preprocess, preview, export)
- Library API: `parseTreeBlock`, `renderHTML`, `renderMermaid`, `renderText`
- Plugins: remark and markdown-it
- VS Code extension: `vscode-tree-markdown`

## Links

- GitHub: https://github.com/amanssur-tech/tree-markdown-parser
- VS Code extension source: https://github.com/amanssur-tech/tree-markdown-parser/tree/main/vscode
- npm package: https://www.npmjs.com/package/tree-markdown-parser
- Marketplace (placeholder): https://marketplace.visualstudio.com/items?itemName=TODO
