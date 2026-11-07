let points = [];
const form = document.querySelector('#point-form');
const list = document.querySelector('#points');
const statuss = document.querySelector('#status');

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
  form.reset();

}

// TODO: Pripoj submit na formulár.
form.addEventListener('submit', handleSubmit);