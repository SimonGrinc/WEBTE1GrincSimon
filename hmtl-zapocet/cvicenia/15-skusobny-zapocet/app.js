// =====================================================================
// Skúšobný zápočet – obedové menu
// =====================================================================
// Celá aplikácia funguje podľa jedného vzoru:
//
//     udalosť  →  zmena dát (state)  →  uloženie (localStorage)  →  render()
//
// Stránku NIKDY neupravujeme priamo z udalostí. Udalosti iba menia
// `state` a potom zavolajú render(), ktorý nakreslí všetko nanovo
// podľa stavu. Jediný zdroj pravdy je `state`.
// =====================================================================

const MENU_URL = './menu.json';
const STORAGE_KEY = 'practice-exam-menu-v1';

const state = {
  meals: [],        // všetky jedlá (pole objektov)
  day: 1,           // vybraný deň vo filtri (1 = pondelok, 2 = utorok)
  onlySoups: false, // checkbox „Len polievky“
  hasData: false    // či už vôbec nejaké dáta máme (z JSON alebo z cache).
                    // Rozlišuje „ešte nič nenačítané“ od „načítané, ale prázdne“.
};

const DAY_NAMES = { 1: 'Pondelok', 2: 'Utorok' };
const TYPE_NAMES = { soup: 'Polievka', main: 'Hlavné jedlo' };

// Formát ceny po slovensky na 2 desatinné miesta: 2.5 → "2,50 €"
const priceFormat = new Intl.NumberFormat('sk-SK', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// ---------------------------------------------------------------------
// Prvky stránky – nájdeme ich raz a uložíme si ich
// ---------------------------------------------------------------------
const loadButton = document.querySelector('#load-button');
const dayFilter = document.querySelector('#day-filter');
const soupFilter = document.querySelector('#soup-filter');
const statusEl = document.querySelector('#status');
const countEl = document.querySelector('#count');
const results = document.querySelector('#results');
const form = document.querySelector('#meal-form');
const nameInput = document.querySelector('#meal-name');
const mealDayInput = document.querySelector('#meal-day');
const mealTypeInput = document.querySelector('#meal-type');
const priceInput = document.querySelector('#meal-price');

// Pomocná funkcia na správy pre používateľa (chyby aj úspech).
function showStatus(message) {
  statusEl.textContent = message;
}

// =====================================================================
// VALIDÁCIA
// =====================================================================

// Je jedno jedlo platné? Kontroluje všetko, čo zadanie vymenúva.
function isValidMeal(meal) {
  return (
    meal !== null &&
    typeof meal === 'object' &&                        // je to objekt (nie null, text, číslo…)
    Number.isInteger(meal.id) &&                       // celé číslo
    typeof meal.name === 'string' &&
    meal.name.trim() !== '' &&                         // neprázdny názov (ani iba medzery)
    (meal.day === 1 || meal.day === 2) &&              // deň 1 alebo 2
    (meal.type === 'soup' || meal.type === 'main') &&  // povolený typ
    Number.isFinite(meal.price) &&                     // skutočné konečné číslo (nie NaN, nie "teplo")
    meal.price > 0                                     // kladná cena
  );
}

// Je celé menu platné? Pole + každé jedlo platné + jedinečné ID.
function isValidMenu(value) {
  if (!Array.isArray(value)) {
    return false;
  }
  // every: true iba ak podmienka platí pre VŠETKY prvky.
  // Pozor: pri prázdnom poli vráti true – a to chceme, prázdne menu je platné.
  if (!value.every(isValidMeal)) {
    return false;
  }
  // Jedinečnosť ID: Set nedovolí duplicity. Ak má menej prvkov ako pole,
  // niektoré ID sa opakovalo.
  const ids = new Set(value.map(meal => meal.id));
  return ids.size === value.length;
}

// =====================================================================
// UKLADANIE
// =====================================================================

// Uloží CELÉ pole do localStorage. localStorage vie iba text → JSON.stringify.
function saveMenu() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.meals));
  } catch (error) {
    // Zápis môže zlyhať (plné úložisko, súkromný režim). Aplikácia ide ďalej.
    console.error('Uloženie zlyhalo:', error);
    showStatus('Zmeny sa nepodarilo uložiť do prehliadača.');
  }
}

