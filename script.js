/* URL-Parameter auslesen: Der Link aus dem QR-Code enthält den Code des Tages (z. B. "?t=vv5wqhmw") */
const urlParams = new URLSearchParams(window.location.search);
const currentCode = urlParams.get("t"); // Code aus dem Link (null, wenn der Link keinen Code enthält)

/* Den Tag suchen, dessen "code" in DAYS (config.js) zum Code aus dem Link passt.
   "for ... in" geht alle Schlüssel von DAYS durch, also die Tageszahlen "1", "3", "5", ...
   Passt kein Code (falscher oder fehlender Link), bleibt currentDay null */
let currentDay = null;
for (const day in DAYS) {
    if (DAYS[day].code === currentCode) {
        currentDay = day;
        break; // Treffer gefunden, die restlichen Tage müssen nicht mehr geprüft werden
    }
}

/* Daten des gefundenen Tages (Code, Wort, Startnachricht, Intro) aus DAYS holen.
   Ohne passenden Code ist today undefined. Dann startet das Spiel nicht (siehe "Spiel initialisieren" ganz unten) */
const today = DAYS[currentDay];
const targetWord = today?.word; // "?." = nur auf .word zugreifen, wenn today existiert, sonst undefined (statt Absturz)

/* Spielregeln-Konstanten: 6 normale Versuche + 1 versteckter Bonusversuch (Zeilen) und 5 Buchstaben pro Wort (Spalten) */
const ROWS = 6;             // Anzahl der normalen Versuche (darauf bauen "Last try" und die Siegesnachrichten auf)
const TOTAL_ROWS = ROWS + 1; // Anzahl aller Zeilen im Raster: normale Versuche + 1 Bonuszeile
const COLS = 5;
let currentRow = 0;        // Zeigt an, in welcher Zeile gerade getippt wird
let currentCol = 0;        // Zeigt an, in welcher Spalte der nächste Buchstabe landet
let currentGuess = "";     // Speichert das aktuell eingegebene Wort als Textstring
let isGameOver = false;    // Statusvariable: True, wenn das Spiel gewonnen oder verloren ist
let savedGuesses = [];     // Alle bereits abgeschickten Versuche (werden im Handy-Speicher gesichert)
let lastRandomMessage = "";  // Zuletzt zufällig gewählte Nachricht, damit sie nicht direkt wiederholt wird
let isWaitingForBonus = false; // Statusvariable: True zwischen dem 6. Fehlversuch und dem Schließen des Bonus-Dialogs (Eingabe gesperrt)

/* ==========================================================================
   SPIELSTAND SPEICHERN
   Jeder abgeschickte Versuch wird im Speicher des Browsers auf dem Handy
   abgelegt ("localStorage"), getrennt für jeden Tag. Beim Neuladen der Seite
   werden die Versuche wiederhergestellt, inklusive Farben und Tastatur.
   - Wird das Wort eines Tages im Code geändert, startet dieser Tag neu.
   - Zum Testen: "&reset" an den Link hängen (z. B. "?t=vv5wqhmw&reset"), dann
     wird der gespeicherte Stand dieses Tages gelöscht.
   ========================================================================== */
const STORAGE_KEY = `agis-wordle-day-${currentDay}`; // Name des Speicherplatzes, z. B. "agis-wordle-day-3"

/* Funktion: Speichert das Zielwort und alle bisherigen Versuche */
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ word: targetWord, guesses: savedGuesses }));
    } catch (e) {
        // Speichern nicht möglich (z. B. privater Modus) – das Spiel funktioniert trotzdem, nur ohne Speichern
    }
}

/* Funktion: Lädt die gespeicherten Versuche (leere Liste, wenn nichts gespeichert ist) */
function loadState() {
    try {
        if (urlParams.has("reset")) {
            localStorage.removeItem(STORAGE_KEY);
            // "reset" aus der Adresszeile entfernen, damit nicht jedes Neuladen wieder alles löscht
            urlParams.delete("reset");
            history.replaceState(null, "", `${location.pathname}?${urlParams}`);
            return [];
        }
        const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
        // Nur übernehmen, wenn der Stand zum aktuellen Wort passt
        if (state && state.word === targetWord && Array.isArray(state.guesses)) {
            return state.guesses.filter(g => typeof g === "string" && /^[A-Z]{5}$/.test(g));
        }
    } catch (e) {
        // Fehlerhafter oder nicht lesbarer Speicher – einfach neu starten
    }
    return [];
}

/* Funktion: Spielt alle gespeicherten Versuche noch einmal ab (ohne sie erneut zu speichern).
   applyGuess bekommt dabei isRestoring = true, damit z. B. der Bonus-Dialog nicht erneut aufgeht */
function restoreState() {
    savedGuesses = loadState();
    for (const guess of savedGuesses) {
        if (isGameOver) break;
        applyGuess(guess, true);
    }
}

