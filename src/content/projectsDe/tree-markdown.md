## Warum es das gibt

Ein Verzeichnisbaum in einem Dokument ist meist ein Codeblock. Im Editor sieht er richtig aus und bricht dann irgendwo auf dem Weg nach unten: Ein PDF-Export setzt die Rahmenzeichen in einer anderen Schrift oder lässt sie ganz weg. Tabs und Leerzeichen sind sich über die Tiefe einer Ebene uneinig, und wer den Baum in ein Ticket kopiert, verliert still eine Ebene. Und jeder Renderer, der HTML annimmt, entscheidet selbst, wie ein Baum auszusehen hat.

Ein Codeblock trägt keine Struktur. Er ist Text, der zufällig wie ein Baum aussieht.

Ich wollte einen Parser, der den Baum einmal liest und jeder Ausgabe dieselbe Struktur gibt, damit der Baum in der Vorschau, im HTML und im PDF tatsächlich derselbe Baum ist. Das gilt überall dort, wo HTML gerendert wird: in der VS-Code-Vorschau, im Browser, in einem Pandoc-Export.

## Was es macht

Vorne geht ein `tree`-Block hinein, hinten kommt ein AST heraus: Jeder Knoten hat einen Namen, einen Typ und Kinder. Alles danach ist ein Renderer.

Der HTML-Renderer macht aus Ordnern native `<details>`- und `<summary>`-Elemente. Damit klappt der Baum in jedem Browser und in jeder Markdown-Vorschau, die HTML erlaubt, ohne eine Zeile JavaScript. Für Stellen, die kein HTML annehmen, gibt es zusätzlich Mermaid und reinen Text.

Das mitgelieferte Kommandozeilenwerkzeug bedient außerdem Pandoc: `tmd notes.md --to pdf -o notes.pdf` bereitet die Datei auf, legt zwei Stylesheets an, eines für Dokumenttypografie und eines für Bäume, und übergibt das Ergebnis an Pandoc und WeasyPrint.

<a href="/portfolio/tree-render.webp"><img src="/portfolio/tree-render.webp" alt="Ein gerenderter Baum: Ordner in Blau mit Aufklapp-Pfeilen, Dateien darunter, gestrichelte Einrückungslinien" /></a>

*Der Parser stellt seinen eigenen Quellbaum dar. Ordner sind `<details>`-Elemente: Sie öffnen und schließen sich ohne eine Zeile JavaScript.*

<a href="/portfolio/tree-pdf.webp"><img src="/portfolio/tree-pdf.webp" alt="Derselbe Baum nach dem PDF-Export: Titel, gerenderter Baum und Dokumenttypografie" /></a>

*Derselbe Block nach `tmd --to pdf`. Der Baum behält Struktur und Gestaltung; die Pfeile sind hier Dekoration, weil sich in einem PDF nichts aufklappen lässt.*

## Schnittstellen

- Kommandozeile: `tmd` (preprocess, preview, export)
- Bibliothek: `parseTreeBlock`, `renderHTML`, `renderMermaid`, `renderText`
- Plugins: remark und markdown-it
- VS-Code-Erweiterung: `vscode-tree-markdown`

## Entscheidungen und Kompromisse

**Ein AST statt einer String-Ersetzung.** Die naheliegende Version ist ein Regex, der Rahmenzeichen gegen `<ul>` und `<li>` tauscht. Das funktioniert, bis ein Baum eine ungerade Einrückung hat, ein Ordner ohne Kinder auftaucht oder ein Name mit einem Bindestrich beginnt. Wer erst in eine Struktur parst, lässt die Renderer nicht raten, und ein neues Ausgabeformat ist ein neuer Renderer statt ein neuer Satz Regeln.

**Zwei Modi, streng und nachsichtig.** Echte Bäume werden unterwegs beschädigt: Tabs werden zu Leerzeichen, eine Ebene wird übersprungen, eine Zeile verliert ihre Beschriftung. Der nachsichtige Modus repariert die Einrückung, soweit sie sich erschließen lässt. Der strenge Modus behandelt eine übersprungene Ebene oder eine leere Beschriftung als Fehler, denn in einer Dokumentations-Pipeline ist ein stillschweigend reparierter Baum schlimmer als ein fehlgeschlagener Build. Nachsichtig ist der Standard, streng ist für CI.

**Native `<details>` statt eines Skripts.** Ein Baum in JavaScript kann mehr: sich merken, welche Ordner offen waren, suchen, animieren. Er funktioniert dafür nicht mehr im PDF, nicht im statischen Export und in der Hälfte der Vorschauen, die Leute tatsächlich benutzen. Das native Element klappt von selbst und übersteht jeden Export. Der Preis: Der offene Zustand bleibt nicht erhalten, und der Marker lässt sich kaum gestalten.

**Der Parser doppelt in der VS-Code-Erweiterung.** Die Erweiterung läuft in einem WebView ohne Modulsystem und ohne Zugriff auf das installierte Paket. Also trägt sie ihre eigene Kopie des Parsers in einem einzigen Browser-Skript mit und beobachtet das DOM, um beim Tippen neu zu rendern. Das sind zwei Implementierungen, die synchron bleiben müssen: ein echter Preis, einmal gezahlt, damit die Erweiterung ohne Abhängigkeiten bleibt.

## Was es nicht ist

Es ist keine Datei-Explorer-Komponente. Es liest kein Dateisystem, weiß nicht, was eine Datei ist, und hat keine Icons oder Farben nach Dateityp: Es stellt dar, was im Block steht, und nichts darüber hinaus. Die Testsuite deckt den Parser ab, sieben Fälle rund um Verbindungszeichen, Einrückung und die Unterscheidung von Dateien und Ordnern; für die visuelle Ausgabe der Renderer gibt es keinen Test. Und am besten funktioniert es mit Bäumen, die von Hand geschrieben sind, also genau dort, wo die Schäden entstehen.

## Links

<ul>
  <li><a href="https://github.com/amanssur-tech/tree-markdown-parser" target="_blank" rel="noopener">GitHub</a></li>
  <li><a href="https://github.com/amanssur-tech/tree-markdown-parser/tree/main/vscode" target="_blank" rel="noopener">Quellcode der VS-Code-Erweiterung</a></li>
  <li><a href="https://www.npmjs.com/package/tree-markdown-parser" target="_blank" rel="noopener">npm-Paket</a></li>
  <li><a href="https://marketplace.visualstudio.com/items?itemName=amanssur.vscode-tree-markdown" target="_blank" rel="noopener">Marketplace</a></li>
</ul>
