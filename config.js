/* ==========================================================================
   EINSTELLUNGEN FÜR DEN ADVENTSKALENDER
   In dieser Datei stehen alle Inhalte, die du selbst anpassen kannst.
   Die Spiellogik steht in script.js und muss dafür nicht geändert werden.
   ========================================================================== */


/* --------------------------------------------------------------------------
   TAGE: Wort, Startnachricht und (optional) Begrüßungs-Dialog pro Tag
   - Die Zahl links ist der Tag. Sie dient nur der Übersicht und als Name des
     Speicherplatzes für den Spielstand (nach dem ersten Spielen nicht mehr ändern,
     sonst ist der gespeicherte Spielstand dieses Tages weg).
   - code:  Der Code im Link bzw. QR-Code (z. B. ".../?t=vv5wqhmw"). Nur Buchstaben
            und Ziffern, jeder Code darf nur einmal vorkommen. NACH DEM DRUCKEN
            DER QR-CODES NIE MEHR ÄNDERN, sonst führt der QR-Code ins Leere.
            Neuen Code erzeugen (Browser-Console): Math.random().toString(36).slice(2, 10)
   - word:  Das Lösungswort. Genau 5 Buchstaben, in GROSSBUCHSTABEN.
   - start: Die Nachricht, die beim Öffnen des Wordles im Popup steht.
            Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen.
   - intro: OPTIONAL. Text für ein Dialogfenster, das beim Öffnen des Wordles
            erscheint (nur solange an dem Tag noch kein Versuch gemacht wurde).
            Darf länger sein. Fehlen "intro" UND "introImage", gibt es an dem Tag
            keinen Dialog.
            Eigene Zeilenumbrüche mit \n, eine Leerzeile mit \n\n
            (z. B. "Hallo!\nSchön, dass du da bist."). Das funktioniert nur
            in den Dialogen, nicht in den Popup-Nachrichten oben.
   - introImage: OPTIONAL. Bild/Sticker/GIF im Begrüßungs-Dialog, über dem Text.
            Pfad zur Datei im Ordner img, z. B. "img/santa.gif".
            Der Dialog öffnet sich auch, wenn es nur ein Bild und keinen
            "intro"-Text gibt (dann nur Bild und Button).
            Dateinamen nur klein, ohne Leerzeichen und Umlaute: GitHub Pages
            unterscheidet Groß-/Kleinschreibung, der Mac nicht. Falsch
            geschrieben funktioniert es nur lokal, nicht auf dem Handy.
            Dateien möglichst unter 1-2 MB, da sie übers Handynetz geladen werden.
   - Nur Tage, die hier stehen, haben ein Wordle. Ein neuer Tag braucht
     nur eine neue Zeile (Komma am Zeilenende nicht vergessen).
   - PLATZHALTER: Tage mit "(Platzhalter, keine Karte)" haben schon einen Code,
     ihre QR-Karte kommt aber (noch) nicht ins Türchen. So kann man später
     ein Wordle daraus machen, ohne neu drucken zu müssen: einfach Wort und
     Texte anpassen, den Kommentar entfernen und die Karte ins Türchen legen.
     Auch Platzhalter brauchen ein echtes Wort, denn alle Lösungswörter
     gelten automatisch als gültige Eingabe.
   - Wird das Wort eines Tages geändert, startet der gespeicherte Spielstand
     dieses Tages neu.
   -------------------------------------------------------------------------- */