/* HTML-Elemente für Spielfeld, Nachrichtenbox, Begrüßungs- und Bonus-Dialog im Code verfügbar machen */
const board = document.getElementById("board");
const messageContainer = document.getElementById("message-container");

const introDialog = document.getElementById("intro-dialog");     // Begrüßungs-Dialog: das ganze Fenster (zum Öffnen/Schließen)
const introText = document.getElementById("intro-text");         // Begrüßungs-Dialog: nur der Textabsatz
const introButton = document.getElementById("intro-button");     // Begrüßungs-Dialog: Button zum Schließen

const bonusDialog = document.getElementById("bonus-dialog");     // Bonus-Dialog: das ganze Fenster (zum Öffnen/Schließen)
const bonusText = document.getElementById("bonus-text");         // Bonus-Dialog: nur der Textabsatz
const bonusButton1 = document.getElementById("bonus-button-1");  // Bonus-Dialog: linker Button
const bonusButton2 = document.getElementById("bonus-button-2");  // Bonus-Dialog: rechter Button

/* Funktion: Erstellt das Raster (6 normale Zeilen + 1 versteckte Bonuszeile, je 5 Kacheln) beim Laden der Seite dynamisch im HTML */
function initBoard() {
    for (let r = 0; r < TOTAL_ROWS; r++) {
        const row = document.createElement("div");
        row.classList.add("row");
        if (r === TOTAL_ROWS - 1) {
            row.classList.add("bonus-row"); // Letzte Zeile = Bonuszeile (per CSS versteckt, bis sie die Klasse "revealed" bekommt)
        }
        for (let c = 0; c < COLS; c++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.id = `tile-${r}-${c}`; // Jede Kachel erhält eine ID wie "tile-0-1"
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

/* Funktion: Zeigt eine Nachricht im Popup an. Sie bleibt stehen, bis die nächste Nachricht sie ersetzt */
function showMessage(msg) {
    messageContainer.textContent = msg;
}

/* Funktion: Fügt einen getippten Buchstaben in die aktuelle Kachel ein */
function addLetter(letter) {
    if (isGameOver || isWaitingForBonus || currentCol >= COLS) return; // Nichts tun, wenn Spiel vorbei, Warten auf Bonus-Dialog oder Zeile voll
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = letter;
    currentGuess += letter;
    currentCol++;
}

/* Funktion: Löscht den letzten Buchstaben (Backspace / ⌫) */
function deleteLetter() {
    if (isGameOver || isWaitingForBonus || currentCol <= 0) return; // Nichts tun, wenn Spiel vorbei, Warten auf Bonus-Dialog oder Zeile leer
    currentCol--;
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = "";
    currentGuess = currentGuess.slice(0, -1);
}

/* Funktion: Lässt die aktuelle Zeile kurz wackeln (Animation steht in style.css unter "shake").
   Die Klasse wird nach der Animation wieder entfernt, damit die Zeile beim nächsten Mal erneut wackeln kann */
function shakeRow() {
    const row = board.children[currentRow];
    row.classList.add("shake");
    row.addEventListener("animationend", () => {
        row.classList.remove("shake");
    }, { once: true });
}

/* Funktion: Macht die versteckte Bonuszeile (letzte Zeile im Raster) sichtbar.
   Die Klasse "revealed" schaltet in style.css "visibility: hidden" wieder auf sichtbar */
function revealBonusRow() {
    const bonusRow = board.children[TOTAL_ROWS - 1];
    bonusRow.classList.add("revealed");
}

/* Funktion: Wird von BEIDEN Buttons im Bonus-Dialog aufgerufen (beide tun absichtlich dasselbe):
   Dialog schließen und die Bonuszeile einblenden */
function closeBonusDialog() {
    isWaitingForBonus = false; // Bonusversuch ist jetzt freigeschaltet
    bonusDialog.close();
    revealBonusRow();
}

/* Funktion: Wählt eine zufällige Nachricht aus der übergebenen Liste.
   Dieselbe Nachricht kommt nie zweimal direkt hintereinander (außer die Liste hat nur einen Eintrag) */
function randomMessage(list) {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * list.length);
    } while (list.length > 1 && list[randomIndex] === lastRandomMessage);
    lastRandomMessage = list[randomIndex];
    return list[randomIndex];
}

/* Funktion: Überprüft das eingegebene Wort nach dem Drücken von ENTER */
function submitGuess() {
    if (isGameOver || isWaitingForBonus) return; // Nichts tun, wenn Spiel vorbei oder Warten auf Bonus-Dialog
    
    // Prüfen, ob die Zeile komplett mit 5 Buchstaben gefüllt ist
    if (currentGuess.length < COLS) {
        shakeRow();
        return;
    }

    /* Versuch merken und sofort im Handy-Speicher sichern, dann auswerten */
    savedGuesses.push(currentGuess);
    saveState();
    applyGuess(currentGuess);
}

/* Funktion: Entscheidet, welche Nachricht nach einem Versuch im Popup erscheint, und gibt sie zurück.
   Zeigt selbst nichts an und ändert nichts am Spiel. Wird aufgerufen, NACHDEM applyGuess den
   Spielzustand (currentRow) aktualisiert hat. Die Texte stehen in config.js.
   Reihenfolge: erst die beiden Spielenden (Sieg, Niederlage), dann die Zwischenstände vom
   spätesten zum frühesten (Bonus, letzter Versuch), zuletzt die normale Aufmunterung.
   Jeder Fall endet mit return, deshalb ist kein else nötig. */
function messageAfterGuess(guess) {
    // 1. Gewonnen (muss zuerst kommen, auch ein Sieg im 6. oder 7. Versuch ist ein Sieg).
    //    Bei einem Sieg wird currentRow nicht erhöht, ist also 0 beim 1. Versuch,
    //    1 beim 2. Versuch usw. Das passt direkt als Position in WIN_MESSAGES
    if (guess === targetWord) {
        return WIN_MESSAGES[currentRow];
    }
    // 2. Auch der Bonusversuch falsch (currentRow = 7 = TOTAL_ROWS): verloren.
    //    .replace() ersetzt den Platzhalter {WORD} durch das Lösungswort
    if (currentRow >= TOTAL_ROWS) {
        return LOSS_MESSAGE.replace("{WORD}", targetWord);
    }
    // 3. 6. Versuch falsch (currentRow = 6 = ROWS): Nachricht zum Bonusversuch, der Dialog folgt verzögert
    if (currentRow === ROWS) {
        return BONUS.popup;
    }
    // 4. Nur noch eine (scheinbar letzte) Zeile übrig (nach dem 5. Versuch ist currentRow = 5 = ROWS - 1)
    if (currentRow === ROWS - 1) {
        return LAST_TRY_MESSAGE;
    }
    // 5. Sonst: zufällige Aufmunterung
    return randomMessage(ENCOURAGEMENTS);
}

/* Funktion: Wertet einen Versuch aus, färbt die Zeile und prüft auf Sieg, Bonusversuch oder Niederlage.
   Wird beim normalen Spielen UND beim Wiederherstellen des Spielstands benutzt.
   - guess:       das abgeschickte Wort
   - isRestoring: true, wenn der Versuch beim Neuladen aus dem Speicher abgespielt wird
                  (dann z. B. kein Bonus-Dialog). Standardwert false = normales Spielen,
                  deshalb reicht in submitGuess der Aufruf applyGuess(currentGuess) */
function applyGuess(guess, isRestoring = false) {
    const targetArray = targetWord.split("");
    const guessArray = guess.split("");
    const statuses = Array(COLS).fill("absent"); // Standardmäßig alles grau markieren

    /* 1. Durchgang: Nach exakten Treffern suchen (Grün / correct) */
    for (let i = 0; i < COLS; i++) {
        if (guessArray[i] === targetArray[i]) {
            statuses[i] = "correct";
            targetArray[i] = null; // Buchstabe als verbraucht markieren
        }
    }

    /* 2. Durchgang: Nach Buchstaben an falscher Stelle suchen (Gelb/Gold / present) */
    for (let i = 0; i < COLS; i++) {
        if (statuses[i] !== "correct" && targetArray.includes(guessArray[i])) {
            statuses[i] = "present";
            targetArray[targetArray.indexOf(guessArray[i])] = null; // Ersten Treffer im Zielwort verbrauchen
        }
    }

    /* Kacheln im Spielfeld beschriften und färben, Tasten auf der Bildschirmtastatur entsprechend färben */
    for (let i = 0; i < COLS; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.textContent = guessArray[i]; // nötig beim Wiederherstellen, da die Kachel dann noch leer ist
        tile.classList.add(statuses[i]);
        updateKeyboardColor(guessArray[i], statuses[i]);
    }

    /* Spielzustand aktualisieren */
    if (guess === targetWord) {
        // Gewonnen: Spiel beenden (currentRow bleibt auf der Gewinnzeile stehen)
        isGameOver = true;
    } else {
        // Nicht gewonnen: in die nächste Zeile springen
        currentRow++;
        currentCol = 0;
        currentGuess = "";
        if (currentRow === ROWS) {
            // 6. Versuch falsch: Bonusversuch vorbereiten
            if (!isRestoring) {
                // Beim normalen Spielen: Eingabe sperren und den Bonus-Dialog nach der Wartezeit
                // aus config.js (BONUS.delay) öffnen. Die Sperre hebt closeBonusDialog() wieder auf
                isWaitingForBonus = true;
                setTimeout(() => {
                    bonusDialog.showModal(); // Dialogfenster öffnen (mit Text und Buttons aus config.js)
                }, BONUS.delay);
            } else {
                // Beim Wiederherstellen (Neuladen): Den Dialog hat sie schon gesehen, daher keine Sperre
                // und kein Dialog, sondern die Bonuszeile direkt einblenden. Gilt für alle Fälle nach
                // 6 Fehlversuchen (Dialog offen/geschlossen, Bonusversuch gespielt oder nicht)
                revealBonusRow();
            }
        } else if (currentRow === TOTAL_ROWS) {
            // Auch der Bonusversuch (7.) falsch: alle Zeilen aufgebraucht, Spiel verloren
            isGameOver = true;
        }
    }

    /* Passende Nachricht zum neuen Spielzustand anzeigen */
    showMessage(messageAfterGuess(guess));
}

/* Funktion: Färbt die Tasten auf der Bildschirmtastatur ein (Grün hat Vorrang vor Gelb/Gold, Gelb/Gold vor Grau) */
function updateKeyboardColor(letter, status) {
    const key = document.querySelector(`button[data-key="${letter}"]`);
    if (!key) return;

    if (status === "correct") {
        key.classList.remove("present", "absent");
        key.classList.add("correct");
    } else if (status === "present" && !key.classList.contains("correct")) {
        key.classList.remove("absent");
        key.classList.add("present");
    } else if (status === "absent" && !key.classList.contains("correct") && !key.classList.contains("present")) {
        key.classList.add("absent");
    }
}

/* Event-Listener: Lauscht auf Klicks der virtuellen Bildschirmtastatur */
document.querySelectorAll("#keyboard button").forEach(button => {
    button.addEventListener("click", () => {
        const key = button.getAttribute("data-key");
        handleInput(key);
    });
});

/* Event-Listener: Der Button im Begrüßungs-Dialog schließt nur den Dialog.
   Eine Eingabesperre ist nicht nötig, solange der Dialog offen ist, ist das Spiel dahinter ohnehin gesperrt */
introButton.addEventListener("click", () => {
    introDialog.close();
});

/* Event-Listener: Beide Buttons im Bonus-Dialog rufen dieselbe Funktion auf.
   Wichtig: closeBonusDialog OHNE Klammern übergeben, damit sie erst beim Klick ausgeführt wird */
bonusButton1.addEventListener("click", closeBonusDialog);
bonusButton2.addEventListener("click", closeBonusDialog);

/* Event-Listener: Lauscht auf physische Tastatureingaben (falls am Laptop/PC gespielt wird) */
document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (key === "ENTER") {
        handleInput("ENTER");
    } else if (key === "BACKSPACE") {
        handleInput("BACKSPACE");
    } else if (/^[A-Z]$/.test(key)) {
        handleInput(key);
    }
});

