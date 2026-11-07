const STORAGE_KEY = 'practice-points-v1';
let points = [];

// TODO: Prenes sem svoje funkcie a udalosti z vyriešenej úlohy 05.
const form = document.querySelector('#point-form');
const list = document.querySelector('#points');
const statuss = document.querySelector('#status');
const deleteButton = document.querySelector('#clear-points');

function readPoint() {
  // TODO: Načítaj vstupy. Over prázdne hodnoty pred prevodom súradníc.
  const name = document.querySelector('#point-name').value.trim();
  let latitude = document.querySelector('#point-latitude').value.trim();
  let longitude = document.querySelector('#point-longitude').value.trim();

  if(name == '' || latitude == '' || longitude == ''){
    return null;
  }
  // TODO: Vráť bod s jedinečným ID alebo null pri chybe.
  latitude = Number(latitude);
  longitude = Number(longitude);

  return { id: crypto.randomUUID(), name: name, latitude: latitude , longitude: longitude};
}

function isValidPoint(point) {
  const hasId =
    (typeof point.id === 'string' && point.id !== '') ||
    Number.isFinite(point.id);

  const hasValidName =
    typeof point.name === 'string' &&
    point.name.trim().length >= 1 &&
    point.name.trim().length <= 60;

  const hasValidLat =
    Number.isFinite(point.latitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90;

  const hasValidLng =
    Number.isFinite(point.longitude) &&
    point.longitude >= -180 &&
    point.longitude <= 180;

  return hasId && hasValidName && hasValidLat && hasValidLng;
}

function renderPoints() {
  // TODO: Vykresli body a tlačidlá na odstránenie podľa ID.
  list.innerHTML = "";
  for(let i = 0; i<points.length; i++){
    const point = points[i];
    const li = document.createElement("li");
    li.textContent = `${point.name} ${point.latitude} ${point.longitude}`;
    const deletes = document.createElement("button");
    deletes.innerText = "Kill yourself NOW !!!!"
    deletes.addEventListener("click",() => deletePoint(point.id));
    li.appendChild(deletes);
    list.appendChild(li);
  }
}

function deletePoint(id) {
  points = points.filter(point => point.id !== id);
  renderPoints();
  statuss.textContent = 'Bod bol odstránený.';
  savePoints();
}

function handleSubmit(event) {
  // TODO: Zabráň obnoveniu stránky, over bod, pridaj ho, vykresli a resetuj formulár.
  event.preventDefault();
  const point = readPoint();
  if(point != null){
    if(isValidPoint(point)){
      points.push(point);
    }
  }
  renderPoints();
  savePoints();
  form.reset();

}

// TODO: Pripoj submit na formulár.
form.addEventListener('submit', handleSubmit);

function savePoints() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch (error) {
    console.error('Chyba pri ukladaní bodov:', error);
    statuss.textContent = 'Body sa nepodarilo uložiť.';
  }
}

function loadPoints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      statuss.textContent = 'Uložené dáta majú zlý tvar, začínaš s prázdnym zoznamom.';
      return [];
    }

    const validPoints = data.filter(point =>
      point !== null && typeof point === 'object' && isValidPoint(point)
    );

    if (validPoints.length !== data.length) {
      statuss.textContent = 'Niektoré uložené body boli neplatné a vynechali sa.';
    }

    return validPoints;
  } catch (error) {
    console.error('Chyba pri načítaní bodov:', error);
    statuss.textContent = 'Uložené body sa nepodarilo načítať, začínaš s prázdnym zoznamom.';
    return [];
  }
}

function clearPoints() {
  localStorage.removeItem(STORAGE_KEY);
  points = [];
  renderPoints();
  statuss.textContent = 'Uložené body boli vymazané.';
}

// TODO: Pri štarte načítaj body; pri každej zmene ich ulož.
// TODO: Pripoj tlačidlo #clear-points.
deleteButton.addEventListener("click",() => clearPoints());
points = loadPoints();
renderPoints();