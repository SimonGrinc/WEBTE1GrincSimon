// =====================================================================
// KONFIGURÁCIA
// Všetko, čím sa reštaurácie líšia, je na jednom mieste. Novú reštauráciu
// pridáš tak, že napíšeš jej parser (parsers.js) a pridáš sem jeden objekt.
// =====================================================================

// Adresa proxy servera (nie je k dispozícii, preto prázdna – dáta sa čítajú z lokálnych kópií)
const PROXY_URL = "";
// Kľúč, pod ktorým sa dáta ukladajú do localStorage
const STORAGE_KEY = "lunchMenu";

const RESTAURANTS = [
    {
        id: "fiitfood",                         // technický identifikátor (kľúč v menuData, hodnota checkboxu)
        name: "FiitFood",                       // názov pre používateľa
        url: "http://www.freefood.sk/menu/",    // pôvodná stránka (odkaz v karte, adresa pre proxy)
        localFile: "local/fiitfood.html",       // lokálna kópia stránky
        address: "FIIT STU, Ilkovičova 2",      // adresa zobrazená v karte
        parser: parseFiitFood                   // odkaz na funkciu (bez zátvoriek), zavolá sa neskôr
    },
    {
        id: "druzba",
        name: "Družba catering",
        url: "https://www.druzbacatering.sk/jedalny-listok/",
        localFile: "local/druzba.html",
        address: "Botanická 25",
        parser: parseDruzba
    },
    {
        id: "hospoda",
        name: "Naše Hospoda Karloveská",
        url: "https://nasehospoda-karloveska.sk/",
        localFile: "local/hospoda.html",
        address: "Segnerova 3",
        parser: parseHospoda
    },
];

// =====================================================================
// NAČÍTANIE JEDNEJ REŠTAURÁCIE
// Stiahne HTML (lokálne alebo cez proxy), prevedie ho na DOM a zavolá parser.
// Vracia Promise s poľom jedál. Pri chybe vyhodí výnimku, ktorú spracuje loadAll.
// =====================================================================
async function loadRestaurant(restaurant, useLocal) {
    // Lokálna kópia, alebo pôvodná adresa zakódovaná a poslaná cez proxy
    const url = useLocal
        ? restaurant.localFile
        : PROXY_URL + encodeURIComponent(restaurant.url);

    // fetch vráti Promise s odpoveďou; await počká bez zablokovania stránky
    const response = await fetch(url);

    // fetch pri 404/500 chybu nevyhodí sám, preto stav kontrolujeme ručne
    if (!response.ok) {
        throw new Error(`Stránku sa nepodarilo načítať (HTTP ${response.status}).`);
    }

    // Telo odpovede (HTML ako text) – tiež asynchrónne
    const html = await response.text();
    // DOMParser vytvorí samostatný DOM strom v pamäti (nezobrazí sa, skripty sa nespustia)
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Parser konkrétnej reštaurácie vráti pole jedál v jednotnej štruktúre
    return restaurant.parser(doc);
}

// =====================================================================
// STAV APLIKÁCIE
// =====================================================================

// Všetky načítané dáta: { savedDate, restaurants: { id: { items, updated, error } } }
let menuData = null;

// Zvolený deň: 1–5 (pondelok–piatok) alebo "week" (celý týždeň)
let selectedDay = 1;
// Množina id zobrazených reštaurácií (na začiatku všetky)
const visibleRestaurants = new Set(RESTAURANTS.map(r => r.id));

// Názvy dní – index zodpovedá Date.getDay() (0 = nedeľa)
const DAY_NAMES = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];

// =====================================================================
// FORMÁTOVANIE (prevod dát na text pre používateľa)
// =====================================================================

// 7.1 → "7,10 €"
function formatPrice(price) {
    return price.toFixed(2).replace(".", ",") + " €";
}

