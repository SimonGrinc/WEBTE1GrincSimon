const restaurants = [
  { id: 'druzba', name: 'Družba', days: [
    { day: 1, items: ['Rezeň'] }, { day: 2, items: ['Rizoto'] }] },
  { id: 'eatandmeet', name: 'Eat & Meet', days: [
    { day: 1, items: ['Cestoviny'] }, { day: 2, items: ['Šalát'] }] },
  { id: 'drag', name: 'DRAG', days: [
    { day: 1, items: ['Vývar'] }, { day: 2, items: ['Guláš'] }] }
];
const state = { day: 1, menus: new Map(), visible: new Set() };

const results = document.querySelector('#results');
const dayButtons = document.querySelectorAll('#days [data-day]');
const checkboxes = document.querySelectorAll('#filters input[type="checkbox"]');

function initializeState() {
  restaurants.forEach(restaurant => {
    state.menus.set(restaurant.id, restaurant);
    state.visible.add(restaurant.id);
  });
}

function render() {
  dayButtons.forEach(button => {
    const isActive = Number(button.dataset.day) === state.day;
    button.setAttribute('aria-pressed', String(isActive));
  });

  results.replaceChildren();//aby sa nepridavali dalsie ale len nove

  if (state.visible.size === 0) {
    results.textContent = 'Vyber aspoň jednu reštauráciu';
    return;
  }

  for (const [id, restaurant] of state.menus) {
    if (!state.visible.has(id)) {
      continue;
    }

    const article = document.createElement('article');

    const heading = document.createElement('h2');
    heading.textContent = restaurant.name;
    article.append(heading);

    const dayMenu = restaurant.days.find(d => d.day === state.day);

    if (!dayMenu || dayMenu.items.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Pre tento deň nie je menu.';
      article.append(empty);
    } else {
      const list = document.createElement('ul');
      dayMenu.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.append(li);
      });
      article.append(list);
    }

    results.append(article);
  }
}

dayButtons.forEach(button => {
  button.addEventListener('click', () => {
    state.day = Number(button.dataset.day);
    render();
  });
});

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      state.visible.add(checkbox.value);
    } else {
      state.visible.delete(checkbox.value);
    }
    render();
  });
});

initializeState();
render();