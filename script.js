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

/* Alle Lösungswörter aus DAYS zusätzlich als gültige Wörter zulassen.
   Nötig, weil manche nicht in der Wortliste (words.js) stehen, z. B. SANTA (Eigenname).
   Ohne das könnte sie ihr eigenes Lösungswort nicht eingeben.
   Steht ein Wort schon im Set, passiert bei .add() nichts (ein Set enthält jedes Wort nur einmal) */
for (const day in DAYS) {
    VALID_WORDS.add(DAYS[day].word); // Wort des Tages, den die Schleife gerade durchläuft (nicht nur das von heute)
}

/* Spielregeln-Konstanten: 6 normale Versuche + 1 versteckter Bonusversuch (Zeilen) und 5 Buchstaben pro Wort (Spalten) */
const ROWS = 6;             // Anzahl der normalen Versuche (darauf bauen "Last try" und die Siegesnachrichten auf)
const TOTAL_ROWS = ROWS + 1; // Anzahl aller Zeilen im Raster: normale Versuche + 1 Bonuszeile
const COLS = 5;

/* Aufdeck-Animation: Kacheln drehen sich nacheinander um und zeigen dabei ihre Farbe */
const FLIP_DURATION = 500;  // Dauer einer Kachel-Drehung in ms (muss zu ".tile.flip" in style.css passen)
const FLIP_DELAY = 300;     // Abstand zwischen dem Start zweier Kacheln in ms
/* Sieges-Animation: Kacheln der Gewinnzeile hüpfen nacheinander (siehe celebrate()) */
const BOUNCE_DURATION = 400; // Dauer eines Hüpfers in ms (muss zu ".tile.bounce" in style.css passen, dient als Hinweis)
const BOUNCE_DELAY = 100;    // Abstand zwischen dem Start zweier hüpfender Kacheln in ms
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
const introImage = document.getElementById("intro-image");       // Begrüßungs-Dialog: Bild/Sticker

const bonusDialog = document.getElementById("bonus-dialog");     // Bonus-Dialog: das ganze Fenster (zum Öffnen/Schließen)
const bonusText = document.getElementById("bonus-text");         // Bonus-Dialog: nur der Textabsatz
const bonusButton1 = document.getElementById("bonus-button-1");  // Bonus-Dialog: linker Button
const bonusButton2 = document.getElementById("bonus-button-2");  // Bonus-Dialog: rechter Button
const bonusImage = document.getElementById("bonus-image");       // Bonus-Dialog: Bild/Sticker

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

/* Funktion: Sieges-Animation. Lässt die Kacheln der Gewinnzeile nacheinander hüpfen und Konfetti fliegen.
   Wird von applyGuess aufgerufen, wenn das Wort erraten wurde, und zwar erst nach dem Aufdecken
   und nur beim echten Spielen (nicht beim Wiederherstellen nach dem Neuladen) */
function celebrate() {
    // 1. Kacheln der Gewinnzeile nacheinander hüpfen lassen (von links nach rechts, wie beim Aufdecken).
    //    currentRow zeigt nach einem Sieg noch auf die Gewinnzeile, da es dann nicht erhöht wird
    for (let i = 0; i < COLS; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        setTimeout(() => {
            tile.classList.add("bounce"); // Hüpfen starten (Animation "bounce" in style.css)
        }, i * BOUNCE_DELAY);             // Kachel i startet nach i * BOUNCE_DELAY
    }

    // 2. Konfetti mit der Bibliothek aus index.html (canvas-confetti).
    //    Sicherheitsprüfung: Konnte die Bibliothek nicht geladen werden (z. B. schlechtes Netz),
    //    gibt es die Funktion confetti nicht. Dann einfach ohne Konfetti weiter, statt mit Fehler abzubrechen
    if (typeof confetti === "function") {
        confetti({
            particleCount: CONFETTI.amount, // Anzahl der Stücke (aus config.js)
            colors:        CONFETTI.colors, // Farben (aus config.js)
            spread: 50,                     // Wie weit es sich auffächert, in Grad. Einstellbar: z.B. 180 = breiter
            origin: { y: 0.85 },            // Startpunkt: 0 = oberer Rand, 1 = unterer Rand (0.85 = etwa auf Höhe der Tastatur)
        });
    }
}

/* Funktion: Schickt eine Push-Benachrichtigung über ntfy.sh an mein Handy (App "ntfy", Topic aus config.js).
   Wird nur aus submitGuess aufgerufen, also nur beim echten Spielen, nie beim Wiederherstellen nach dem Neuladen.
   Das Spiel wartet nicht auf die Antwort: fetch läuft im Hintergrund, nichts ruckelt */
