// =========================================================
// script.js – spoločný skript pre všetky stránky
//  1) hamburger menu (všade)
//  2) priebeh semestra (iba schedule.html)
//  3) filter rozvrhu a aktuálna/najbližšia hodina (iba schedule.html)
// Každá časť si najprv overí, že potrebné prvky na stránke
// existujú, takže skript nespadne na stránkach bez nich.
// =========================================================

// Začiatok a koniec semestra. Pozor: mesiace v JS sú od 0,
// takže 8 = september a 11 = december.
const SEMESTER_START = new Date(2026, 8, 14);
const SEMESTER_END = new Date(2026, 11, 14);

// ---------- 1) Hamburger menu ----------

const menuButton = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    // Aktuálny stav čítame z aria-expanded (atribúty sú vždy reťazce).
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    // Prepnutie stavu pre čítačky obrazovky...
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    // ...zmena popisu tlačidla podľa toho, čo urobí ďalšie kliknutie...
    menuButton.setAttribute("aria-label", isOpen ? "Otvoriť menu" : "Zavrieť menu");
    // ...a vizuálne zobrazenie/skrytie menu (CSS trieda .is-open).
    navLinks.classList.toggle("is-open", !isOpen);
  });
}

// ---------- 2) Priebeh semestra ----------

const semesterProgress = document.getElementById("semesterProgress");
const semesterPercent = document.getElementById("semesterPercent");

if(semesterPercent && semesterProgress){
  const now = new Date();
  // Odčítanie dátumov dá rozdiel v milisekundách.
  const len = SEMESTER_END - SEMESTER_START;  // dĺžka semestra
  const passed = now - SEMESTER_START;         // koľko už uplynulo
  let percentage = (passed/len)*100;

  // Obmedzenie na rozsah 0–100 % (pred začiatkom a po konci semestra).
  if(percentage<0){
    percentage=0;
  }
  if(percentage>100){
    percentage=100;
  }

  percentage = Math.round(percentage);

  // Nastavenie prvku <progress> a textovej hodnoty vedľa neho.
  semesterProgress.value = percentage;
  semesterPercent.textContent = percentage+ " %";

}

// Prevod času vo formáte "HH:MM" na počet minút od polnoci
// (napr. "9:30" → 570), aby sa časy dali ľahko porovnávať.
function convertTime(time){
  const hourMinutes = time.split(":");
  const hour = parseInt(hourMinutes[0]);
  const minutes = parseInt(hourMinutes[1]);
  return hour*60 + minutes;
}

// ---------- 3) Rozvrh ----------

const filterButtons = document.querySelectorAll("[data-filter]"); // tlačidlá filtra
const lessonCells = document.querySelectorAll("[data-day]");      // bunky s hodinami
const filterEmpty = document.getElementById("filterEmpty");       // hláška „žiadne hodiny“
const currLesson = document.getElementById("currentLesson");      // text o aktuálnej hodine

if(filterButtons.length>0 && lessonCells.length>0 && filterEmpty && currLesson){

  // --- Filter podľa typu hodiny ---
  for(let i = 0; i < filterButtons.length;i++){
    const currButton = filterButtons[i];
    currButton.addEventListener("click",() => {
        let count = 0; // počet viditeľných hodín po filtrovaní
        // Hodnota z data-filter: "all", "lecture" alebo "exercise".
        const selectedFilter = currButton.dataset.filter;

        // Iba jedno tlačidlo je aktívne – ostatné „odtlačíme“.
        for(let j = 0; j < filterButtons.length;j++){
          filterButtons[j].setAttribute("aria-pressed","false");
        }
        currButton.setAttribute("aria-pressed","true");

        // Bunka je viditeľná, ak má triedu zvoleného filtra
        // alebo je zvolené „Všetko“. Ostatné dostanú .is-hidden.
        for(let k=0; k<lessonCells.length; k++){
          const cell = lessonCells[k];
          const isVisible = cell.classList.contains(selectedFilter) || selectedFilter === "all";
          cell.classList.toggle("is-hidden", !isVisible);
          if(isVisible){
            count++;
          }
        }

        // Ak filtru nezodpovedá žiadna hodina, zobrazí sa hláška.
        if(count>0){
          filterEmpty.hidden = true;
        }
        else{
          filterEmpty.hidden = false;
        }
    });
  }

  // --- Aktuálna / najbližšia hodina ---
  const MINUTES_IN_DAY = 1440; // 24 × 60
  // Názvy dní v tvare „v pondelok“, „v stredu“...; index zodpovedá
  // Date.getDay() (0 = nedeľa, 1 = pondelok, ...).
  const DAY_NAMES = ["nedeľu", "pondelok", "utorok", "stredu", "štvrtok", "piatok", "sobotu"];

  const now = new Date();
  const day = now.getDay();
  const timeMinutes = now.getMinutes();
  const timeHours = now.getHours();
  const time = timeHours * 60 + timeMinutes;     // minúty od polnoci
  const nowInWeek = day * MINUTES_IN_DAY + time; // minúty od začiatku týždňa (nedeľa 0:00)

  let currentFound = false;   // prebieha práve nejaká hodina?
  let smallestDiff = Infinity; // najmenší čas do začiatku hodiny (v minútach)
  let nextCell = null;         // najbližšia nasledujúca hodina

  for (let i = 0; i < lessonCells.length; i++) {
    const cell = lessonCells[i];
    // Údaje o hodine z data-* atribútov v HTML.
    const cellDay = parseInt(cell.dataset.day);
    const cellStart = convertTime(cell.dataset.start);
    const cellEnd = convertTime(cell.dataset.end);

    // Hodina prebieha, ak je dnes a aktuálny čas je medzi začiatkom a koncom.
    if (cellDay === day && time >= cellStart && time <= cellEnd) {
      cell.classList.add("is-current");
      currLesson.textContent = "Práve mám: " + cell.textContent;
      currentFound = true;
    }

    // Koľko minút zostáva do začiatku tejto hodiny v rámci týždňa.
    let diff = cellDay * MINUTES_IN_DAY + cellStart - nowInWeek;
    // Ak už tento týždeň začala, berieme jej termín budúci týždeň.
    if (diff < 0) {
      diff += 7 * MINUTES_IN_DAY;
    }

    // Hľadáme minimum = najbližšiu hodinu.
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nextCell = cell;
    }
  }

  // Ak práve nič neprebieha, vypíšeme najbližšiu hodinu.
  if (!currentFound) {
    const nextDay = parseInt(nextCell.dataset.day);
    let dayText = "v " + DAY_NAMES[nextDay];
    // Ak je to ešte dnes (a nie o týždeň), napíšeme „dnes“.
    if (nextDay === day && smallestDiff < MINUTES_IN_DAY) {
      dayText = "dnes";
    }

    currLesson.textContent = "Momentálne nemám výučbu. Najbližšie mám "
      + nextCell.textContent + " " + dayText + " o " + nextCell.dataset.start + ".";
  }
}