/* Zentrale Steuerungsfunktion für alle Arten von Tasteneingaben */
function handleInput(key) {
    if (key === "ENTER") {
        submitGuess();
    } else if (key === "BACKSPACE") {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

/* ==========================================================================
   SPIEL INITIALISIEREN
   Gültiger Link (Code passt zu einem Tag): Spiel ganz normal starten.
   Ungültiger oder fehlender Link: Nachricht zeigen, Spielfeld und Tastatur ausblenden.
   ========================================================================== */
if (today) {
    // Das leere Spielfeld aufbauen und die Startnachricht des Tages anzeigen
    initBoard();
    showMessage(today.start);

    // Texte des Bonus-Dialogs aus config.js einsetzen (in den Absatz, NICHT in den ganzen Dialog,
    // sonst würden die Buttons überschrieben)
    bonusText.textContent = BONUS.dialog;
    bonusButton1.textContent = BONUS.button1;
    bonusButton2.textContent = BONUS.button2;

    // Gespeicherten Spielstand wiederherstellen
    restoreState();

    /* Begrüßungs-Dialog öffnen, wenn der Tag in config.js ein "intro" hat (fehlt es, ist today.intro
       undefined und zählt als falsch) UND noch kein Versuch gemacht wurde. Muss NACH restoreState()
       stehen, weil savedGuesses erst dort aus dem Speicher geladen wird */
    if (today.intro && savedGuesses.length === 0) {
        introText.textContent = today.intro;
        introButton.textContent = INTRO_BUTTON;
        introDialog.showModal();
    }
} else {
    // Ungültiger Link: Nachricht anzeigen
    showMessage(INVALID_LINK_MESSAGE);
    // Klasse "invalid-link" an den <body> hängen, style.css blendet damit Spielfeld und Tastatur aus
    document.body.classList.add("invalid-link");
    // Eingaben sperren: Am Laptop könnte man sonst trotzdem tippen, und es gibt ja keine Kacheln
    isGameOver = true;
}
