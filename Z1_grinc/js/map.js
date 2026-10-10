const SCHOOL = { name: "FEI STU", lat: 48.1518, lng: 17.0732 };
const HOME = { name: "Mladosť", lat: 48.1588, lng: 17.0641 };

const STORAGE_KEY = "map-user-points";

function toRad(deg) {
    return (deg * Math.PI) / 180;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
    const earthRadiusKm = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

function loadPoints() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function savePoints(points) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

function createPopupContent(title, text) {
    const wrapper = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent = title;
    wrapper.appendChild(heading);

    if (text) {
        const line = document.createElement("span");
        line.textContent = text;
        wrapper.appendChild(document.createElement("br"));
        wrapper.appendChild(line);
    }

    return wrapper;
}

let userPoints = loadPoints();
const userMarkers = [];
let activeLine = null;

const map = L.map("map");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

map.fitBounds(
    [[SCHOOL.lat, SCHOOL.lng], [HOME.lat, HOME.lng]],
    { padding: [60, 60] }
);

const schoolMarker = L.marker([SCHOOL.lat, SCHOOL.lng]).addTo(map);
const homeMarker = L.marker([HOME.lat, HOME.lng]).addTo(map);

function resetFixedPopups() {
    schoolMarker.bindPopup(createPopupContent(SCHOOL.name, "Škola"));
    homeMarker.bindPopup(createPopupContent(HOME.name, "Bydlisko"));
}

function renderPointsList() {
    const list = document.getElementById("pointsList");
    const emptyState = document.getElementById("mapEmptyState");
    const form = document.getElementById("distanceForm");
    const select = document.getElementById("pointSelect");

    list.innerHTML = "";
    select.innerHTML = "";

    if (userPoints.length === 0) {
        emptyState.hidden = false;
        list.hidden = true;
        form.hidden = true;
        return;
    }

    emptyState.hidden = true;
    list.hidden = false;
    form.hidden = false;

    for (let i = 0; i < userPoints.length; i++) {
        const point = userPoints[i];

        const li = document.createElement("li");
        li.textContent = point.name;
        list.appendChild(li);

        const option = document.createElement("option");
        option.value = i;
        option.textContent = point.name;
        select.appendChild(option);
    }
}

function renderUserMarkers() {
    for (let i = 0; i < userMarkers.length; i++) {
        map.removeLayer(userMarkers[i]);
    }
    userMarkers.length = 0;

    for (let i = 0; i < userPoints.length; i++) {
        const point = userPoints[i];
        const marker = L.marker([point.lat, point.lng]).addTo(map)
            .bindPopup(createPopupContent(point.name, "Môj bod"));
        userMarkers.push(marker);
    }
}

function handleMapClick(e) {
    const name = prompt("Zadaj názov pre tento bod:");
    if (!name || !name.trim()) return;

    userPoints.push({ name: name, lat: e.latlng.lat, lng: e.latlng.lng });
    savePoints(userPoints);

    renderPointsList();
    renderUserMarkers();
}

map.on("click", handleMapClick);

function handleDistanceSubmit(e) {
    e.preventDefault();

    const pointIndex = Number(document.getElementById("pointSelect").value);
    const targetKey = document.getElementById("targetSelect").value;

    const point = userPoints[pointIndex];
    const target = targetKey === "school" ? SCHOOL : HOME;
    const targetMarker = targetKey === "school" ? schoolMarker : homeMarker;

    const distance = haversineDistance(point.lat, point.lng, target.lat, target.lng);
    const distanceText = distance.toFixed(2) + " km";

    document.getElementById("distanceResult").textContent =
        "Vzdialenosť medzi \"" + point.name + "\" a \"" + target.name + "\": " + distanceText;

    resetFixedPopups();
    renderUserMarkers();

    const pointMarker = userMarkers[pointIndex];

    pointMarker.setPopupContent(
        createPopupContent(point.name, "Vzdialenosť do " + target.name + ": " + distanceText)
    );
    targetMarker.setPopupContent(
        createPopupContent(target.name, "Vzdialenosť do " + point.name + ": " + distanceText)
    );

    if (activeLine) {
        map.removeLayer(activeLine);
    }

    activeLine = L.polyline(
        [[point.lat, point.lng], [target.lat, target.lng]],
        { color: getComputedStyle(document.documentElement).getPropertyValue("--color-brand").trim(), weight: 3 }
    ).addTo(map);

    activeLine.bindTooltip(distanceText, { permanent: true, direction: "center" });

    map.fitBounds(activeLine.getBounds(), { padding: [40, 40] });
    pointMarker.openPopup();
}

document.getElementById("distanceForm").addEventListener("submit", handleDistanceSubmit);

resetFixedPopups();
renderPointsList();
renderUserMarkers();