// Načíta uložené dáta. Vracia:
//   null  → cache chýba alebo je poškodená (nemáme čo obnoviť),
//   pole  → platné uložené dáta (môže byť aj PRÁZDNE pole!).
// Práve rozlíšenie null vs. [] zabezpečí, že po vymazaní všetkých jedál
// a obnovení stránky ostane menu prázdne a nevráti sa „Načítaj menu“.
function restoreMenu() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return null;                       // nikdy nič uložené
    }

    const data = JSON.parse(raw);        // pri poškodenom texte hodí chybu → catch

    if (!isValidMenu(data)) {
      showStatus('Uložené dáta sú neplatné. Načítaj menu znova.');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Obnovenie zlyhalo:', error);
    showStatus('Uložené dáta sú poškodené. Načítaj menu znova.');
    return null;
  }
}

// =====================================================================
// NAČÍTANIE CEZ FETCH
// =====================================================================
async function loadMenu() {
  loadButton.disabled = true;            // zablokuj počas načítania
  showStatus('Načítavam…');

  try {
    const response = await fetch(MENU_URL);

    // fetch hodí chybu IBA keď sa nedá spojiť. Pri 404 „uspeje“,
    // preto stav kontrolujeme sami a chybu vyhodíme ručne.
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();  // chybný JSON tu hodí chybu sám

    if (!isValidMenu(data)) {
      throw new Error('Dáta nemajú očakávaný tvar.');
    }

    // Až keď je všetko v poriadku, NAHRADÍME dáta. Pri akejkoľvek chybe
    // vyššie sa sem nedostaneme, takže doterajšie údaje ostanú.
    state.meals = data;
    state.hasData = true;
    saveMenu();
    render();
    showStatus('Menu bolo načítané.');
  } catch (error) {
    console.error('Načítanie zlyhalo:', error);
    showStatus(`Menu sa nepodarilo načítať (${error.message}). Doterajšie údaje ostali.`);
  } finally {
    loadButton.disabled = false;         // finally beží VŽDY – pri úspechu aj chybe
  }
}

// =====================================================================
// VYKRESLENIE
// =====================================================================

// Ktoré jedlá prejdú aktuálnymi filtrami? Oba filtre platia naraz.
function getVisibleMeals() {
  return state.meals.filter(meal =>
    meal.day === state.day &&
    (!state.onlySoups || meal.type === 'soup')
    // ↑ ak checkbox NIE JE zaškrtnutý, prejde každý typ;
    //   ak je, prejdú iba polievky
  );
}

// Vytvorí kartu jedného jedla. Iba DOM metódy a textContent –
// názov '<b>Test</b>' sa preto zobrazí doslova, nie ako tučné písmo.
function createMealCard(meal) {
  const article = document.createElement('article');
  article.className = meal.type === 'soup' ? 'card card--soup' : 'card';

  const title = document.createElement('h3');
  title.textContent = meal.name;

  const type = document.createElement('p');
  type.textContent = TYPE_NAMES[meal.type];

  const price = document.createElement('p');
  price.textContent = `${priceFormat.format(meal.price)} €`;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Odstrániť';
  // aria-label: čítačka povie „Odstrániť Kurací rezeň“, nie iba „Odstrániť“
  deleteButton.setAttribute('aria-label', `Odstrániť ${meal.name}`);
  // Šípková funkcia, lebo potrebujeme odovzdať ID práve tohto jedla.
  deleteButton.addEventListener('click', () => deleteMeal(meal.id));

  article.append(title, type, price, deleteButton);
  return article;
}

function render() {
  // Najprv vyčistiť – opakované vykreslenie tak nikdy nezdvojí obsah.
  results.replaceChildren();

  // Ešte nikdy nič nenačítané (a ani v cache nič nebolo).
  if (!state.hasData) {
    countEl.textContent = '';
    const hint = document.createElement('p');
    hint.textContent = 'Načítaj menu';
    results.append(hint);
    return;
  }

  const visible = getVisibleMeals();
  countEl.textContent = `Počet výsledkov: ${visible.length}`;

  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Pre tento výber nie sú žiadne jedlá.';
    results.append(empty);
    return;
  }

  visible.forEach(meal => results.append(createMealCard(meal)));
}

