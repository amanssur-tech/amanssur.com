## Das Problem

Anfragen kommen über den Weg, der gerade am nächsten liegt: ein Formular, eine E-Mail, eine Nachricht im Team-Channel, ein Zettel, der nach einem Telefonat weitergegeben wird. Sie sind selten vollständig, jedes Mal anders formuliert und unterschiedlich dringend. Danach sitzt jemand da, liest alles durch, überlegt, worum es eigentlich geht, entscheidet, wer es übernimmt, und muss auch noch daran denken, später nachzufragen.

Genau an dieser Stelle verlieren kleine Teams Zeit. Nicht, weil die Arbeit schwer wäre, sondern weil die Erfassung nicht geregelt ist. Zwei ähnliche Anfragen werden unterschiedlich behandelt. Eine unvollständige Anfrage liegt in der Warteschlange und sieht aus wie eine, mit der man sofort loslegen könnte. Ob nachgefragt wird, hängt davon ab, ob jemand daran denkt. Und hinterher kann niemand sagen, warum ein Vorgang dort gelandet ist, wo er liegt.

Ich wollte eine kleine Version davon bauen, die tatsächlich funktioniert: ein privates Formular, ein fester Satz Regeln, ein Datensatz pro Anfrage, eine Benachrichtigung und eine tägliche Prüfung für alles, was liegen bleibt.

## Was es macht

Herein kommt man nur über ein privates n8n-Formular. Jede Anfrage erreicht das System also in derselben Form, egal wo sie zuerst zur Sprache kam. Beim Absenden räumt der Workflow die Eingaben auf, vergibt eine Vorgangsnummer, wählt eine Kategorie und legt Priorität und Zuständigkeit fest. Dann schreibt er eine Zeile in Google Sheets und postet eine Karte in den Slack-Channel. Ein zweiter Workflow läuft einmal am Tag, liest alle offenen Vorgänge und erinnert an die, bei denen seit einer Weile nichts passiert ist.

Der Ablauf ist immer derselbe: erfassen, einordnen, zuweisen, festhalten, benachrichtigen, nachfassen.

<a href="/portfolio/case-intake-form.webp"><img src="/portfolio/case-intake-form.webp" alt="Das private Formular: Name, E-Mail, Quelle, Zusammenfassung, Details, Wunschtermin, Kategorie-Hinweis und Anhangs-URL" class="form-shot" /></a>

*Das Formular. Acht Felder, vier davon Pflicht. Mehr brauchte ich nicht, um eine Anfrage einzuordnen und weiterzugeben. Fehlt etwas, wird es markiert und nicht geraten.*

## Die Regeln

Die Einordnung übernimmt kein Modell, sondern ein fester Satz Regeln. So kann jeder, der die Warteschlange bearbeitet, eine Entscheidung nachlesen, hinterfragen und ändern.

| Kategorie | Erkannt, wenn | Zuständig |
| --- | --- | --- |
| Access | der Hinweis lautet Access oder der Text enthält login, access, permission, account | Ops Access |
| Billing | der Hinweis lautet Billing oder der Text enthält invoice, payment, refund, charge | Finance Ops |
| Data | der Hinweis lautet Data oder der Text enthält report, export, import, dashboard, sync | Data Ops |
| Logistics | der Hinweis lautet Logistics oder der Text enthält delivery, shipment, schedule, address | Operations Coordinator |
| General Ops | nichts davon trifft zu, dann greift die Auffangregel | Ops Triage |

| Priorität | Wird gesetzt, wenn |
| --- | --- |
| High | der Wunschtermin heute oder morgen liegt oder der Text urgent, blocked, escalation oder asap enthält |
| Medium | der Wunschtermin innerhalb von drei Tagen liegt oder die Kategorie Access beziehungsweise Data ist |
| Low | weder Termindruck noch eine dringliche Formulierung vorliegt |

Den Unterschied machen vor allem zwei Regeln. Priorität und Vollständigkeit sind getrennte Felder. Eine dringende Anfrage ohne Details bleibt auf High, während ihr Status auf Waiting for Info springt. Beides steht nebeneinander, statt dass eines das andere verdrängt. Meine erste Version hatte beides in einer einzigen Priorität „Needs Info“ zusammengefasst und damit die Dringlichkeit unterschlagen. Außerdem geht ein ausdrücklich gewählter Hinweis vor einem Stichwort, auch über Kategorien hinweg: Wer Data auswählt, hat Vorrang vor dem Wort invoice in der Beschreibung.

