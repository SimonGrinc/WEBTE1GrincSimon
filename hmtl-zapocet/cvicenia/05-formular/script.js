// =====================================================================
// ČASŤ 1 – ÚLOHA 5 (tvoj kód, zmenené sú iba riadky so ZMENA)
// =====================================================================

let points = [];
const form = document.querySelector('#point-form');
const list = document.querySelector('#points');
const statuss = document.querySelector('#status');

function readPoint() {
  const name = document.querySelector('#point-name').value.trim();
  let latitude = document.querySelector('#point-latitude').value.trim();
  let longitude = document.querySelector('#point-longitude').value.trim();

  if (name === '' || latitude === '' || longitude === '') {
    return null;
  }

  latitude = Number(latitude);
  longitude = Number(longitude);

  return { id: crypto.randomUUID(), name: name, latitude: latitude, longitude: longitude };
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
  list.innerHTML = '';
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const li = document.createElement('li');
    li.textContent = `${point.name} ${point.latitude} ${point.longitude} `;

    const deletes = document.createElement('button');
    deletes.type = 'button';
    deletes.textContent = 'Odstrániť';
    // ZMENA: namiesto vlastného poslucháča iba data-id.
    // Mazanie (bod + marker) rieši poslucháč na zozname v časti 2.
    deletes.dataset.id = point.id;

    li.append(deletes);
    list.append(li);
  }
}

// ZMENA: časť 2 volá savePoints. V úlohe 5 sa neukladá, takže je prázdna.
// (Ak používaš kód z úlohy 6, daj sem svoju savePoints s localStorage.)
function savePoints() {}

// ZMENA: handleSubmit, deletePoint a form.addEventListener('submit', ...)
// z úlohy 5 sú preč – tieto veci teraz robí časť 2, inak by bežali dvakrát.


// =====================================================================
// ČASŤ 2 – ÚLOHA 12 (bez zmien)
// =====================================================================

const SCHOOL = { latitude: 48.151897, longitude: 17.073297 };

function setupMapExercise(map, form, latitudeInput, longitudeInput) {
  let preview = null;
  const pointMarkers = new Map();

  const list = document.querySelector('#points');
  const statusEl = document.querySelector('#status');

  function createPopupContent(point) {
    const wrapper = document.createElement('div');

    const name = document.createElement('strong');
    name.textContent = point.name;
    wrapper.append(name);

    if (typeof calculateDistance === 'function') {
      const km = calculateDistance(
        SCHOOL.latitude, SCHOOL.longitude,
        point.latitude, point.longitude
      );
      const distance = document.createElement('div');
      distance.textContent = `Vzdialenosť od školy: ${km.toFixed(2)} km`;
      wrapper.append(distance);
    }

    return wrapper;
  }

  function addPointMarker(point) {
    const marker = L.marker([point.latitude, point.longitude])
      .addTo(map)
      .bindPopup(createPopupContent(point));

    pointMarkers.set(point.id, marker);
    return marker;
  }

  function handleMapClick(event) {
    const { lat, lng } = event.latlng;

    latitudeInput.value = lat.toFixed(6);
    longitudeInput.value = lng.toFixed(6);

    if (preview === null) {
      preview = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#d33',
        fillOpacity: 0.5
      }).addTo(map);
    } else {
      preview.setLatLng([lat, lng]);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const point = readPoint();

    if (point === null || !isValidPoint(point)) {
      statusEl.textContent = 'Skontroluj názov a súradnice.';
      return;
    }

    points.push(point);
    savePoints();
    renderPoints();

    addPointMarker(point);

    if (preview !== null) {
      preview.remove();
      preview = null;
    }

    statusEl.textContent = 'Bod bol pridaný.';
    form.reset();
  }

  function deletePoint(id) {
    const marker = pointMarkers.get(id);
    if (marker) {
      marker.remove();
      pointMarkers.delete(id);
    }

    points = points.filter(point => point.id !== id);

    savePoints();
    renderPoints();
    statusEl.textContent = 'Bod bol odstránený.';
  }

  map.on('click', handleMapClick);

  form.addEventListener('submit', handleSubmit);

  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-id]');
    if (button) {
      deletePoint(button.dataset.id);
    }
  });

  points.forEach(point => addPointMarker(point));
}


// =====================================================================
// ČASŤ 3 – SPUSTENIE (vytvor mapu a raz zavolaj setupMapExercise)
// =====================================================================

const map = L.map('map').setView([SCHOOL.latitude, SCHOOL.longitude], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

setupMapExercise(
  map,
  form,
  document.querySelector('#point-latitude'),
  document.querySelector('#point-longitude')
);