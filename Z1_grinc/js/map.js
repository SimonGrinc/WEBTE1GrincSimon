// =========================================================
// map.js – interaktívna mapa (Leaflet) na stránke map.html
// Zobrazuje školu a bydlisko, umožní pridať vlastné body
// kliknutím a vypočítať vzdialenosť bodu ku škole/bydlisku.
// =========================================================

// Pevné body na mape (súradnice v stupňoch WGS84).
const SCHOOL = { name: "FEI STU", lat: 48.1518, lng: 17.0732 };
const HOME = { name: "Mladosť", lat: 48.1588, lng: 17.0641 };

// Kľúč, pod ktorým sa body používateľa ukladajú do localStorage.
const STORAGE_KEY = "map-user-points";

// Prevod stupňov na radiány (goniometrické funkcie v JS pracujú v radiánoch).
function toRad(deg) {
    return (deg * Math.PI) / 180;
}

// Haversinov vzorec – vzdušná vzdialenosť dvoch bodov na guli
// (Zemi) podľa ich zemepisnej šírky a dĺžky. Výsledok v km.
function haversineDistance(lat1, lng1, lat2, lng2) {
    const earthRadiusKm = 6371; // priemerný polomer Zeme

    // Rozdiely súradníc v radiánoch.
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    // a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    // c = stredový uhol medzi bodmi (v radiánoch).
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Dĺžka oblúka = polomer × uhol.
    return earthRadiusKm * c;
}

// Načíta uložené body z localStorage; ak nič nie je uložené,
// vráti prázdne pole.
function loadPoints() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

// Uloží pole bodov do localStorage (ako JSON reťazec),
// takže body ostanú aj po obnovení stránky.
function savePoints(points) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

// Vytvorí obsah popupu (nadpis + voliteľný riadok textu).
// Používa textContent namiesto innerHTML, takže názov bodu
// zadaný používateľom sa nevykoná ako HTML (ochrana pred XSS).
function createPopupContent(title, text) {
    const wrapper = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent = title;
    wrapper.appendChild(heading);

    // Druhý riadok pridáme iba ak je text zadaný.
    if (text) {
        const line = document.createElement("span");
        line.textContent = text;
        wrapper.appendChild(document.createElement("br"));
        wrapper.appendChild(line);
    }

    return wrapper;
}

// Stav aplikácie:
let userPoints = loadPoints(); // dáta bodov {name, lat, lng}
const userMarkers = [];        // Leaflet markery k bodom (rovnaké poradie ako userPoints)
let activeLine = null;         // aktuálne nakreslená čiara vzdialenosti

// Vytvorenie mapy v prvku s id="map".
const map = L.map("map");

// Podkladová vrstva dlaždíc z OpenStreetMap ({s} subdoména,
// {z} zoom, {x}/{y} súradnice dlaždice). Atribúcia je povinná licenciou.
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Nastaví výrez a zoom mapy tak, aby boli vidieť škola aj bydlisko
// (s odsadením 60 px od okrajov).
map.fitBounds(
    [[SCHOOL.lat, SCHOOL.lng], [HOME.lat, HOME.lng]],
    { padding: [60, 60] }
);

// Pevné markery pre školu a bydlisko.
const schoolMarker = L.marker([SCHOOL.lat, SCHOOL.lng]).addTo(map);
const homeMarker = L.marker([HOME.lat, HOME.lng]).addTo(map);

// Nastaví (alebo vráti do pôvodného stavu) popupy pevných bodov –
// po výpočte vzdialenosti v nich totiž ostáva text so vzdialenosťou.
function resetFixedPopups() {
    schoolMarker.bindPopup(createPopupContent(SCHOOL.name, "Škola"));
    homeMarker.bindPopup(createPopupContent(HOME.name, "Bydlisko"));
}

// Prekreslí zoznam bodov pod mapou a možnosti v roletke formulára.
function renderPointsList() {
    const list = document.getElementById("pointsList");
    const emptyState = document.getElementById("mapEmptyState");
    const form = document.getElementById("distanceForm");
    const select = document.getElementById("pointSelect");

    // Vymazanie starého obsahu pred novým vykreslením.
    list.innerHTML = "";
    select.innerHTML = "";

    // Žiadne body: zobrazíme hlášku, zoznam a formulár skryjeme.
    if (userPoints.length === 0) {
        emptyState.hidden = false;
        list.hidden = true;
        form.hidden = true;
        return;
    }

    // Aspoň jeden bod: opačne.
    emptyState.hidden = true;
    list.hidden = false;
    form.hidden = false;

    // Pre každý bod položka v zozname aj v roletke.
    for (let i = 0; i < userPoints.length; i++) {
        const point = userPoints[i];

        const li = document.createElement("li");
        li.textContent = point.name;
        list.appendChild(li);

        // Hodnota option = index bodu v poli userPoints.
        const option = document.createElement("option");
        option.value = i;
        option.textContent = point.name;
        select.appendChild(option);
    }
}