const DAYS = {
    1:  { code: "e3zclnwg", word: "BELLS", start: "...", introImage: "img/guten-morgen-sonnenschein.gif" }, // Christmas Deko (Platzhalter, keine Karte)
    2:  { code: "vv5wqhmw", word: "HEART", start: "Hello", intro: "Oh? Hoho SANTA What's this? PRESENT\nIt seems to be your very own\n✨ Christmas Wordle ✨\n\nMerry Christmas Ági and enjoy! CHRISTMASTREE" },
    3:  { code: "nph27ccs", word: "SNOWY", start: "Guten Morgen Sonnenschein! SUN" },
    4:  { code: "xk9zr8yv", word: "ANGEL", start: "..." },
    5:  { code: "80qexlj4", word: "PAINT", start: "Today I have a little something for you!\nMaybe today's word is a clue?" }, // Fenster Stift (Platzhalter, keine Karte)
    6:  { code: "7g8j2b3d", word: "GIFTS", start: "..." },
    7:  { code: "7h5qbhqx", word: "CHEER", start: "..." }, // Picture + Pins (Platzhalter, keine Karte)
    8:  { code: "qj4m2p1l", word: "FEAST", start: "..." },
    9:  { code: "kz3f8v5n", word: "FROST", start: "..." },
    10: { code: "w66sqmcl", word: "GLOWS", start: "..." }, // Scented Candle (Platzhalter, keine Karte) ADD HINT
    11: { code: "wf7t3n4s", word: "SANTA", start: "..." },
    12: { code: "bq5v8k2m", word: "ELVES", start: "..." },
    13: { code: "vdkkxsfs", word: "DEERS", start: "..." }, // Little Reindeer (Platzhalter, keine Karte) ADD HINT
    14: { code: "dr8u5v2c", word: "MAGIC", start: "..." },
    15: { code: "xj2k9b7m", word: "TREES", start: "..." },
    16: { code: "2jldpus6", word: "CANDY", start: "..." }, // Sweets (Platzhalter, keine Karte)
    17: { code: "yq3v8n5k", word: "SUGAR", start: "..." },
    18: { code: "p8v3n6s4", word: "SLEDS", start: "..." },
    19: { code: "5hkfkmq7", word: "STICK", start: "Is there anything else in the calendar?\nGo check after solving!" }, // Stickers (Platzhalter, keine Karte)
    20: { code: "pm6y9k4x", word: "SWEET", start: "..." },
    21: { code: "h7k2v5n8", word: "FROST", start: "..." },
    22: { code: "zyv6i1da", word: "NAILS", start: "Another clue today!\nWhat could you be in the calendar today?!" }, // Nailpolish (Platzhalter, keine Karte)
    23: { code: "r5n8k2v3", word: "MERRY", start: "..." },
    24: { code: "6e6yanjd", word: "LOVED", start: "...", intro: "I hope you enjoyed your Christmas Wordle!" },
};


/* --------------------------------------------------------------------------
   BEGRÜSSUNGS-DIALOG: Beschriftung des Buttons, der den Dialog schließt.
   Gilt für alle Tage, die oben in DAYS ein "intro" haben.
   -------------------------------------------------------------------------- */
const INTRO_BUTTON = "Let's go!";


/* --------------------------------------------------------------------------
   AUFMUNTERUNGEN: Nach jedem Versuch (außer bei Sieg/Niederlage) wird
   zufällig eine dieser Nachrichten im Popup angezeigt.
   - Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen pro Nachricht.
   - Mindestens 2 Nachrichten eintragen, damit sich nichts direkt wiederholt.
   - Jede Nachricht in Anführungszeichen, mit Komma dahinter.
   -------------------------------------------------------------------------- */
const ENCOURAGEMENTS = [
    "Doing amazing sweetie!",
    "You can do it!",
    "Keep going!",
];


/* --------------------------------------------------------------------------
   SIEGESNACHRICHTEN: Werden angezeigt, wenn das Wort erraten wurde.
   Welche Nachricht kommt, hängt davon ab, im wievielten Versuch es geklappt hat.
   - Reihenfolge nicht ändern: 1. Eintrag = im 1. Versuch gelöst,
     2. Eintrag = im 2. Versuch gelöst, ... 7. Eintrag = im Bonusversuch gelöst.
   - Es müssen genau 7 Nachrichten sein (6 normale Versuche + Bonusversuch).
   - Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen pro Nachricht.
   -------------------------------------------------------------------------- */
const WIN_MESSAGES = [
    "...1", // im 1. Versuch gelöst
    "...2", // im 2. Versuch gelöst
    "...3", // im 3. Versuch gelöst
    "...4", // im 4. Versuch gelöst
    "...5", // im 5. Versuch gelöst
    "...6", // im 6. Versuch gelöst
    "...7", // im Bonusversuch (7.) gelöst
];


