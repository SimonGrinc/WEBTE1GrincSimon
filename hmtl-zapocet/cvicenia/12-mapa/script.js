// =====================================================================
// Úloha 12 – Mapa a udalosti knižnice Leaflet
// =====================================================================
//
// PREDPOKLADY (over si ich v pôvodnom map.js a prípadne uprav mená):
//   - Leaflet je pripojený, takže existuje globálny objekt L.
//   - V súbore už máš funkcie a premenné z úloh 5 a 6:
//       points, readPoint(), isValidPoint(), renderPoints(), savePoints()
//     a body majú tvar { id, name, latitude, longitude }.
//   - V HTML je zoznam bodov s ID #points a stavový riadok #status.
//   - renderPoints() dáva tlačidlu „Odstrániť“ atribút data-id
//     (úprava je na konci tohto súboru).
//   - Pre bonus existuje calculateDistance(lat1, lng1, lat2, lng2),
//     ktorá vracia vzdialenosť v km. Ak má v projekte iné parametre,
//     uprav volanie v createPopupContent.
//
// Funkciu setupMapExercise zavolaj vnútri initializeMap, keď už
// existuje mapa (map) aj formulár. Pôvodné obsluhy kliknutia na mapu
// a odoslania formulára pritom ODSTRÁŇ, inak by bežali obe naraz.
// =====================================================================
 
// Súradnice školy pre bonus (FEI STU, Ilkovičova 3).
// Ak má pôvodný projekt vlastnú konštantu, použi radšej tú.
const SCHOOL = { latitude: 48.151897, longitude: 17.073297 };
 