// Odstráni všetky markery používateľa z mapy a vytvorí ich nanovo
// podľa poľa userPoints (zároveň obnoví ich pôvodné popupy).
function renderUserMarkers() {
    for (let i = 0; i < userMarkers.length; i++) {
        map.removeLayer(userMarkers[i]);
    }
    userMarkers.length = 0; // vyprázdnenie poľa (const pole sa nedá priradiť nanovo)

    for (let i = 0; i < userPoints.length; i++) {
        const point = userPoints[i];
        const marker = L.marker([point.lat, point.lng]).addTo(map)
            .bindPopup(createPopupContent(point.name, "Môj bod"));
        userMarkers.push(marker);
    }
}

// Klik na mapu: opýta sa na názov a pridá nový bod.
function handleMapClick(e) {
    const name = prompt("Zadaj názov pre tento bod:");
    // Zrušenie dialógu (null) alebo prázdny / iba medzery → nič nepridáme.
    if (!name || !name.trim()) return;

    // e.latlng obsahuje súradnice miesta kliknutia.
    userPoints.push({ name: name, lat: e.latlng.lat, lng: e.latlng.lng });
    savePoints(userPoints);

    renderPointsList();
    renderUserMarkers();
}

map.on("click", handleMapClick);

// Odoslanie formulára: výpočet vzdialenosti vybraného bodu k cieľu.
function handleDistanceSubmit(e) {
    e.preventDefault(); // zabráni obnoveniu stránky pri odoslaní formulára

    // Index vybraného bodu a kľúč cieľa ("school" / "home").
    const pointIndex = Number(document.getElementById("pointSelect").value);
    const targetKey = document.getElementById("targetSelect").value;

    const point = userPoints[pointIndex];
    const target = targetKey === "school" ? SCHOOL : HOME;
    const targetMarker = targetKey === "school" ? schoolMarker : homeMarker;

    // Vzdialenosť zaokrúhlená na 2 desatinné miesta.
    const distance = haversineDistance(point.lat, point.lng, target.lat, target.lng);
    const distanceText = distance.toFixed(2) + " km";

    // Výsledok v texte pod formulárom (aria-live ho prečíta čítačka).
    document.getElementById("distanceResult").textContent =
        "Vzdialenosť medzi \"" + point.name + "\" a \"" + target.name + "\": " + distanceText;

    // Vyčistenie popupov z predchádzajúceho výpočtu.
    resetFixedPopups();
    renderUserMarkers();

    // Marker vybraného bodu (po prekreslení majú markery rovnaké poradie ako body).
    const pointMarker = userMarkers[pointIndex];

    // Do popupov oboch koncov doplníme vzdialenosť.
    pointMarker.setPopupContent(
        createPopupContent(point.name, "Vzdialenosť do " + target.name + ": " + distanceText)
    );
    targetMarker.setPopupContent(
        createPopupContent(target.name, "Vzdialenosť do " + point.name + ": " + distanceText)
    );

    // Na mape môže byť naraz iba jedna čiara – starú odstránime.
    if (activeLine) {
        map.removeLayer(activeLine);
    }

    // Nová čiara medzi bodom a cieľom; farba sa číta z CSS premennej
    // --color-brand, aby bola zhodná s dizajnom webu.
    activeLine = L.polyline(
        [[point.lat, point.lng], [target.lat, target.lng]],
        { color: getComputedStyle(document.documentElement).getPropertyValue("--color-brand").trim(), weight: 3 }
    ).addTo(map);

    // Trvalý štítok so vzdialenosťou v strede čiary.
    activeLine.bindTooltip(distanceText, { permanent: true, direction: "center" });

    // Priblíženie mapy na čiaru a otvorenie popupu bodu.
    map.fitBounds(activeLine.getBounds(), { padding: [40, 40] });
    pointMarker.openPopup();
}

document.getElementById("distanceForm").addEventListener("submit", handleDistanceSubmit);

// Počiatočné vykreslenie po načítaní stránky.
resetFixedPopups();
renderPointsList();
renderUserMarkers();
