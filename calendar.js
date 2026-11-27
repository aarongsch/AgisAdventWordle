/* ==========================================================================
   KALENDER-SEITE (calendar.html)
   Baut einen Adventskalender mit 24 Türen. Welche Türen offen sind, steht im
   gespeicherten Spielstand im Handy-Speicher (localStorage), den script.js
   beim Spielen anlegt. Beide Seiten liegen unter derselben Adresse und teilen
   sich daher diesen Speicher.
   - Gespielte Türen gehen beim Laden nacheinander auf und zeigen dahinter das
     Wort und die Anzahl der Versuche. Antippen führt zum Wordle des Tages.
   - Nicht gespielte Türen bleiben zu. Antippen lässt sie wackeln und zeigt
     eine Nachricht.
   - Texte und Reihenfolge der Türen stehen in config.js unter CALENDAR.
   ========================================================================== */

/* Funktion: Liest die gespeicherten Versuche eines Tages aus dem Handy-Speicher.
   Wie loadState() in script.js, aber für einen beliebigen Tag statt nur für den aktuellen.
   Gibt eine leere Liste zurück, wenn an dem Tag noch nichts gespielt wurde */
function loadGuesses(day) {
    try {
        // Speicherplatz des Tages lesen (gleicher Name wie STORAGE_KEY in script.js) und von Text zurück in ein Objekt umwandeln
        const state = JSON.parse(localStorage.getItem(`agis-wordle-day-${day}`));
        // Nur übernehmen, wenn der Stand zum aktuellen Wort passt (wurde das Wort in config.js geändert, gilt der Tag als ungespielt)
        if (state && state.word === DAYS[day].word && Array.isArray(state.guesses)) {
            return state.guesses;
        }
    } catch (e) {
        // Speicher nicht lesbar (z. B. privater Modus) oder kaputte Daten: Tag einfach als ungespielt behandeln
    }
    return []; // Nichts gespielt
}

/* Elemente aus calendar.html */
const calendar = document.getElementById("calendar");                 // Container für die 24 Türen
const messageContainer = document.getElementById("message-container"); // Popup oben (gleiches Aussehen wie im Spiel)

messageContainer.textContent = CALENDAR.start; // Begrüßung oben im Popup (Text aus config.js)

let openCount = 0; // Zählt die geöffneten Türen, damit sie nacheinander aufgehen (nicht alle gleichzeitig)

/* Für jeden Tag eine Tür bauen, in der Reihenfolge aus config.js (CALENDAR.order).
   for...of liefert die WERTE des Arrays (7, 15, 2, ...). for...in würde die Positionen liefern (0, 1, 2, ...) */
for (const day of CALENDAR.order) {
    // --- Daten dieses Tages ---
    const guesses = loadGuesses(day);                  // Bisherige Versuche (leer = nicht gespielt)
    const word = DAYS[day].word;                       // Lösungswort aus config.js
    const isPlayed = guesses.length > 0;               // Mindestens ein Versuch abgeschickt
    const isSolved = guesses.includes(word);           // Lösungswort ist unter den Versuchen = gelöst
    const isFailed = !isSolved && guesses.length >= 7; // Alle 7 Versuche (6 + Bonus) verbraucht, nicht gelöst = verloren

    // --- 1. Tür bauen. Ergebnis im HTML:
    //     <div class="door">
    //         <div class="door-inside">…</div>   (hinter der Tür: Wort + Versuche)
    //         <div class="door-front">12</div>   (vorne: die Nummer)
    //     </div>
    const door = document.createElement("div");
    door.classList.add("door");

    const inside = document.createElement("div");
    inside.classList.add("door-inside");

    const front = document.createElement("div");
    front.classList.add("door-front");
    front.textContent = day; // Nummer des Türchens

    // Reihenfolge wichtig: inside zuerst, front danach. Was später kommt, liegt obendrauf und verdeckt das Innere
    door.appendChild(inside);
    door.appendChild(front);

    calendar.appendChild(door); // Fertige Tür in den Kalender hängen. Erst jetzt wird sie sichtbar

    // --- 2. Text hinter der Tür. Nicht gespielte Türen bleiben innen leer,
    //        damit das Wort nicht einmal versteckt im HTML steht ---
    if (isSolved) {
        inside.textContent = `${word}\n${guesses.length} tries`; // \n = Zeilenumbruch (wirkt durch "white-space: pre-line" in style.css)
    } else if (isFailed) {
        inside.textContent = `${word}\n✗`;
    } else if (isPlayed) {
        inside.textContent = "…"; // Angefangen, aber noch nicht fertig: Wort nicht verraten
    }

    // --- 3. Gespielte Türen nacheinander öffnen: 1. Tür nach 300 ms, jede weitere 150 ms später.
    //        Die Klasse "open" dreht die Vorderseite per CSS weg (siehe ".door.open .door-front" in style.css) ---
    if (isPlayed) {
        setTimeout(() => door.classList.add("open"), 300 + openCount * 150);
        openCount++;
    }

    // --- 4. Antippen. Jede Tür "merkt" sich ihr eigenes day, isPlayed usw., weil der Listener
    //        innerhalb der Schleife erzeugt wird ---
    door.addEventListener("click", () => {
        if (isPlayed) {
            // Zum Wordle des Tages wechseln (wie ein Link). Der Zurück-Button führt wieder zum Kalender
            location.href = `index.html?t=${DAYS[day].code}`;
        } else {
            // Tür wackeln lassen (Animation "shake" aus style.css, wie shakeRow() in script.js).
            // Die Klasse wird nach der Animation wieder entfernt, damit die Tür beim nächsten Antippen erneut wackelt
            door.classList.add("shake");
            door.addEventListener("animationend", () => {
                door.classList.remove("shake");
            }, { once: true });
            // Hinweis im Popup oben (Text aus config.js)
            messageContainer.textContent = CALENDAR.closedMessage;
        }
    });
}
