/* ==========================================================================
   EINSTELLUNGEN FÜR DEN ADVENTSKALENDER
   In dieser Datei stehen alle Inhalte, die du selbst anpassen kannst.
   Die Spiellogik steht in script.js und muss dafür nicht geändert werden.
   ========================================================================== */


/* --------------------------------------------------------------------------
   TAGE: Wort und Startnachricht pro Tag
   - Die Zahl links ist der Tag. Sie entspricht dem URL-Parameter (?day=1, ?day=3 etc.).
   - word:  Das Lösungswort. Genau 5 Buchstaben, in GROSSBUCHSTABEN.
   - start: Die Nachricht, die beim Öffnen des Wordles im Popup steht.
            Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen.
   - Nur Tage, die hier stehen, haben ein Wordle. Ein neuer Tag braucht
     nur eine neue Zeile (Komma am Zeilenende nicht vergessen).
   - Wird das Wort eines Tages geändert, startet der gespeicherte Spielstand
     dieses Tages neu.
   -------------------------------------------------------------------------- */
const DAYS = {
    1:  { word: "HEART", start: "Guten Morgen Sonnenschein!" },
    3:  { word: "SNOWY", start: "..." },
    5:  { word: "ANGEL", start: "..." },
    8:  { word: "LIGHT", start: "..." },
    12: { word: "SANTA", start: "..." },
    15: { word: "MAGIC", start: "..." },
    20: { word: "SWEET", start: "..." },
    24: { word: "LOVED", start: "..." }
};


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
const LAST_TRY_MESSAGE = "LAST CHANCE!";


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
    popup:   "Oouuar noouaar, it's over! OR IS IT?",
    dialog:  "...",
    button1: "Yes",
    button2: "YESSS!",
    delay:   1500,
};


/* --------------------------------------------------------------------------
   NIEDERLAGE: Wird angezeigt, wenn auch der Bonusversuch (7.) fehlschlägt.
   - {WORD} wird automatisch durch das Lösungswort ersetzt. Du kannst es an
     jede Stelle im Satz schreiben (oder weglassen, dann fehlt das Wort).
   - Maximal 2 Zeilen auf dem Handy, also ca. 60 Zeichen (inkl. Wort).
   -------------------------------------------------------------------------- */
const LOSS_MESSAGE = "Oopsie, the word was {WORD}.";
