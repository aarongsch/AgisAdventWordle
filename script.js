// HIER DEINE WÖRTER EINTRAGEN (jeweils genau 5 Buchstaben, Großbuchstaben)
// Die Zahlen links entsprechen dem URL-Parameter (?day=1, ?day=3, etc.)
const WORDS_BY_DAY = {
    1: "HEART",
    3: "SNOWY",
    5: "ANGEL",
    8: "LIGHT",
    12: "SANTA",
    15: "MAGIC",
    20: "SWEET",
    24: "LOVED"
};

// URL-Parameter "?day=X" auslesen (Standard ist Tag 1, falls nichts angegeben)
const urlParams = new URLSearchParams(window.location.search);
const currentDay = parseInt(urlParams.get('day')) || 1;

// Zielwort festlegen (Fallback auf erstes Wort, falls Tag nicht in der Liste existiert)
const targetWord = WORDS_BY_DAY[currentDay] || Object.values(WORDS_BY_DAY)[0];

// Überschrift anpassen
document.getElementById('day-subtitle').textContent = `Adventskalender – Tag ${currentDay}`;

const ROWS = 6;
const COLS = 5;
let currentRow = 0;
let currentCol = 0;
let currentGuess = "";
let isGameOver = false;

const board = document.getElementById("board");
const messageContainer = document.getElementById("message-container");

// Spielfeld-Raster generieren
function initBoard() {
    for (let r = 0; r < ROWS; r++) {
        const row = document.createElement("div");
        row.classList.add("row");
        for (let c = 0; c < COLS; c++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.id = `tile-${r}-${c}`;
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

// Nachricht anzeigen
function showMessage(msg, persistent = false) {
    messageContainer.textContent = msg;
    messageContainer.classList.remove("hidden");
    if (!persistent) {
        setTimeout(() => {
            messageContainer.classList.add("hidden");
        }, 2000);
    }
}

// Buchstaben hinzufügen
function addLetter(letter) {
    if (isGameOver || currentCol >= COLS) return;
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = letter;
    currentGuess += letter;
    currentCol++;
}

// Buchstaben löschen
function deleteLetter() {
    if (isGameOver || currentCol <= 0) return;
    currentCol--;
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = "";
    currentGuess = currentGuess.slice(0, -1);
}

// Wort prüfen
function submitGuess() {
    if (isGameOver) return;
    if (currentGuess.length < COLS) {
        showMessage("Not enough letters!");
        return;
    }

    const targetArray = targetWord.split("");
    const guessArray = currentGuess.split("");
    const statuses = Array(COLS).fill("absent");

    // 1. Durchgang: Exakte Treffer (Grün) prüfen
    for (let i = 0; i < COLS; i++) {
        if (guessArray[i] === targetArray[i]) {
            statuses[i] = "correct";
            targetArray[i] = null; // Markieren, damit nicht doppelt gezählt wird
        }
    }

    // 2. Durchgang: Buchstabe an falscher Stelle (Rot) prüfen
    for (let i = 0; i < COLS; i++) {
        if (statuses[i] !== "correct" && targetArray.includes(guessArray[i])) {
            statuses[i] = "present";
            targetArray[targetArray.indexOf(guessArray[i])] = null;
        }
    }

    // Kacheln & Tastatur einfärben
    for (let i = 0; i < COLS; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.classList.add(statuses[i]);
        updateKeyboardColor(guessArray[i], statuses[i]);
    }

    // Sieg oder Niederlage prüfen
    if (currentGuess === targetWord) {
        showMessage("🎄 Amazing! You solved it! ❤️", true);
        isGameOver = true;
        return;
    }

    currentRow++;
    currentCol = 0;
    currentGuess = "";

    if (currentRow >= ROWS) {
        showMessage(`The word was: ${targetWord}`, true);
        isGameOver = true;
    }
}

// Tastatur-Tasten einfärben (Grün überschreibt Rot, Rot überschreibt Grau)
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

// Klicks auf Bildschirmtastatur verarbeiten
document.querySelectorAll("#keyboard button").forEach(button => {
    button.addEventListener("click", () => {
        const key = button.getAttribute("data-key");
        handleInput(key);
    });
});

// Physische Tastatureingaben verarbeiten
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

function handleInput(key) {
    if (key === "ENTER") {
        submitGuess();
    } else if (key === "BACKSPACE") {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

// Spiel starten
initBoard();