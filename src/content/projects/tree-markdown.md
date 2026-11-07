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
- Marketplace: https://marketplace.visualstudio.com/items?itemName=amanssur.vscode-tree-markdown
