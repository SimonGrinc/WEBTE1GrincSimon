const SCHOOL = { name: "FEI STU", lat: 48.1512, lng: 17.0722 };
const HOME = { name: "Bydlisko", lat: 48.1588, lng: 17.0641 };

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

let userPoints = loadPoints();
const userMarkers = [];
let activeLine = null;

const map = L.map("map").setView([48.7, 19.0], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

L.marker([SCHOOL.lat, SCHOOL.lng]).addTo(map)
    .bindPopup("<strong>" + SCHOOL.name + "</strong><br>Skola");

L.marker([HOME.lat, HOME.lng]).addTo(map)
    .bindPopup("<strong>" + HOME.name + "</strong><br>Bydlisko");

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
            .bindPopup("<strong>" + point.name + "</strong>");
        userMarkers.push(marker);
    }
}

function handleMapClick(e) {
    const name = prompt("Zadaj nazov pre tento bod:");
    if (!name) return;

    userPoints.push({ name: name, lat: e.latlng.lat, lng: e.latlng.lng });
    savePoints(userPoints);

    renderPointsList();
    renderUserMarkers();
}

map.on("click", handleMapClick);

function handleDistanceSubmit(e) {
    e.preventDefault();

    const pointIndex = document.getElementById("pointSelect").value;
    const targetKey = document.getElementById("targetSelect").value;

    const point = userPoints[pointIndex];
    const target = targetKey === "school" ? SCHOOL : HOME;

    const distance = haversineDistance(point.lat, point.lng, target.lat, target.lng);

    document.getElementById("distanceResult").textContent =
        "Vzdialenost medzi \"" + point.name + "\" a \"" + target.name + "\": " + distance.toFixed(2) + " km";

    if (activeLine) {
        map.removeLayer(activeLine);
    }

    activeLine = L.polyline(
        [[point.lat, point.lng], [target.lat, target.lng]],
        { color: "#4287f5", weight: 3 }
    ).addTo(map);

    map.fitBounds(activeLine.getBounds(), { padding: [40, 40] });
}

document.getElementById("distanceForm").addEventListener("submit", handleDistanceSubmit);

renderPointsList();
renderUserMarkers();