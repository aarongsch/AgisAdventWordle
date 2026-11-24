# Ágis Advent Wordle – ToDo-Liste

Wordle-Spiel für den Adventskalender. In manche Türchen kommt ein ausgedruckter QR-Code, der auf das Wordle des jeweiligen Tages verweist.

## Bereits umgesetzt

### Spiel
- [x] Wordle-Grundspiel: 6 Versuche, Wörter mit 5 Buchstaben
- [x] Spielfeld (6×5) wird per JavaScript aufgebaut
- [x] Auswertung jedes Versuchs mit korrekter Behandlung doppelter Buchstaben (erst die exakten Treffer, dann die Buchstaben an falscher Stelle)
- [x] Farben: Grün = richtige Stelle, Gelb/Gold = kommt im Wort vor, aber an anderer Stelle, Grau = kommt nicht vor
- [x] Die Tasten der Bildschirmtastatur werden mit eingefärbt (Grün schlägt Gelb, Gelb schlägt Grau)
- [x] Zu kurzes Wort: Die Zeile wackelt (Shake-Animation)
- [x] Siegesmeldung „🎄 Amazing! You solved it! ❤️“, bleibt stehen
- [x] Nach 6 Fehlversuchen wird das Lösungswort angezeigt
- [x] Nach Sieg oder Niederlage ist keine Eingabe mehr möglich

### Wort pro Tag (Grundlage für die QR-Codes)
- [x] Wörter (und Startnachrichten) je Tag in `DAYS` in `config.js` hinterlegt (nur für einzelne Tage: 1, 3, 5, 8, 12, 15, 20, 24)
- [x] Das Wort wird über den URL-Parameter `?day=N` gewählt
- [x] Fehlt der Tag oder ist er ungültig, wird das Wort von Tag 1 genommen

### Eingabe
- [x] Bildschirmtastatur (QWERTY) mit ENTER und ⌫
- [x] Eingabe über die normale Tastatur am Laptop/PC (Buchstaben, Enter, Backspace)

### Design und Handy-Layout
- [x] Weihnachtliches Design: dunkelgrüner Hintergrund, goldener Titel „🎄 Christmas Wordle 🎄“, Schriftart Montserrat
- [x] Alle Farben stehen als Variablen an einer Stelle in `style.css`
- [x] Größen passen sich dem Bildschirm an: Die Kacheln richten sich nach der verfügbaren Breite und Höhe, damit auf kleinen und großen Handys nichts gescrollt werden muss
- [x] Die tatsächlich sichtbare Bildschirmhöhe (`dvh`) wird berücksichtigt, damit die ein- und ausfahrende Adressleiste nicht stört
- [x] Kein ungewolltes Zoomen, kein Doppeltipp-Zoom, kein „Gummiband“-Scrollen auf dem iPhone, kein graues Aufblitzen beim Antippen
- [x] Für die Meldungen ist fester Platz reserviert, damit das Layout beim Ein- und Ausblenden nicht springt
- [x] Ausführliche deutsche Kommentare in HTML, CSS und JS, mit Angaben, welche Werte man anpassen kann

### Hosting
- [x] Repo liegt auf GitHub und wird über GitHub Pages gehostet

## Noch offen

### Links
- [ ] Jeder Tag bekommt statt `?day=N` einen zufälligen, nicht erratbaren Code im Link (z. B. `?t=k7F2qX9a`), damit man andere Tage nicht durch Ändern der Zahl aufrufen kann (keine Verschlüsselung, die Wörter dürfen im Quelltext stehen)
- [ ] Ungültiger oder fehlender Code: freundliche Meldung statt Fallback auf Tag 1
- [ ] Optional: Zeitsperre, die ein Wordle erst ab 0 Uhr seines Tages freischaltet
- [ ] QR-Codes aus den fertigen Links erzeugen und zum Ausdrucken vorbereiten
- [ ] Prüfen, dass jeder Link auf dem Handy über GitHub Pages funktioniert