// "2026-10-16T15:57:12.225Z" (UTC) → "16. 10. 2026 17:57" (miestny čas)
function formatDateTime(iso) {
    return new Date(iso).toLocaleString("sk-SK", {
        day: "numeric", month: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// "2026-10-05" → "5. 10." (bez Date, aby nevznikol posun kvôli časovému pásmu)
function formatShortDate(iso) {
    const [year, month, day] = iso.split("-");
    return `${Number(day)}. ${Number(month)}.`;
}

// =====================================================================
// NAČÍTANIE VŠETKÝCH REŠTAURÁCIÍ
// Načíta reštaurácie paralelne, chyba jednej neovplyvní ostatné.
// Výsledok uloží do menuData, do localStorage a vykreslí.
// =====================================================================
async function loadAll() {
    // Zapnutý prepínač = lokálne kópie
    const useLocal = $("#source-switch").is(":checked");

    // Indikátor načítania a vypnutie tlačidla (aby sa nespustilo dvakrát)
    $("#loading").removeClass("d-none");
    $("#refresh-btn").prop("disabled", true);

    // map spustí všetky načítania naraz (pole Promise),
    // allSettled počká, kým sa všetky vybavia – úspešne aj neúspešne
    const results = await Promise.allSettled(
        RESTAURANTS.map(restaurant => loadRestaurant(restaurant, useLocal))
    );

    // Staré dáta – použijú sa pri reštaurácii, ktorej načítanie zlyhalo
    const previous = menuData ? menuData.restaurants : {};
    const restaurants = {};

    // results sú v rovnakom poradí ako RESTAURANTS, preto id zistíme podľa indexu
    results.forEach((result, index) => {
        const id = RESTAURANTS[index].id;

        if (result.status === "fulfilled") {
            // Úspech: nové jedlá a aktuálny čas aktualizácie
            restaurants[id] = {
                items: result.value,
                updated: new Date().toISOString(),
                error: null
            };
        } else {
            // Chyba: ponecháme staršie jedlá aj ich čas (ak sú) a uložíme text chyby
            const old = previous[id];
            restaurants[id] = {
                items: old ? old.items : [],
                updated: old ? old.updated : null,
                error: result.reason.message
            };
        }
    });

    // Nový stav aplikácie; savedDate slúži na kontrolu, či sú dáta z dneška
    menuData = {
        savedDate: toISODate(new Date()),
        restaurants: restaurants
    };

    saveData();
    render();

    // Koniec načítania
    $("#loading").addClass("d-none");
    $("#refresh-btn").prop("disabled", false);
}

// =====================================================================
// LOCALSTORAGE
// localStorage ukladá iba text, preto JSON.stringify / JSON.parse.
// =====================================================================

// Uloží aktuálny menuData
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData));
}

// Načíta uložené dáta; pri chýbajúcich alebo poškodených vráti null
function loadData() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    try {
        return JSON.parse(json);
    } catch (e) {
        // Neplatný JSON nesmie rozbiť stránku – správame sa, akoby nič uložené nebolo
        return null;
    }
}

// Zmaže uložené dáta aj stav v pamäti (tlačidlo „Vymazať uložené dáta“)
function clearData() {
    localStorage.removeItem(STORAGE_KEY);
    menuData = null;
}

// =====================================================================
// VYKRESĽOVANIE
// Elementy sa vytvárajú cez jQuery a cudzie údaje sa vkladajú cez .text(),
// nikdy ako HTML (ochrana pred XSS, cudzí HTML sa do stránky nevkladá).
// =====================================================================

// Zoznam jedál (ul) z poľa jedál
function renderDishes(items) {
    const $list = $("<ul>").addClass("dish-list list-unstyled mb-0");

    items.forEach(item => {
        const isSoup = item.type === "soup";
        // Trieda podľa typu – v CSS sa polievky a hlavné jedlá graficky odlišujú
        const $li = $("<li>").addClass("dish " + (isSoup ? "dish-soup" : "dish-main"));

        // Ľavá časť: typ a názov
        const $info = $("<div>").addClass("dish-info");
        $info.append($("<span>").addClass("dish-type").text(isSoup ? "Polievka" : "Hlavné jedlo"));
        $info.append($("<span>").addClass("dish-name").text(item.name));

        // Detaily (hmotnosť, alergény) – len tie, ktoré jedlo má, oddelené „·“
        const details = [];
        if (item.weight) details.push(item.weight);
        if (item.allergens.length > 0) details.push("Alergény: " + item.allergens.join(", "));
        if (details.length > 0) {
            $info.append($("<small>").addClass("dish-details").text(details.join(" · ")));
        }

        // Pravá časť: cena (prípadne aj študentská), alebo text, ak cena chýba
        const $price = $("<span>").addClass("price");
        if (item.price !== null) {
            $price.text(formatPrice(item.price));
            if (item.priceStudent !== null) {
                $price.append($("<small>").addClass("price-student").text("študent " + formatPrice(item.priceStudent)));
            }
        } else {
            $price.text(isSoup ? "v cene menu" : "cena neuvedená");
        }

        $li.append($info, $price);
        $list.append($li);
    });

    return $list;
}

// Jedlá jedného dňa; ak žiadne nie sú, vráti hlásenie
function renderDayItems(items, day) {
    const dayItems = items.filter(item => item.day === day);
    if (dayItems.length === 0) {
        return $("<p>").addClass("no-menu").text("Menu na tento deň nie je k dispozícii.");
    }
    return renderDishes(dayItems);
}

