const SEMESTER_START = new Date(2026, 8, 14);
const SEMESTER_END = new Date(2026, 11, 14);


const menuButton = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Otvoriť menu" : "Zavrieť menu");
    navLinks.classList.toggle("is-open", !isOpen);
  });
}

const semesterProgress = document.getElementById("semesterProgress");
const semesterPercent = document.getElementById("semesterPercent");

if(semesterPercent && semesterProgress){
  const now = new Date();
  const len = SEMESTER_END - SEMESTER_START;
  const passed = now - SEMESTER_START;
  let percentage = (passed/len)*100;

  if(percentage<0){
    percentage=0;
  }
  if(percentage>100){
    percentage=100;
  }

  percentage = Math.round(percentage);

  semesterProgress.value = percentage;
  semesterPercent.textContent = percentage+ " %";

}

function convertTime(time){
  const hourMinutes = time.split(":");
  const hour = parseInt(hourMinutes[0]);
  const minutes = parseInt(hourMinutes[1]);
  return hour*60 + minutes;
}

const filterButtons = document.querySelectorAll("[data-filter]");
const lessonCells = document.querySelectorAll("[data-day]");
const filterEmpty = document.getElementById("filterEmpty");
const currLesson = document.getElementById("currentLesson");

if(filterButtons.length>0 && lessonCells.length>0 && filterEmpty && currLesson){
  for(let i = 0; i < filterButtons.length;i++){
    const currButton = filterButtons[i];
    currButton.addEventListener("click",() => {
        let count = 0;
        const selectedFilter = currButton.dataset.filter;
        for(let j = 0; j < filterButtons.length;j++){
          filterButtons[j].setAttribute("aria-pressed","false");
        }
        currButton.setAttribute("aria-pressed","true");
        for(let k=0; k<lessonCells.length; k++){
          const cell = lessonCells[k];
          const isVisible = cell.classList.contains(selectedFilter) || selectedFilter === "all";
          cell.classList.toggle("is-hidden", !isVisible);
          if(isVisible){
            count++;
          }
        }
        if(count>0){
          filterEmpty.hidden = true;
        }
        else{
          filterEmpty.hidden = false;
        }
    });
  }
  const MINUTES_IN_DAY = 1440;
  const DAY_NAMES = ["nedeľu", "pondelok", "utorok", "stredu", "štvrtok", "piatok", "sobotu"];

  const now = new Date();
  const day = now.getDay();
  const timeMinutes = now.getMinutes();
  const timeHours = now.getHours();
  const time = timeHours * 60 + timeMinutes;
  const nowInWeek = day * MINUTES_IN_DAY + time;

  let currentFound = false;
  let smallestDiff = Infinity;
  let nextCell = null;

  for (let i = 0; i < lessonCells.length; i++) {
    const cell = lessonCells[i];
    const cellDay = parseInt(cell.dataset.day);
    const cellStart = convertTime(cell.dataset.start);
    const cellEnd = convertTime(cell.dataset.end);

    if (cellDay === day && time >= cellStart && time <= cellEnd) {
      cell.classList.add("is-current");
      currLesson.textContent = "Práve mám: " + cell.textContent;
      currentFound = true;
    }

    let diff = cellDay * MINUTES_IN_DAY + cellStart - nowInWeek;
    if (diff < 0) {
      diff += 7 * MINUTES_IN_DAY;
    }

    if (diff < smallestDiff) {
      smallestDiff = diff;
      nextCell = cell;
    }
  }

  if (!currentFound) {
    const nextDay = parseInt(nextCell.dataset.day);
    let dayText = "v " + DAY_NAMES[nextDay];
    if (nextDay === day && smallestDiff < MINUTES_IN_DAY) {
      dayText = "dnes";
    }

    currLesson.textContent = "Momentálne nemám výučbu. Najbližšie mám "
      + nextCell.textContent + " " + dayText + " o " + nextCell.dataset.start + ".";
  }
}