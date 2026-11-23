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
    1:  { word: "HEART", start: "..." },
    3:  { word: "SNOWY", start: "..." },
    5:  { word: "ANGEL", start: "..." },
    8:  { word: "LIGHT", start: "..." },
    12: { word: "SANTA", start: "..." },
    15: { word: "MAGIC", start: "..." },
    20: { word: "SWEET", start: "..." },
    24: { word: "LOVED", start: "..." }
};