### Spielstand
- [x] Spielstand pro Tag speichern (Versuche, Farben, Tastatur, Sieg/Niederlage), damit Neuladen nichts zurücksetzt
- [x] Zum Testen: `&reset` an den Link hängen löscht den gespeicherten Stand dieses Tages
- [x] Wird das Wort eines Tages im Code geändert, startet dieser Tag automatisch neu

### Wortprüfung
- [ ] Nur echte englische Wörter mit 5 Buchstaben als Versuch zulassen (frei verfügbare Wortliste)
- [ ] Ungültiges Wort: Meldung „Not in word list“, der Versuch zählt nicht
- [ ] Die eigenen Lösungswörter werden immer akzeptiert, auch wenn sie nicht in der Liste stehen

### Nachrichten im Popup
- [x] Eigene Startnachricht pro Tag, die beim Öffnen des Wordles angezeigt wird
- [x] Nachricht nach jedem Versuch: zufällig aus einem Pool motivierender Nachrichten gewählt (unabhängig von der Anzahl grüner/gelber Buchstaben), im Code einstellbar
- [x] Sondernachrichten: Sieg (je nach Anzahl der Versuche, 7 Texte inkl. Bonusversuch) und „Last try“ nach dem 5. Fehlversuch
- [ ] Startnachrichten, Aufmunterungen, Siegesnachrichten und „Last try“ mit echten Texten füllen (`config.js`)
- [x] Das Popup kann auch längere Nachrichten zeigen (2 Zeilen, gleiche Breite wie das Raster)
- [ ] Optional: mehrere Pools je nach Fortschritt (Anzahl grüner/gelber Buchstaben), aus denen jeweils zufällig gewählt wird

### Bonusversuch (versteckte 7. Reihe)
- [x] Das Raster bekommt eine 7. Reihe, die zunächst unsichtbar ist, aber ihren Platz schon belegt (zwischen Reihe 6 und Tastatur); das Raster darf dafür etwas kleiner werden
- [x] Nach dem 6. Fehlversuch öffnet sich ein Dialogfenster mit einer im Code einstellbaren Nachricht
- [x] Der Dialog erscheint mit einstellbarer Verzögerung (z. B. 2 Sekunden); in der Wartezeit ist keine Eingabe möglich
- [x] Der Dialog hat 2 Buttons (Beschriftung im Code einstellbar), die beide dasselbe tun: Dialog schließen und die 7. Reihe einblenden
- [x] Danach kann man den Bonusversuch in Reihe 7 spielen; erst wenn auch der scheitert, gilt das Spiel als verloren
- [x] Eigene Niederlage-Nachricht in `config.js` (kommt erst nach dem gescheiterten Bonusversuch, ersetzt „The word was: …“)
- [x] Der Bonusversuch wird im gespeicherten Spielstand berücksichtigt (beim Neuladen nach 6 Fehlversuchen ist die 7. Reihe direkt sichtbar, kein erneuter Dialog)

### Verbesserungen am bestehenden Code
- [x] Bug behoben: Eine alte Meldung konnte eine neue zu früh ausblenden → Timer entfernt, jede Nachricht bleibt stehen, bis eine neue sie ablöst
- [x] Kommentare von „Rot“ auf „Gelb/Gold“ angepasst (`style.css`, `script.js`)
- [x] Zu kurzes Wort: Zeile wackelt (Shake-Animation) statt Meldung „Not enough letters!“
- [x] Nachrichtenfeld nicht mehr per Klasse `hidden` steuern, sondern automatisch ausblenden, solange es leer ist (`:empty`)
- [ ] Optional: Lesbarkeit prüfen – weiße Schrift auf hellem Gold ist evtl. schwer zu lesen (dunklere Schrift oder dunkleres Gold)
- [ ] Optional: Animation beim Aufdecken der Buchstaben und beim Sieg