function setupMapExercise(map, form, latitudeInput, longitudeInput) {
  // Značka náhľadu – vždy najviac jedna. null znamená „zatiaľ žiadna“.
  let preview = null;
 
  // Map: ID bodu → Leaflet marker.
  // Vďaka tomu pri mazaní nájdeme správny marker podľa ID,
  // aj keď majú dva body rovnaký názov.
  const pointMarkers = new Map();
 
  const list = document.querySelector('#points');
  const statusEl = document.querySelector('#status');
 
  // -------------------------------------------------------------------
  // Pomocná funkcia: obsah popupu ako PRVOK, nie ako HTML text.
  // Leaflet pri bindPopup('text') berie text ako HTML, takže
  // '<b>Domov</b>' by bolo tučné. Keď mu dáme prvok s textContent,
  // zobrazí sa doslova '<b>Domov</b>'. To je kontrolný príklad zo zadania.
  // -------------------------------------------------------------------
  function createPopupContent(point) {
    const wrapper = document.createElement('div');
 
    const name = document.createElement('strong');
    name.textContent = point.name;          // textContent = bezpečný text
    wrapper.append(name);
 
    // BONUS: vzdialenosť od školy na dve desatinné miesta.
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
 
  // -------------------------------------------------------------------
  // Pomocná funkcia: vytvorí uložený marker pre bod a zapamätá si ho.
  // -------------------------------------------------------------------
  function addPointMarker(point) {
    const marker = L.marker([point.latitude, point.longitude])
      .addTo(map)                            // zobraz na mape
      .bindPopup(createPopupContent(point)); // popup sa otvorí po kliknutí
 
    pointMarkers.set(point.id, marker);      // ulož pod ID bodu
    return marker;
  }
 
  // -------------------------------------------------------------------
  // Kliknutie na mapu
  // -------------------------------------------------------------------
  function handleMapClick(event) {
    // Leaflet posiela vlastný objekt udalosti. Súradnice miesta
    // kliknutia sú v event.latlng (lat = šírka, lng = dĺžka).
    const { lat, lng } = event.latlng;
 
    // Zapíš do formulára na 6 desatinných miest.
    // toFixed vracia text, čo je pre .value presne to, čo treba.
    latitudeInput.value = lat.toFixed(6);
    longitudeInput.value = lng.toFixed(6);
 
    if (preview === null) {
      // Prvé kliknutie: vytvor náhľad. circleMarker vyzerá inak ako
      // uložený marker, takže je jasné, že bod ešte nie je uložený.
      preview = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#d33',
        fillOpacity: 0.5
      }).addTo(map);
    } else {
      // Ďalšie kliknutie: náhľad iba presuň. Nevytvárame nový,
      // takže po troch kliknutiach je na mape stále len jeden.
      preview.setLatLng([lat, lng]);
    }
  }
 
  // -------------------------------------------------------------------
  // Odoslanie formulára
  // -------------------------------------------------------------------
  function handleSubmit(event) {
    event.preventDefault();                  // žiadne obnovenie stránky
 
    const point = readPoint();               // z úlohy 5: objekt alebo null
 
    // Neplatný vstup: správa a koniec. Formulár NEmažeme,
    // aby používateľ mohol chybu opraviť.
    if (point === null || !isValidPoint(point)) {
      statusEl.textContent = 'Skontroluj názov a súradnice.';
      return;
    }
 
    // Platný bod: stav, uloženie, zoznam (všetko z úloh 5 a 6).
    points.push(point);
    savePoints();
    renderPoints();
 
    // Uložený marker s popupom a zapamätanie pod ID.
    addPointMarker(point);
 
    // Náhľad už netreba – na jeho mieste je teraz skutočný marker.
    if (preview !== null) {
      preview.remove();                      // zmaž z mapy
      preview = null;                        // a zabudni naň
    }
 
    statusEl.textContent = 'Bod bol pridaný.';
    form.reset();
  }
 
  // -------------------------------------------------------------------
  // Mazanie bodu
  // -------------------------------------------------------------------
  function deletePoint(id) {
    // 1. Marker: nájdi podľa ID, odstráň z mapy aj z Map.
    const marker = pointMarkers.get(id);
    if (marker) {
      marker.remove();
      pointMarkers.delete(id);
    }
 
    // 2. Stav: ponechaj všetky body okrem mazaného (filter).
    points = points.filter(point => point.id !== id);
 
    // 3. Uloženie a zoznam.
    savePoints();
    renderPoints();
    statusEl.textContent = 'Bod bol odstránený.';
  }
 
  // -------------------------------------------------------------------
  // Pripojenie udalostí
  // -------------------------------------------------------------------
 
  // Udalosti Leafletu sa pripájajú cez .on(), nie addEventListener.
  map.on('click', handleMapClick);
 
  form.addEventListener('submit', handleSubmit);
 
  // Mazanie cez „delegovanie udalosti“: jeden poslucháč na celom zozname.
  // Kliknutie na tlačidlo vybuble až sem (ako Escape v menu z úlohy 1).
  // Tlačidlá sa pri každom renderPoints vytvárajú nanovo, ale tento
  // poslucháč je na zozname, ktorý zostáva, takže funguje stále.
  list.addEventListener('click', event => {
    // closest nájde najbližšie tlačidlo s data-id (aj keby sa kliklo
    // na niečo vo vnútri tlačidla). Ak to nebolo tlačidlo, je null.
    const button = event.target.closest('button[data-id]');
    if (button) {
      deletePoint(button.dataset.id);
    }
  });
 
  // Body uložené z minula (úloha 6) dostanú markery hneď pri štarte.
  points.forEach(point => addPointMarker(point));
}
 
// =====================================================================
// ÚPRAVA renderPoints z úlohy 5/6
// =====================================================================
// Tlačidlo už NEMÁ vlastný poslucháč (mazanie rieši poslucháč na zozname
// vyššie, aby sa zmazal aj marker). Iba dostane data-id.
//
// function renderPoints() {
//   list.replaceChildren();
//   points.forEach(point => {
//     const li = document.createElement('li');
//     li.textContent = `${point.name} ${point.latitude} ${point.longitude} `;
//
//     const button = document.createElement('button');
//     button.type = 'button';
//     button.textContent = 'Odstrániť';
//     button.dataset.id = point.id;          // ← podľa toho vieme, čo mazať
//
//     li.append(button);
//     list.append(li);
//   });
// }
//
// =====================================================================
// VOLANIE vnútri initializeMap (príklad – mená prispôsob projektu)
// =====================================================================
//
// setupMapExercise(
//   map,
//   document.querySelector('#point-form'),
//   document.querySelector('#point-latitude'),
//   document.querySelector('#point-longitude')
// );
