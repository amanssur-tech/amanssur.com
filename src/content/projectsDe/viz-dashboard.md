## Ausgangslage

Ich wollte ein Visualisierungssystem fürs Portfolio, das mehr kann als ein paar statische Screenshots. Es sollte zeigen, wie ich an moderne Datenprodukte im Web herangehe: durchgängig typisierter React-Code, Diagramme mit D3, zweisprachige Texte und eine Oberfläche, die sich anfühlt wie ein eigenes Produkt und nicht wie eine Demo. Die Beispiele, die ich kannte, waren entweder akademisch oder lieblos gemacht. Also habe ich ein durchgängiges Dashboard gebaut, das sich für Kunden wiederverwenden lässt, die Tempo, ein eigenes Erscheinungsbild und exportierbare Auswertungen erwarten.

## Was das Projekt macht

Das Dashboard besteht aus einer Übersichtsseite und je einer eigenen Ansicht für Balken- und Liniendiagramme. Auf dem Handy verhält es sich wie eine native App. Jedes Diagramm lädt vorbereitete JSON-Daten, läuft mit Framer Motion ein, zeigt Tooltips direkt am Punkt und bietet Aktionen zum Kopieren, Herunterladen oder für einen genaueren Blick. Heller und dunkler Modus, Beschriftungen auf Deutsch und Englisch sowie Export-Schaltflächen bilden ab, was mir bei Dashboards für mittelständische Betriebe tatsächlich begegnet.

## Architektur

- **React und Router** übernehmen die Startseite und die beiden Diagrammseiten. Gemeinsame Bausteine wie Navigation, Fußzeile und Panels sorgen dafür, dass alles zusammenpasst.
- **Die D3-Anbindung** steckt in einem wiederverwendbaren `useD3`-Hook. Er kümmert sich um den Lebenszyklus des SVG, damit React und D3 nicht um dasselbe Element streiten. Die Diagramm-Komponenten geben Referenzen, Skalen und Handler deklarativ weiter.
- **Die Daten** kommen vorerst aus Dateien (`/public/data/*.json`), damit das Repository überall lauffähig bleibt. Hilfsfunktionen formatieren Tooltips, erzeugen SVG- und PNG-Exporte und legen die Diagrammgröße an einer einzigen Stelle fest.
- **Zustand und Erscheinungsbild** hängen an einem schlanken `ThemeContext`, an den Übergängen von Framer Motion und an Tailwind-Klassen für Verläufe, glasartige Flächen und ausreichenden Kontrast.
- **Die Zweisprachigkeit** übernimmt i18next zusammen mit Cookies, sodass das Dashboard die gewählte Sprache beim nächsten Besuch behält. So handhabe ich das auch bei Ergebnissen für Kunden.

## Herausforderungen

- D3 arbeitet mit direkten Eingriffen ins DOM, React 19 und Framer Motion dagegen deklarativ. Damit beides im Takt bleibt, braucht es gründliches Aufräumen und eine kleine Verzögerung im `useD3`-Hook, damit nichts auseinanderreißt.
- Saubere SVG- und PNG-Exporte brauchten eine Warteschlange, damit mehrere Downloads gleichzeitig die Oberfläche nicht blockieren. Dazu kamen gebündelte, entprellte Anfragen und eine Fortschrittsanzeige an der Hauptschaltfläche.
- Die Zweisprachigkeit hat beim Wechsel zwischen den Seiten anfangs zu Abweichungen bei der Hydration geführt. Gelöst habe ich das, indem die Sprache in einem Cookie liegt und der i18n-Provider sie beim Aufbau übernimmt.

## Was ich gelernt habe

Das Projekt hat gezeigt, wie weit man ein vermeintlich einfaches React-Dashboard treiben kann, wenn man die kleinen Zustände ernst nimmt: den Wechsel zwischen hellem und dunklem Modus, den Platzhalter, während ein Diagramm lädt, die Rückmeldung beim Export. Nebenbei ist ein Muster entstanden, mit dem ich D3-Komponenten in einer typisierten React- und Vite-Umgebung zusammensetze. Das nutze ich heute in Workshops mit Kunden.

## Künftige Verbesserungen

- Die Diagramme an eine echte Datenquelle anbinden (Supabase oder REST) und Änderungen sofort anzeigen.
- Filter nach Region und Zeitraum ergänzen, die sich über URL-Parameter teilen lassen.
- Den Export um PDF-Folien oder Notion-Einbettungen für die Übergabe an Entscheider erweitern.
- Automatische visuelle Tests einbauen, damit Änderungen am Erscheinungsbild die Lesbarkeit der Diagramme nicht kaputt machen.
