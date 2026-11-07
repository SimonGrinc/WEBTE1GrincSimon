const lessons = document.querySelectorAll('.lesson');
const buttons = document.querySelectorAll('[data-filter]');
const statuss = document.querySelector('#filter-status');

function applyFilter(filter) {
  let count = 0;

  for (let i = 0; i < lessons.length; i++) {
    const cell = lessons[i];
    const isVisible = filter === "all" || cell.dataset.type === filter;
    cell.hidden = !isVisible;

    if (isVisible) {
      count++;
    }
  }

  statuss.textContent = "Zobrazené položky: " + count;

  for (let j = 0; j < buttons.length; j++) {
    const isActive = buttons[j].dataset.filter === filter;
    buttons[j].setAttribute("aria-pressed", String(isActive));
  }
}

for (let i = 0; i < buttons.length; i++) {
  const currButton = buttons[i];
  currButton.addEventListener("click", () => {
    applyFilter(currButton.dataset.filter);
  });
}

applyFilter("all");