// Celá karta jednej reštaurácie (hlavička + upozornenie + menu)
function renderCard(restaurant) {
    // Dáta reštaurácie z menuData (alebo null, ak dáta nie sú)
    const data = menuData ? menuData.restaurants[restaurant.id] : null;
    const items = data ? data.items : [];

    // Stĺpec gridu: na mobile celá šírka, od lg tretina (3 karty vedľa seba)
    const $col = $("<div>").addClass("col-12 col-lg-4");
    const $card = $("<article>").addClass("card restaurant-card h-100");

    // Hlavička: názov s odkazom na pôvodnú stránku a adresa
    const $header = $("<header>").addClass("card-header");
    const $link = $("<a>")
        .attr({ href: restaurant.url, target: "_blank", rel: "noopener noreferrer" })
        .text(restaurant.name);
    $header.append($("<h3>").addClass("h5 mb-1").append($link));
    $header.append($("<p>").addClass("small mb-0").text(restaurant.address));

    // Čas poslednej aktualizácie (ak existuje)
    if (data && data.updated) {
        const $time = $("<time>").attr("datetime", data.updated).text(formatDateTime(data.updated));
        $header.append($("<p>").addClass("small mb-0 updated").append("Aktualizované: ", $time));
    }

    const $body = $("<div>").addClass("card-body");

    // Upozornenie, ak posledné načítanie zlyhalo
    if (data && data.error) {
        let message = "Menu sa nepodarilo načítať: " + data.error;
        if (items.length > 0) message += " Zobrazujú sa staršie uložené dáta.";
        $body.append($("<div>").addClass("alert alert-warning small").attr("role", "alert").text(message));
    }

    if (items.length === 0) {
        // Žiadne dáta
        $body.append($("<p>").addClass("no-menu").text("Menu nie je k dispozícii."));
    } else if (selectedDay === "week") {
        // Celý týždeň: pre každý deň nadpis (s dátumom, ak je) a jeho jedlá
        for (let day = 1; day <= 5; day++) {
            const first = items.find(item => item.day === day);
            const heading = DAY_NAMES[day] + (first ? " " + formatShortDate(first.date) : "");
            $body.append($("<h4>").addClass("day-heading").text(heading));
            $body.append(renderDayItems(items, day));
        }
    } else {
        // Jeden zvolený deň
        $body.append(renderDayItems(items, selectedDay));
    }

    $card.append($header, $body);
    $col.append($card);
    return $col;
}

// Prekreslí všetky karty podľa aktuálneho stavu (dáta, deň, filter)
function render() {
    // Vyprázdnenie, inak by sa nové karty pridávali k starým
    const $container = $("#menu-container").empty();

    RESTAURANTS
        .filter(restaurant => visibleRestaurants.has(restaurant.id))
        .forEach(restaurant => $container.append(renderCard(restaurant)));
}

// Vytvorí checkboxy filtra z konfigurácie (nová reštaurácia sa pridá automaticky)
function renderFilter() {
    const $filter = $("#restaurant-filter").empty();

    RESTAURANTS.forEach(restaurant => {
        const inputId = "filter-" + restaurant.id;

        // .attr = HTML atribúty, .prop = aktuálny stav (zaškrtnutie)
        const $input = $("<input>")
            .addClass("form-check-input")
            .attr({ type: "checkbox", id: inputId, value: restaurant.id })
            .prop("checked", visibleRestaurants.has(restaurant.id));

        // for + id prepojí popis s checkboxom (klik na text prepne checkbox)
        const $label = $("<label>")
            .addClass("form-check-label")
            .attr("for", inputId)
            .text(restaurant.name);

        $filter.append($("<div>").addClass("form-check form-check-inline").append($input, $label));
    });
}

// =====================================================================
// UDALOSTI
// Prepínanie dňa a filtra iba zmení stav a prekreslí – stránka sa nenačítava znova.
// =====================================================================
function bindEvents() {

    // Výber dňa (rádiá); hodnota je text, preto prevod na číslo kvôli porovnaniu ===
    $("input[name='day']").on("change", function () {
        const value = $(this).val();
        selectedDay = value === "week" ? "week" : Number(value);
        render();
    });

    // Filter reštaurácií – delegovaná udalosť na rodičovi,
    // lebo checkboxy vytvára JavaScript
    $("#restaurant-filter").on("change", "input", function () {
        const id = $(this).val();
        if (this.checked) {
            visibleRestaurants.add(id);
        } else {
            visibleRestaurants.delete(id);
        }
        render();
    });

    // Aktualizovať menu – nové načítanie a spracovanie
    $("#refresh-btn").on("click", loadAll);

    // Vymazať uložené dáta
    $("#clear-btn").on("click", function () {
        clearData();
        render();
    });
}

// =====================================================================
// ŠTART APLIKÁCIE
// Skript je na konci <body>, takže DOM už existuje.
// Tento blok musí byť na konci súboru (const/let nad ním už musia byť deklarované).
// =====================================================================

// Dnešný deň; cez víkend zobrazí oznam a vráti pondelok
function getInitialDay() {
    const today = new Date().getDay();
    const isWeekend = today === 0 || today === 6;

    $("#weekend-notice").toggleClass("d-none", !isWeekend);
    return isWeekend ? 1 : today;
}

selectedDay = getInitialDay();
$("#day-" + selectedDay).prop("checked", true);

renderFilter();
bindEvents();

menuData = loadData();

// Dnešné dáta v localStorage → iba vykresliť (stránky reštaurácií sa nenačítavajú),
// inak načítať znova
if (menuData && menuData.savedDate === toISODate(new Date())) {
    render();
} else {
    loadAll();
}
