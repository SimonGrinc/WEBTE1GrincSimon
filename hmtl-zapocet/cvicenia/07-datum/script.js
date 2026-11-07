const lessons = [
  { name: 'Matematika', day: 1, start: 8, end: 10 },
  { name: 'Programovanie', day: 1, start: 10, end: 12 },
  { name: 'Webové technológie', day: 3, start: 8, end: 10 }
];

const statuss = document.querySelector("#lesson-status");

function getCurrentLesson(lessons, now) {
  // TODO: Vráť hodinu alebo null. Koniec hodiny je už mimo intervalu.
  const day = now.getDay();
  const time = now.getHours() + now.getMinutes() / 60;

  for(let i = 0; i < lessons.length; i++){
    const currLesson = lessons[i];
    const start = currLesson.start;
    const end = currLesson.end;

    if(currLesson.day === day && start <= time && end > time ){
      return currLesson;
    } 
  }
  return null;
}

function updateStatus(now = new Date()) {
  const lesson = getCurrentLesson(lessons, now);

  if (lesson === null) {
    statuss.textContent = 'Práve neprebieha žiadna hodina.';
  } else {
    statuss.textContent = `Teraz prebieha: ${lesson.name}`;
  }
}

const sampleNow = new Date(2026, 10, 9, 9, 30);
// TODO: Over sampleNow, hranice hodín a nedeľu.
// TODO: Pripoj tlačidlo, prvé vykreslenie a interval 30 sekúnd.
document.querySelector("#check").addEventListener("click",() => updateStatus());
updateStatus();
setInterval(updateStatus, 30000);