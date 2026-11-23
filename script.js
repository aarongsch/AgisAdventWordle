/* URL-Parameter auslesen (z. B. "?day=3"), um das richtige Wort für den jeweiligen Tag zu laden */
const urlParams = new URLSearchParams(window.location.search);
const currentDay = parseInt(urlParams.get('day')) || 1;

/* Daten des aktuellen Tages (Wort und Startnachricht) aus DAYS in config.js holen.
   Gibt es den Tag dort nicht, wird der erste Tag der Liste genommen */
const today = DAYS[currentDay] || Object.values(DAYS)[0];
const targetWord = today.word;

/* Spielregeln-Konstanten: 6 Versuche (Zeilen) und 5 Buchstaben pro Wort (Spalten) */
const ROWS = 6;
const COLS = 5;
let currentRow = 0;        // Zeigt an, in welcher Zeile gerade getippt wird
let currentCol = 0;        // Zeigt an, in welcher Spalte der nächste Buchstabe landet
let currentGuess = "";     // Speichert das aktuell eingegebene Wort als Textstring
let isGameOver = false;    // Statusvariable: True, wenn das Spiel gewonnen oder verloren ist
let savedGuesses = [];     // Alle bereits abgeschickten Versuche (werden im Handy-Speicher gesichert)

/* ==========================================================================
   SPIELSTAND SPEICHERN
   Jeder abgeschickte Versuch wird im Speicher des Browsers auf dem Handy
   abgelegt ("localStorage"), getrennt für jeden Tag. Beim Neuladen der Seite
   werden die Versuche wiederhergestellt, inklusive Farben und Tastatur.
   - Wird das Wort eines Tages im Code geändert, startet dieser Tag neu.
   - Zum Testen: "&reset" an den Link hängen (z. B. "?day=3&reset"), dann
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

/* Funktion: Spielt alle gespeicherten Versuche noch einmal ab (ohne sie erneut zu speichern) */
function restoreState() {
    savedGuesses = loadState();
    for (const guess of savedGuesses) {
        if (isGameOver) break;
        applyGuess(guess);
    }
}

/* HTML-Elemente für das Spielfeld und die Nachrichtenbox im Code verfügbar machen */
const board = document.getElementById("board");
const messageContainer = document.getElementById("message-container");

/* Funktion: Erstellt das 6x5-Raster beim Laden der Seite dynamisch im HTML */
function initBoard() {
    for (let r = 0; r < ROWS; r++) {
        const row = document.createElement("div");
        row.classList.add("row");
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
    if (isGameOver || currentCol >= COLS) return; // Nichts tun, wenn Spiel vorbei oder Zeile voll
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = letter;
    currentGuess += letter;
    currentCol++;
}

/* Funktion: Löscht den letzten Buchstaben (Backspace / ⌫) */
function deleteLetter() {
    if (isGameOver || currentCol <= 0) return; // Nichts tun, wenn Spiel vorbei oder Zeile leer
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

/* Funktion: Überprüft das eingegebene Wort nach dem Drücken von ENTER */
function submitGuess() {
    if (isGameOver) return;
    
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

/* Funktion: Wertet einen Versuch aus, färbt die Zeile und prüft auf Sieg oder Niederlage.
   Wird beim normalen Spielen UND beim Wiederherstellen des Spielstands benutzt. */
function applyGuess(guess) {
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

    /* Prüfen, ob das Spiel gewonnen wurde (Wort erraten) */
    if (guess === targetWord) {
        showMessage("🎄 Amazing! You solved it! ❤️");
        isGameOver = true;
        return;
    }

    /* In die nächste Zeile springen */
    currentRow++;
    currentCol = 0;
    currentGuess = "";

    /* Prüfen, ob alle 6 Versuche aufgebraucht sind (Spiel verloren) */
    if (currentRow >= ROWS) {
        showMessage(`The word was: ${targetWord}`);
        isGameOver = true;
    }
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

/* Spiel initialisieren: Das leere Spielfeld aufbauen und gespeicherten Spielstand wiederherstellen */
initBoard();
restoreState();