/* --------------------------------------------------------------------------
   LETZTER VERSUCH: Wird nach dem 5. Fehlversuch angezeigt, also bevor der
   6. Versuch beginnt (der scheinbar letzte, vom Bonusversuch weiß sie nichts).
   - Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen.
   -------------------------------------------------------------------------- */
const LAST_TRY_MESSAGE = "LAST CHANCE ÁGI!";


/* --------------------------------------------------------------------------
   BONUSVERSUCH: Nach dem 6. Fehlversuch öffnet sich ein Dialogfenster.
   Beide Buttons tun absichtlich dasselbe: Dialog schließen und die
   versteckte 7. Zeile für den Bonusversuch einblenden.
   - popup:   Nachricht im normalen Popup oben (wo auch die Aufmunterungen
              stehen). Erscheint nach dem 6. Fehlversuch und bleibt während
              und nach dem Dialog stehen. Max. ca. 60 Zeichen.
   - dialog:  Text im Dialogfenster. Darf etwas länger sein.
   - button1: Beschriftung des linken Buttons.
   - button2: Beschriftung des rechten Buttons.
   - image:   OPTIONAL. Bild/Sticker/GIF im Dialog, über dem Text (Pfad wie
              bei introImage, z. B. "img/sad-santa.gif"). Leer lassen ("")
              oder die Zeile löschen = kein Bild.
   - delay:  Wartezeit nach dem Aufdecken des 6. Fehlversuchs, bis sich der Dialog öffnet.
              In Millisekunden: 1000 = 1 Sekunde. Solange ist keine Eingabe möglich.
   -------------------------------------------------------------------------- */
const BONUS = {
    popup:   "Oouuar nouaar, it's over! OR IS IT?!",
    dialog:  "...",
    button1: "Yes",
    button2: "YESSS!",
    image:   "img/aaron-insane.webp", // optional, leer lassen = kein Bild
    delay:   2000,
};


/* --------------------------------------------------------------------------
   NIEDERLAGE: Wird angezeigt, wenn auch der Bonusversuch (7.) fehlschlägt.
   - {WORD} wird automatisch durch das Lösungswort ersetzt. Du kannst es an
     jede Stelle im Satz schreiben (oder weglassen, dann fehlt das Wort).
   - Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen (inkl. Wort).
   -------------------------------------------------------------------------- */
const LOSS_MESSAGE = "Oopsie, the word was {WORD}.";


/* --------------------------------------------------------------------------
   UNGÜLTIGER LINK: Wird im Popup angezeigt, wenn der Link keinen oder einen
   unbekannten Code enthält (z. B. abgetippt, verändert oder ohne "?t=...").
   Spielfeld und Tastatur werden dann ausgeblendet.
   - Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen.
   -------------------------------------------------------------------------- */
const INVALID_LINK_MESSAGE = "Hmm, this door isn't open yet… 🎁";


/* --------------------------------------------------------------------------
   UNBEKANNTES WORT: Wird im Popup angezeigt, wenn das eingegebene Wort nicht
   in der Wortliste (words.js) steht. Der Versuch zählt dann nicht.
   - Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen.
   -------------------------------------------------------------------------- */
const NOT_IN_LIST_MESSAGE = "Not a real word, Ági.";


/* --------------------------------------------------------------------------
   KONFETTI: Fliegt über den Bildschirm, wenn das Wort erraten wurde
   (direkt nach dem Aufdecken, gleichzeitig mit den hüpfenden Kacheln).
   Kommt nur beim Gewinnen selbst, nicht beim erneuten Öffnen eines schon
   gelösten Tages.
   - colors: Farben der Konfetti-Stücke als Hex-Farbcodes in Anführungszeichen,
             beliebig viele, mit Komma getrennt.
   - amount: Anzahl der Konfetti-Stücke. Mehr = dichter, aber auf älteren
             Handys evtl. ruckelig. Sinnvoll: ca. 100 bis 300.
   -------------------------------------------------------------------------- */
const CONFETTI = {
    colors: ["#e5c158", "#538d4e", "#c0392b", "#ffffff"], // Gold, Grün, Rot, Weiß
    amount: 150,                                           // Anzahl der Konfetti-Stücke
};