[![Der Workflow für den Eingang](/portfolio/case-intake-canvas.webp)](/portfolio/case-intake-canvas.webp)

*Der Workflow für den Eingang: Formular, Aufbereitung, Einordnung, Speicherung, Slack-Karte. Die Notizen auf dem Canvas sind die Begründung. Sie stehen neben der Logik statt in einem Dokument, das niemand aufschlägt.*

## Was der Test zeigt

Regeln sind schnell geschrieben und an den Rändern schnell falsch. Deshalb habe ich sechs Anfragen durch das laufende Formular geschickt, alle auf Englisch. Fünf für die Fälle, die abgedeckt sein sollen, und eine, die absichtlich widersprüchliche Signale schickt.

| Testanfrage | Kategorie | Priorität | Status | Zuständig |
| --- | --- | --- | --- | --- |
| Payroll login blocked before Friday | Access | High | New | Ops Access |
| Duplicate charge on October invoice | Billing | Low | Waiting for Info | Finance Ops |
| Confirm the revised warehouse address | Logistics | Low | New | Operations Coordinator |
| Weekly report needs a dashboard export | Data | Medium | New | Data Ops |
| "Not sure who handles this one" | General Ops | Low | New | Ops Triage |
| ASAP: invoice export is wrong, finance is blocked | Data | High | Waiting for Info | Data Ops |

Auf die zweite Zeile kommt es mir an. Eine Rechnungsbeschwerde ohne Details hat weder Frist noch dringliche Formulierung. Sie steht deshalb auf Low, ihr Status ist Waiting for Info. Sie landet bei der Person, die nachfragen muss, und nicht in einer Warteschlange, in der sie aussieht, als könnte es sofort losgehen.

An der letzten Zeile ist meine erste Version gescheitert. Sie enthält invoice, was nach Billing klingt. Die anfragende Person hat aber Data ausgewählt, und dieser Hinweis sticht das Stichwort. Zugleich steht ASAP darin, ohne dass Details folgen. Das Ergebnis ist High und blockiert in einem. Genau diese Kombination ist der Grund, warum Priorität und Status zwei getrennte Felder sind.

Die Tabelle hat außerdem einen echten Fehler aufgedeckt. Meine erste Version hat „kein Wunschtermin“ als sehr große negative Zahl behandelt. Anfragen ohne Datum galten dadurch als überfällig und kamen als High heraus. Zwei der sechs Vorgänge oben waren falsch, bis ich das korrigiert habe.

Zur Laufzeit: Über die dreizehn aufgezeichneten Durchläufe dauerte die komplette Ausführung vom Absenden bis zum Slack-Post zwischen 1,5 und 3,8 Sekunden, im Median 2,4. Der Großteil davon entfällt auf die beiden API-Aufrufe, nicht auf die Einordnung.

[![Die Vorgänge in Google Sheets](/portfolio/case-intake-sheet.webp)](/portfolio/case-intake-sheet.webp)

*Die sechs Vorgänge, wie sie in der Tabelle stehen. Dieselbe Zeile, die der Nachfass-Lauf am nächsten Tag liest, und dieselbe Nummer, die in Slack auftaucht.*

[![Die Slack-Benachrichtigung](/portfolio/case-intake-slack.webp)](/portfolio/case-intake-slack.webp)

*Die Benachrichtigung, wie sie im gemeinsamen Channel steht: Zuständigkeit, Priorität, Status, anfragende Person und der Grund für die Zuweisung.*

## Das Nachfassen

Eine Benachrichtigung ist noch kein Nachfassen. Der zweite Workflow läuft jeden Tag um neun, liest die offenen Vorgänge und erinnert an jene, bei denen eine Rückmeldung aussteht, die als High seit mehr als einem Tag offen sind oder die insgesamt länger als drei Tage liegen.

[![Der Nachfass-Workflow](/portfolio/case-intake-followup.webp)](/portfolio/case-intake-followup.webp)

*Der Nachfass-Lauf. Die Erinnerung geht zuerst raus, der Eintrag entsteht erst, wenn Slack sie angenommen hat. Beim dritten Mal wird nicht mehr erinnert, sondern eskaliert.*

Der Eintrag entsteht nach dem Versand, nicht gleichzeitig damit. Scheitert die Anfrage an Slack, bleibt `last_follow_up_at` unverändert, `follow_up_count` wird nicht erhöht, die Wartezeit beginnt nicht von vorn, und der nächste Lauf versucht es erneut. Würde beides zugleich geschrieben, zählte die Tabelle eine Erinnerung, die nie ankam, und wartete danach einen Tag, bevor sie es erneut versucht.

