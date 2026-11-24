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
            Darf länger sein. Fehlt das Feld, gibt es an dem Tag keinen Dialog.
            Eigene Zeilenumbrüche mit \n, eine Leerzeile mit \n\n
            (z. B. "Hallo!\nSchön, dass du da bist."). Das funktioniert nur
            in den Dialogen, nicht in den Popup-Nachrichten oben.
   - Nur Tage, die hier stehen, haben ein Wordle. Ein neuer Tag braucht
     nur eine neue Zeile (Komma am Zeilenende nicht vergessen).
   - Wird das Wort eines Tages geändert, startet der gespeicherte Spielstand
     dieses Tages neu.
   -------------------------------------------------------------------------- */
const DAYS = {
    1:  { code: "vv5wqhmw", word: "HEART", start: "Hello", intro: "Oh? Hoho SANTA What's this? PRESENT\nIt seems to be your very own\n✨ Christmas Wordle ✨\n\nMerry Christmas Ági and enjoy! CHRISTMASTREE" },
    3:  { code: "nph27ccs", word: "SNOWY", start: "Guten Morgen Sonnenschein! SUN" },
    5:  { code: "xk9zr8yv", word: "ANGEL", start: "..." },
    8:  { code: "qj4m2p1l", word: "LIGHT", start: "..." },
    12: { code: "wf7t3n4s", word: "SANTA", start: "..." },
    15: { code: "dr8u5v2c", word: "MAGIC", start: "..." },
    20: { code: "pm6y9k4x", word: "SWEET", start: "..." },
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
   - delay:   Wartezeit nach dem 6. Fehlversuch, bis sich der Dialog öffnet.
              In Millisekunden: 1000 = 1 Sekunde. Solange ist keine Eingabe möglich.
   -------------------------------------------------------------------------- */
const BONUS = {
    popup:   "Oouuar nouaar, it's over! OR IS IT?!",
    dialog:  "...",
    button1: "Yes",
    button2: "YESSS!",
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