function notify(text) {
    // Benachrichtigungen in config.js ausgeschaltet (z. B. beim eigenen Testen): nichts tun
    if (!NOTIFY.enabled) return;

    // Nachricht an ntfy.sh schicken. Jeder, der an diese Adresse schreibt, löst eine Push-Nachricht
    // bei allen aus, die das Topic in der ntfy-App abonniert haben
    fetch(`https://ntfy.sh/${NOTIFY.topic}`, {
        method: "POST",   // POST = Daten an den Server schicken (statt etwas abzurufen)
        body: text,       // Der Text der Benachrichtigung
    }).catch(() => {});   // Fehler (z. B. kein Netz) still ignorieren, eine verpasste Benachrichtigung ist nicht schlimm
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

    /* Prüfen, ob das Wort in der Wortliste steht (words.js + Lösungswörter, siehe oben).
       Muss NACH der Längenprüfung kommen (sonst käme bei zu kurzen Wörtern diese Meldung statt nur Wackeln)
       und VOR dem Speichern (damit ein ungültiges Wort nicht als Versuch zählt) */
    if (!VALID_WORDS.has(currentGuess)) {
        // "!" dreht die Bedingung um: Wort ist NICHT in der Liste → Zeile wackeln lassen und Nachricht zeigen
        shakeRow();
        showMessage(NOT_IN_LIST_MESSAGE);
        return; // Abbrechen: Versuch wird nicht gespeichert, Buchstaben bleiben zum Korrigieren stehen
    }

    /* Versuch merken und sofort im Handy-Speicher sichern, dann auswerten */
    savedGuesses.push(currentGuess);
    saveState();
    applyGuess(currentGuess);

    /* Push-Benachrichtigungen an mich (siehe notify). Hier in submitGuess, weil diese Funktion nur läuft,
       wenn sie selbst ENTER drückt, nie beim Wiederherstellen. Steht NACH applyGuess, weil applyGuess
       isGameOver sofort setzt (nicht erst im Timer), so ist hier schon bekannt, ob das Spiel vorbei ist */

    // Das zuletzt eingegebene Wort. NICHT currentGuess nehmen: applyGuess leert es bei einem Fehlversuch schon
    const lastGuess = savedGuesses[savedGuesses.length - 1];

    // Erster Versuch des Tages: Sie hat mit dem Wordle angefangen
    if (savedGuesses.length === 1) {
        notify(`Wordle of day ${currentDay} started.`);
    }

    // Spiel vorbei: gewonnen oder verloren (mit Anzahl der Versuche bzw. dem Lösungswort).
    // Bewusst ein eigenes if und kein "else if": Gewinnt sie im 1. Versuch, kommen beide Nachrichten
    if (isGameOver) {
        if (lastGuess === targetWord) {
            notify(`Wordle of day ${currentDay} solved in ${savedGuesses.length} tries!`);
        } else {
            notify(`Wordle of day ${currentDay} failed. The word was ${targetWord}.`);
        }
    }
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
    // Zeit, bis die letzte Kachel fertig aufgedeckt ist: Die letzte Kachel startet nach (COLS - 1) * FLIP_DELAY
    // und braucht dann noch FLIP_DURATION. Beim Wiederherstellen gibt es keine Animation, also 0
    const revealTime = isRestoring ? 0 : (COLS - 1) * FLIP_DELAY + FLIP_DURATION;

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

    /* Kacheln im Spielfeld beschriften und färben (die Tastatur wird erst nach dem Aufdecken gefärbt, siehe unten) */
    for (let i = 0; i < COLS; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.textContent = guessArray[i]; // nötig beim Wiederherstellen, da die Kachel dann noch leer ist

        if (isRestoring) {
            // Beim Neuladen: sofort färben, ohne Animation
            tile.classList.add(statuses[i]);
        } else {
            // Beim Spielen: Kachel i startet nach i * FLIP_DELAY (also von links nach rechts nacheinander)
            setTimeout(() => {
                tile.classList.add("flip"); // Drehung starten (Animation "flip" in style.css)
                // Nach der halben Drehung steht die Kachel hochkant (unsichtbar): genau dann die Farbe setzen.
                // Die Klasse "flip" bleibt dran, sonst würde die Drehung mittendrin abbrechen
                setTimeout(() => {
                    tile.classList.add(statuses[i]);
                }, FLIP_DURATION / 2);
            }, i * FLIP_DELAY);
        }
    }

    /* Spielzustand aktualisieren */
    if (guess === targetWord) {
        // Gewonnen: Spiel beenden (currentRow bleibt auf der Gewinnzeile stehen)
        isGameOver = true;
        // Sieges-Animation nur beim echten Spielen, sonst käme bei jedem Neuladen eines gelösten Tages Konfetti.
        // Erst nach revealTime, also wenn die letzte Kachel fertig aufgedeckt ist
        if (!isRestoring) {
            setTimeout(celebrate, revealTime); // Funktion direkt übergeben (ohne Klammern), wie bei finishReveal
        }
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
                }, revealTime + BONUS.delay); // erst Aufdeck-Animation, dann Wartezeit aus config.js, dann Dialog
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

    /* Passende Nachricht zum NEUEN Spielzustand bestimmen. Muss hier stehen (nach dem Aktualisieren von
       currentRow), aber schon JETZT berechnet werden und nicht erst im Timer: Tippt sie während der
       Animation schon das nächste Wort, hätte sich currentRow bis dahin wieder geändert */
    const message = messageAfterGuess(guess);

    /* Hilfsfunktion: Alles, was erst NACH dem Aufdecken passieren soll (Tastatur färben, Nachricht zeigen) */
    const finishReveal = () => {
        for (let i = 0; i < COLS; i++) {
            updateKeyboardColor(guessArray[i], statuses[i]);
        }
        showMessage(message);
    };

    if (isRestoring) {
        finishReveal();                         // Beim Neuladen: sofort, ohne auf eine Animation zu warten
    } else {
        setTimeout(finishReveal, revealTime);   // Beim Spielen: erst wenn die letzte Kachel fertig ist
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
    // Bild des Bonus-Dialogs nur setzen, wenn eins angegeben ist (fehlt es oder ist es "", zählt das als falsch).
    // Ohne das if stünde in src "undefined", dann greift ":not([src])" in style.css nicht und man sähe ein kaputtes Bild.
    // Schon jetzt beim Start setzen: Der Browser lädt das Bild sofort, so ist es da, wenn der Dialog später aufgeht
    if (BONUS.image) {
        bonusImage.src = BONUS.image;
    }

    // Gespeicherten Spielstand wiederherstellen
    restoreState();

    /* Begrüßungs-Dialog öffnen, wenn der Tag in config.js ein "intro" ODER ein "introImage" hat (fehlt ein
       Feld, ist es undefined und zählt als falsch) UND noch kein Versuch gemacht wurde.
       Die Klammern um das ODER (||) sind nötig: && bindet stärker als ||. Ohne Klammern ginge der Dialog
       bei einem intro-Text bei JEDEM Neuladen auf, auch mitten im Spiel.
       Muss NACH restoreState() stehen, weil savedGuesses erst dort aus dem Speicher geladen wird */
    if ((today.intro || today.introImage) && savedGuesses.length === 0) {
        introText.textContent = today.intro; // Ohne intro-Text undefined: textContent bleibt dann einfach leer
        introButton.textContent = INTRO_BUTTON;
        // Nur an Tagen mit Bild: Button sperren, bis das Bild geladen ist (damit sie den Dialog nicht
        // wegtippt, bevor das GIF erscheint). Ohne Bild bleibt der Button sofort klickbar
        if (today.introImage) {
            // 1. Button sperren (style.css zeigt ihn dann halb durchsichtig, siehe ":disabled")
            introButton.disabled = true;

            // 2. Hilfsfunktion zum Entsperren. Wird bis zu zweimal aufgerufen (Bild geladen + Timer),
            //    das ist harmlos: disabled ein zweites Mal auf false zu setzen ändert nichts
            const unlockIntroButton = () => {
                introButton.disabled = false;
            };

            // 3. Entsperren, sobald das Bild fertig geladen ist ("load" löst der Browser automatisch aus)
            introImage.addEventListener("load", unlockIntroButton, { once: true });

            // 4. Auch entsperren, wenn das Bild NICHT geladen werden kann (z. B. Tippfehler im Dateinamen),
            //    sonst müsste sie ohne Grund die volle Wartezeit warten
            introImage.addEventListener("error", unlockIntroButton, { once: true });

            // 5. Spätestens nach INTRO_BUTTON_MAX_WAIT (config.js) entsperren, falls das Laden sehr lange dauert
            setTimeout(unlockIntroButton, INTRO_BUTTON_MAX_WAIT);

            // 6. Erst JETZT das Bild setzen: Damit startet der Download. Die Listener oben sind dann schon bereit,
            //    so wird "load" sicher nicht verpasst. Ohne Bild bleibt es per CSS ausgeblendet (":not([src])")
            introImage.src = today.introImage;
        }
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