Die Wartezeit kam später. Die erste Version hatte keine: Sie lief stündlich und schickte für jeden passenden Vorgang eine Erinnerung. Für einen einzigen Vorgang kamen so in nicht einmal zwei Tagen 46 Erinnerungen zusammen. Eine Erinnerung, die ständig kommt, ist so gut wie keine, weil irgendwann niemand mehr in den Channel schaut.

## Entscheidungen und Kompromisse

**Google Sheets statt Datenbank.** Ein System für Vorgänge will eigentlich eine Datenbank. Für eine erste Version hat die Tabelle trotzdem Vorteile: Wer die Warteschlange bearbeitet, kann direkt hineinschauen, es braucht keine Infrastruktur, und der Stand jedes Vorgangs ist ohne Oberfläche sichtbar. Der Preis dafür ist echt: keine Transaktionen, keine Rechte jenseits der Datei und kein strukturiertes Audit-Log. Auf Postgres würde ich wechseln, sobald zwei Personen denselben Vorgang gleichzeitig bearbeiten müssen oder jemand ein Audit-Log braucht, das belastbar ist und nicht nur lesbar.

**Regeln statt Sprachmodell.** Ein Modell würde mit mehrdeutigen Anfragen flexibler umgehen. Es brächte aber auch Auswertung und Monitoring mit, die diese Demo nicht hat, und machte jede Entscheidung schwerer zu verteidigen. Auch Regeln scheitern. Sie scheitern nur an einer Stelle, auf die ich zeigen kann. Im Betrieb muss auf die Frage „Warum ist das bei Finance gelandet?“ eine Antwort passen, die in einen Satz geht.

**Privat gebaut, öffentlich beschrieben.** Ein offen erreichbares Formular bedeutet Spam, Rate Limits und einen öffentlichen Schreibweg in eine Tabelle. Nichts davon macht den Teil besser, der es wert ist, gezeigt zu werden: das Design und die Belege.

**Eine Obergrenze für Erinnerungen.** Es gibt drei Anläufe, und der dritte ist keine Erinnerung mehr. Er landet im selben Channel und bei derselben zuständigen Person, aber der Text ist eine Eskalation und kein freundlicher Hinweis. Der Vorgang wird auf Escalated gesetzt, damit der Lauf ihn nicht weiter bearbeitet. Wer auch das letzte Stück automatisiert, bekommt ein System, das nur noch nervt, statt die Sache an einen Menschen abzugeben.

## Was ich für den Echtbetrieb nachrüsten würde

**Sicherheit und Berechtigungen.** Anmeldung und Rollen, damit niemand, der eine Anfrage stellt, die Warteschlange sieht und niemand außerhalb seiner Kategorie zuweist. Ein echtes Audit-Log, das bei jeder Statusänderung festhält, wer sie wann vorgenommen hat, und nicht nur den letzten Stand der Zeile.

**Daten und Zustellung.** Wiederholversuche und Idempotenz beim Schreiben in die Tabelle, denn eine doppelte Vorgangsnummer ist schlimmer als ein fehlgeschlagener Schreibvorgang. Dieselbe Lücke gibt es beim Erinnern: Nimmt Slack eine Nachricht an und scheitert danach der Schreibvorgang, schickt der nächste Lauf sie noch einmal. Üblich ist dagegen ein Outbox-Muster mit einem Idempotency-Key pro Vorgang und Versuch. Wirklich genau einmal zugestellt wird es aber nur, wenn auch der Empfänger doppelte Nachrichten erkennt.

**Betrieb.** Rückmeldung des Status aus Slack, damit ein Vorgang dort geschlossen wird, wo das Gespräch ohnehin läuft. Prüfung der Formulardaten, bevor sie an die Einordnung gehen. Und eine Überwachung des Workflows selbst, damit ein abgelaufener Zugang noch am selben Tag auffällt und nicht erst beim nächsten Blick.

## Was es nicht ist

Es ist kein Produkt für Vorgangsverwaltung und läuft nicht im Echtbetrieb. Es läuft auf meinem Rechner gegen eine geteilte Tabelle, mit erfundenen Anfragen. Es ist eine funktionierende Demo des Ablaufs (erfassen, entscheiden, zuweisen, benachrichtigen, nachfassen) und klein genug, um sie vollständig zu erklären.
