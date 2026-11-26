# Ágis Advent Wordle – ToDo-Liste

Wordle-Spiel für den Adventskalender. In manche Türchen kommt ein ausgedruckter QR-Code, der auf das Wordle des jeweiligen Tages verweist.

## Noch offen

### Vor dem 1. Dezember
- [ ] Probedruck der QR-Codes (`qr-codes.html`) mit Skalierung 100 %: Kartengröße mit dem Lineal prüfen, eine Karte knicken, wieder aufklappen und scannen
- [ ] Alle QR-Codes drucken und ausschneiden (Platzhalter-Karten aufheben, nicht wegwerfen)
- [ ] Jeden Link auf dem Handy über GitHub Pages prüfen (jede Karte einmal scannen, danach mit `&reset` den Spielstand wieder löschen)
- [ ] Echte Texte in `config.js`: Wörter und Startnachrichten der Wordle-Tage, Aufmunterungen, Siegesnachrichten, Bonus-Dialog, Begrüßungs-Dialoge
- [ ] Längste Nachrichten (vor allem mit Emojis) auf kleinem Handy prüfen (iPhone SE in der Device Toolbar): passen sie in 2 Zeilen? Emojis sind breiter als Buchstaben
- [ ] **GANZ ZUM SCHLUSS: Push-Benachrichtigungen einschalten** (`NOTIFY.enabled: true` in `config.js`), committen, pushen und einmal auf dem Handy prüfen

### Bilder, Sticker und GIFs (fertig, nur noch Bilder aussuchen)
- [ ] Passende Sticker/GIFs für die Tage und den Bonus-Dialog aussuchen, in `img/` legen und in `config.js` eintragen
- [x] Entschieden: Bilder/Sticker/GIFs nur in den Dialogen (Begrüßungs-Dialog pro Tag, Bonus-Dialog), nicht im Popup oben
- [x] Ordner für Bilddateien im Projekt anlegen (z. B. `img/`) und die Dateien dort ablegen (GIF, WebP z. B. WhatsApp-Sticker, PNG); auf kleine Dateigrößen achten, da auf dem Handy geladen
- [x] In `config.js` optional ein Bild angeben: `introImage` pro Tag, `image` im Bonus-Dialog
- [x] HTML/JavaScript: Bild-Element (`<img>`) in beiden Dialogen, das nur angezeigt wird, wenn ein Bild angegeben ist; der Begrüßungs-Dialog öffnet sich auch nur mit Bild ohne Text
- [x] CSS: Größe der Bilder begrenzen, damit sie auf jedem Handy passen

### Optional: Kalender mit allen bisherigen Tagen
- [ ] Kleine Extra-Seite (z. B. `calendar.html`), auf der man alle bisher gespielten Wörter mit der Anzahl der benötigten Versuche sieht
- [ ] Die Daten kommen aus den gespeicherten Spielständen im Handy-Speicher (`agis-wordle-day-N`); nur Tage anzeigen, die schon gespielt wurden

### Optional: Sonstiges
- [ ] Mehrere Pools für die Aufmunterungen je nach Fortschritt (Anzahl grüner/gelber Buchstaben), aus denen jeweils zufällig gewählt wird
- [ ] Lesbarkeit prüfen: weiße Schrift auf hellem Gold ist evtl. schwer zu lesen (dunklere Schrift oder dunkleres Gold)

## Bereits umgesetzt

### Spiel
- [x] Wordle-Grundspiel: Wörter mit 5 Buchstaben, 6 normale Versuche + 1 versteckter Bonusversuch
- [x] Spielfeld (7×5, die 7. Reihe zunächst unsichtbar) wird per JavaScript aufgebaut
- [x] Auswertung jedes Versuchs mit korrekter Behandlung doppelter Buchstaben (erst die exakten Treffer, dann die Buchstaben an falscher Stelle)
- [x] Farben: Grün = richtige Stelle, Gelb/Gold = kommt im Wort vor, aber an anderer Stelle, Grau = kommt nicht vor
- [x] Die Tasten der Bildschirmtastatur werden mit eingefärbt (Grün schlägt Gelb, Gelb schlägt Grau)
- [x] Aufdeck-Animation: Kacheln drehen sich nacheinander um und zeigen dabei ihre Farbe; Tastatur und Nachricht erst danach
- [x] Sieges-Animation: Kacheln der Gewinnzeile hüpfen nacheinander, dazu Konfetti (Farben und Menge in `config.js`); nur beim echten Gewinnen, nicht beim Neuladen
- [x] Zu kurzes Wort: Die Zeile wackelt (Shake-Animation)
- [x] Nach Sieg oder Niederlage ist keine Eingabe mehr möglich

### Wortprüfung
- [x] Nur echte englische Wörter mit 5 Buchstaben als Versuch zulassen (ENABLE-Wortliste, gemeinfrei, 8.636 Wörter in `words.js`)
- [x] Ungültiges Wort: Zeile wackelt, Meldung `NOT_IN_LIST_MESSAGE` (einstellbar in `config.js`), der Versuch zählt nicht
- [x] Die eigenen Lösungswörter werden immer akzeptiert, auch wenn sie nicht in der Liste stehen (z. B. SANTA)