// =====================================================================
// FORMULÁR – PRIDANIE JEDLA
// =====================================================================

// Nové jedinečné celočíselné ID = najväčšie existujúce + 1.
// (crypto.randomUUID by bol text, a validácia chce celé číslo.)
function getNextId() {
  return state.meals.reduce((max, meal) => Math.max(max, meal.id), 0) + 1;
}

function handleSubmit(event) {
  event.preventDefault();                // formulár neobnoví stránku

  const name = nameInput.value.trim();
  const priceText = priceInput.value.trim();
  const day = Number(mealDayInput.value);
  const type = mealTypeInput.value;

  // Prázdne vstupy odmietneme PRED prevodom na číslo,
  // lebo Number('') je 0 a to by sa tvárilo ako zadaná hodnota.
  if (name === '') {
    showStatus('Zadaj názov jedla (nie iba medzery).');
    nameInput.focus();
    return;
  }
  if (priceText === '') {
    // Pri type="number" je value prázdne aj vtedy, keď prehliadač text
    // nevie prečítať ako číslo – aj to sa sem dostane.
    showStatus('Zadaj cenu.');
    priceInput.focus();
    return;
  }

  const price = Number(priceText);       // "4.5" → 4.5 (value má vždy bodku)

  if (!Number.isFinite(price) || price <= 0) {
    showStatus('Cena musí byť číslo väčšie ako 0.');
    priceInput.focus();
    return;
  }

  const meal = { id: getNextId(), name, day, type, price };

  // Posledná poistka – rovnaké pravidlá ako pri načítaní.
  if (!isValidMeal(meal)) {
    showStatus('Jedlo má neplatné údaje.');
    return;
  }

  // udalosť → zmena dát → uloženie → vykreslenie
  state.meals.push(meal);
  state.hasData = true;
  saveMenu();
  render();

  // Ak jedlo aktuálny filter nezobrazuje, používateľ by nevidel, že sa niečo stalo.
  const isVisible = getVisibleMeals().some(m => m.id === meal.id);
  if (isVisible) {
    showStatus(`Jedlo „${meal.name}“ bolo pridané.`);
  } else {
    showStatus(`Jedlo „${meal.name}“ bolo pridané (${DAY_NAMES[day]}), aktuálny filter ho nezobrazuje.`);
  }

  form.reset();
}

// =====================================================================
// MAZANIE
// =====================================================================
function deleteMeal(id) {
  const meal = state.meals.find(m => m.id === id);

  // Ponechaj všetky jedlá okrem mazaného – podľa ID, nie podľa názvu.
  state.meals = state.meals.filter(m => m.id !== id);
  saveMenu();
  render();   // state.day a state.onlySoups sa nemenili → filter ostáva

  if (meal) {
    showStatus(`Jedlo „${meal.name}“ bolo odstránené.`);
  }
}

// =====================================================================
// UDALOSTI A ŠTART
// =====================================================================
loadButton.addEventListener('click', loadMenu);

dayFilter.addEventListener('change', () => {
  state.day = Number(dayFilter.value);   // value je text "1"/"2" → číslo
  render();
});

soupFilter.addEventListener('change', () => {
  state.onlySoups = soupFilter.checked;  // true / false
  render();
});

form.addEventListener('submit', handleSubmit);

function init() {
  // Počiatočné filtre: pondelok, checkbox nezaškrtnutý.
  // Nastavíme ich aj na stránke, aby ovládanie zodpovedalo stavu.
  dayFilter.value = String(state.day);
  soupFilter.checked = state.onlySoups;

  const saved = restoreMenu();
  if (saved !== null) {
    state.meals = saved;                 // môže byť aj [] – vtedy ostane prázdne
    state.hasData = true;
  }

  render();
}

init();
