## Das Problem

Daten nützen nur, wenn jemand sie lesen kann. Dieselben Zahlen lassen sich so zeigen, dass sie eine Frage auf einen Blick beantworten, oder so, dass es beeindruckend aussieht und nichts aussagt. Viele Dashboards scheitern an der zweiten Variante: Sie sind darauf gebaut, fertig auszusehen, nicht darauf, verstanden zu werden.

Ich wollte einen Ort für die erste Variante. Jeder Datensatz, jede Frage, übersetzt in ein Diagramm, das die Antwort tatsächlich trägt, und lesbar auf dem Desktop wie auf dem Handy.

## Was es macht

Das Dashboard ist eine wachsende Sammlung von Fallstudien. Jede ist eine eigenständige Seite mit eigenem Diagrammtyp und eigener Frage, und eine neue hinzuzufügen rührt die anderen nicht an.

Die aktuelle Auswahl reicht vom Balkendiagramm, das Zahlen über Städte vergleicht, bis zum Parallelkoordinaten-Diagramm mit fünf Luftschadstoffen: Liniendiagramme über die Zeit, ein randomisiertes Balkendiagramm, das sich alle drei Sekunden neu zeichnet, eine Drei-Panel-Ansicht der Verkäufe nach Tageszeit und ein Dumbbell-Diagramm, das auf einen Bubble-Scatterplot umschaltet. Eine der Fallstudien stellt bewusst ein irreführendes Diagramm neben seine korrigierte Fassung: Wer weiß, warum ein Diagramm lügt, weiß auch, wie man eines zeichnet, das nicht lügt.

Die Auswahl ist nicht fix, und das Thema auch nicht. Der Datensatz ist das, was die Frage braucht, der Diagrammtyp folgt der Frage, und der Anspruch bleibt gleich: die passende Kodierung wählen und sie bei 390 Pixeln genauso tragen wie bei 1440.

Jede Seite trägt dieselbe Hülle: Deutsch und Englisch, hell und dunkel.

<a href="/portfolio/viz-case-studies.webp"><img src="/portfolio/viz-case-studies.webp" alt="Die Bibliothek der Fallstudien: ein Raster aus Karten, jede mit einer anderen Diagrammvorschau, Beschreibung und Schlagwörtern" /></a>

*Die Bibliothek. Jede Karte ist eine eigenständige Fallstudie mit eigenem Diagrammtyp und eigener Frage; die Sammlung wächst über eine neue Route, nicht über Änderungen an den anderen.*

<a href="/portfolio/viz-line-chart.webp"><img src="/portfolio/viz-line-chart.webp" alt="Ein Liniendiagramm mit zwei Reihen über sechs Jahre, mit Legende, gemeinsamer y-Achse und einem Punkt pro Jahreswert" /></a>

*Eine der Fallstudien: ein Liniendiagramm über sechs Jahre, mit Legende, gemeinsamer y-Achse und einem Punkt pro Jahreswert.*

## Wie es gebaut ist

D3 zeichnet, React besitzt die Seite. Die Naht dazwischen ist ein Hook, `useD3`: Er nimmt eine Renderfunktion, gibt ihr das Containerelement und führt vor dem nächsten Durchlauf die Aufräumfunktion aus, die sie zurückgibt. Vor dem Zeichnen wartet er zehn Millisekunden, weil React 19 und Framer Motion das Layout in diesem Moment noch bewegen. Wer in einen Container zeichnet, der mitten in der Animation steckt, bekommt Diagramme in der falschen Größe.

Darunter liegen neun Renderer in `src/charts`, jeder eine schlichte Funktion, die Container und Daten nimmt und ihr eigenes SVG besitzt. Ein neuer Diagrammtyp ist ein neuer Renderer plus eine Route; alles andere bleibt, wie es ist.

Der Build trennt React, den Router, D3 und i18n in eigene Chunks. Der D3-Chunk kommt nur auf einer Seite an, die tatsächlich zeichnet. Die Startseite lädt den Diagramm-Code nie.

## Entscheidungen und Kompromisse

**Ein eigener Hook statt einer Diagramm-Bibliothek.** Recharts oder visx hätten die Arbeit am Lebenszyklus abgenommen. Sie hätten aber auch ihre eigene API zwischen mich und das SVG gelegt, und genau das SVG ist der Punkt dieser Arbeit. Der Preis ist real: Aufräumen, Größenänderung und die Verzögerung oben liegen bei mir, und jeder Renderer muss konsequent alles wieder entfernen, was er hinzugefügt hat.

**Mitgelieferte JSON-Dateien statt Backend.** Die Datensätze sind kleine Dateien, die mit dem Build ausgeliefert werden. Damit lässt sich die Demo als statische Dateien ausliefern, und die Zahlen bleiben stabil genug für Screenshots. Es heißt aber auch: Nichts hier belegt, dass ich mit einer Live-Quelle, einem Cache oder einem Fehlerfall umgehen kann, weil es keinen gibt.

**Eine Route pro Fallstudie statt einer langen Seite.** Eine einzige scrollende Seite wäre schneller gebaut und leichter zu teilen gewesen. Getrennte Routen halten jedes Diagramm für sich, sodass ein schweres Diagramm die anderen nicht mitzieht, und jede Fallstudie lässt sich direkt verlinken.

## Was es nicht ist

Es ist kein BI-Produkt. Es gibt keine Anmeldung, keine Persistenz, keine Live-Daten und keinen Server. Die Testsuite besteht aus zwei Playwright-Smoke-Tests: Das Dashboard lädt, und die Übersicht der Fallstudien ist erreichbar. Das fängt ein kaputtes Deployment ab und ist weit davon entfernt, die Diagramme als getestet zu bezeichnen. Wäre das ein Kundenprojekt, wären die nächsten drei Schritte eine Datenschicht mit Lade- und Fehlerzuständen, visuelle Regressionstests für die Diagramme selbst und ein Durchgang zur Barrierefreiheit bei Farbe und Kontrast.