### Tage, Links und QR-Codes
- [x] Alle Inhalte (Wörter, Texte, Codes) stehen in `config.js` in `DAYS`, die Spiellogik in `script.js`
- [x] Alle 24 Tage haben einen Code und ein Wordle (anfangs 8 davon als Platzhalter, inzwischen alle echte Tage)
- [x] Jeder Tag wird über einen zufälligen, nicht erratbaren Code im Link gewählt (`?t=vv5wqhmw`), damit man andere Tage nicht durch Ändern einer Zahl aufrufen kann (keine Verschlüsselung, die Wörter dürfen im Quelltext stehen)
- [x] Ungültiger oder fehlender Code: freundliche Meldung (`INVALID_LINK_MESSAGE`), Spielfeld und Tastatur ausgeblendet
- [x] Druckseite `qr-codes.html`: erzeugt für jeden Tag eine Karte „Door N“ mit QR-Code (3 cm, Karte ca. 4,2 × 4,5 cm, gestrichelte Schnittlinie), höchste Fehlerkorrektur (H), damit auch geknickte Codes lesbar bleiben

### Push-Benachrichtigungen (ntfy)
- [x] Push-Nachricht an mich über ntfy.sh, wenn sie den ersten Versuch eines Tages abschickt und wenn sie gewinnt (mit Anzahl der Versuche) oder verliert
- [x] Keine Nachricht beim Wiederherstellen des Spielstands; Schalter `NOTIFY.enabled` in `config.js` zum Abschalten beim Testen

### Spielstand
- [x] Spielstand pro Tag im Handy-Speicher (Versuche, Farben, Tastatur, Sieg/Niederlage, Bonusreihe), damit Neuladen nichts zurücksetzt
- [x] Zum Testen: `&reset` an den Link hängen löscht den gespeicherten Stand dieses Tages
- [x] Wird das Wort eines Tages im Code geändert, startet dieser Tag automatisch neu

### Nachrichten im Popup
- [x] Eigene Startnachricht pro Tag, die beim Öffnen des Wordles angezeigt wird
- [x] Nach jedem Versuch eine zufällige Aufmunterung aus einem Pool (`ENCOURAGEMENTS`), nie zweimal dieselbe direkt hintereinander
- [x] Siegesnachricht je nach Anzahl der Versuche (`WIN_MESSAGES`, 7 Texte inkl. Bonusversuch)
- [x] „Last try“-Nachricht nach dem 5. Fehlversuch (`LAST_TRY_MESSAGE`)
- [x] Niederlage-Nachricht mit Lösungswort (`LOSS_MESSAGE`, `{WORD}` wird ersetzt), erst nach dem gescheiterten Bonusversuch
- [x] Das Popup zeigt bis zu 2 Zeilen, gleiche Breite wie das Raster, und wird automatisch ausgeblendet, solange es leer ist (`:empty`)
- [x] Jede Nachricht bleibt stehen, bis eine neue sie ablöst (keine Timer mehr)

### Bonusversuch (versteckte 7. Reihe)
- [x] Die 7. Reihe ist zunächst unsichtbar, belegt aber schon ihren Platz, damit das Layout nicht springt
- [x] Nach dem 6. Fehlversuch öffnet sich mit einstellbarer Verzögerung ein Dialog; in der Wartezeit ist keine Eingabe möglich
- [x] Der Dialog hat 2 Buttons (gleich breit, Beschriftung einstellbar), die beide dasselbe tun: Dialog schließen und die 7. Reihe einblenden
- [x] Der Bonusversuch wird im Spielstand berücksichtigt (beim Neuladen ist die 7. Reihe direkt sichtbar, kein erneuter Dialog)

### Begrüßungs-Dialog
- [x] Dialogfenster mit eigener Nachricht pro Tag und einem Button (aktuell an Tag 2 und Tag 24); Tage ohne `intro` haben keinen Dialog
- [x] Erscheint nur, solange an dem Tag noch kein Versuch gemacht wurde
- [x] Zeilenumbrüche mit `\n` in den Dialogtexten
- [x] Gemeinsames Aussehen mit dem Bonus-Dialog (CSS-Klasse `game-dialog`)
- [x] Mit Bild: Button gesperrt (halb durchsichtig), bis das Bild geladen ist, spätestens nach `INTRO_BUTTON_MAX_WAIT` (config.js)

### Eingabe
- [x] Bildschirmtastatur (QWERTY) mit ENTER und ⌫
- [x] Eingabe über die normale Tastatur am Laptop/PC (Buchstaben, Enter, Backspace)

### Design und Handy-Layout
- [x] Weihnachtliches Design: dunkelgrüner Hintergrund, goldener Titel „🎄 Christmas Wordle 🎄“, Schriftart Montserrat
- [x] Alle Farben stehen als Variablen an einer Stelle in `style.css`
- [x] Größen passen sich dem Bildschirm an: Die Kacheln richten sich nach der verfügbaren Breite und Höhe, damit auf kleinen und großen Handys nichts gescrollt werden muss
- [x] Die tatsächlich sichtbare Bildschirmhöhe (`dvh`) wird berücksichtigt, damit die ein- und ausfahrende Adressleiste nicht stört
- [x] Kein ungewolltes Zoomen, kein Doppeltipp-Zoom, kein „Gummiband“-Scrollen auf dem iPhone, kein graues Aufblitzen beim Antippen
- [x] Ausführliche deutsche Kommentare in HTML, CSS und JS, mit Angaben, welche Werte man anpassen kann

### Hosting
- [x] Repo liegt auf GitHub und wird über GitHub Pages gehostet
