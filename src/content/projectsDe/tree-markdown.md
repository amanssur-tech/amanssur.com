## Überblick

Tree Markdown Parser liest Codeblöcke vom Typ `tree` ein, baut daraus einen strukturierten Syntaxbaum und gibt sie als sauberes, einklappbares HTML aus, ganz ohne JavaScript. Dazu kommen eine Vorschau auf der Kommandozeile, verlässliche HTML- und PDF-Ausgaben und eine Live-Vorschau in VS Code.

## Warum es das gibt

Verzeichnisbäume sehen in Markdown-Vorschauen und in Exporten oft jedes Mal anders aus. Dieses Werkzeug sorgt dafür, dass sie überall gleich dargestellt werden: in der Vorschau, auf der Kommandozeile und im fertigen Dokument.

## Schnittstellen

- Kommandozeile: `tmd` (preprocess, preview, export)
- Bibliothek: `parseTreeBlock`, `renderHTML`, `renderMermaid`, `renderText`
- Plugins: remark und markdown-it
- VS-Code-Erweiterung: `vscode-tree-markdown`

## Links

- GitHub: https://github.com/amanssur-tech/tree-markdown-parser
- Quellcode der VS-Code-Erweiterung: https://github.com/amanssur-tech/tree-markdown-parser/tree/main/vscode
- npm-Paket: https://www.npmjs.com/package/tree-markdown-parser
- Marketplace (Platzhalter): https://marketplace.visualstudio.com/items?itemName=TODO
