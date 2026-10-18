const PROXY_URL = "";          
const STORAGE_KEY = "lunchMenu";

const RESTAURANTS = [
    {
        id: "fiitfood",
        name: "FiitFood",
        url: "http://www.freefood.sk/menu/",
        localFile: "local/fiitfood.html",
        address: "FIIT STU, Ilkovičova 2",
        parser: parseFiitFood
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

async function loadRestaurant(restaurant, useLocal) {
    const url = useLocal
        ? restaurant.localFile
        : PROXY_URL + encodeURIComponent(restaurant.url);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Stránku sa nepodarilo načítať (HTTP ${response.status}).`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    return restaurant.parser(doc);
}

let menuData = null;

let selectedDay = 1;   
const visibleRestaurants = new Set(RESTAURANTS.map(r => r.id));

const DAY_NAMES = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];

function formatPrice(price) {
    return price.toFixed(2).replace(".", ",") + " €";
}

function formatDateTime(iso) {
    return new Date(iso).toLocaleString("sk-SK", {
        day: "numeric", month: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function formatShortDate(iso) {
    const [year, month, day] = iso.split("-");
    return `${Number(day)}. ${Number(month)}.`;
}

async function loadAll() {
    const useLocal = $("#source-switch").is(":checked");

    $("#loading").removeClass("d-none");
    $("#refresh-btn").prop("disabled", true);

    const results = await Promise.allSettled(
        RESTAURANTS.map(restaurant => loadRestaurant(restaurant, useLocal))
    );

    const previous = menuData ? menuData.restaurants : {};
    const restaurants = {};

    results.forEach((result, index) => {
        const id = RESTAURANTS[index].id;

        if (result.status === "fulfilled") {
            restaurants[id] = {
                items: result.value,
                updated: new Date().toISOString(),
                error: null
            };
        } else {
            const old = previous[id];
            restaurants[id] = {
                items: old ? old.items : [],
                updated: old ? old.updated : null,
                error: result.reason.message
            };
        }
    });

    menuData = {
        savedDate: toISODate(new Date()),
        restaurants: restaurants
    };

    saveData();
    render();

    $("#loading").addClass("d-none");
    $("#refresh-btn").prop("disabled", false);
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData));
}

function loadData() {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    try {
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

function clearData() {
    localStorage.removeItem(STORAGE_KEY);
    menuData = null;
}

function renderDishes(items) {
    const $list = $("<ul>").addClass("dish-list list-unstyled mb-0");

    items.forEach(item => {
        const isSoup = item.type === "soup";
        const $li = $("<li>").addClass("dish " + (isSoup ? "dish-soup" : "dish-main"));

        const $info = $("<div>").addClass("dish-info");
        $info.append($("<span>").addClass("dish-type").text(isSoup ? "Polievka" : "Hlavné jedlo"));
        $info.append($("<span>").addClass("dish-name").text(item.name));

        const details = [];
        if (item.weight) details.push(item.weight);
        if (item.allergens.length > 0) details.push("Alergény: " + item.allergens.join(", "));
        if (details.length > 0) {
            $info.append($("<small>").addClass("dish-details").text(details.join(" · ")));
        }

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

function renderDayItems(items, day) {
    const dayItems = items.filter(item => item.day === day);
    if (dayItems.length === 0) {
        return $("<p>").addClass("no-menu").text("Menu na tento deň nie je k dispozícii.");
    }
    return renderDishes(dayItems);
}

function renderCard(restaurant) {
    const data = menuData ? menuData.restaurants[restaurant.id] : null;
    const items = data ? data.items : [];

    const $col = $("<div>").addClass("col-12 col-lg-4");
    const $card = $("<article>").addClass("card restaurant-card h-100");

    const $header = $("<header>").addClass("card-header");
    const $link = $("<a>")
        .attr({ href: restaurant.url, target: "_blank", rel: "noopener noreferrer" })
        .text(restaurant.name);
    $header.append($("<h3>").addClass("h5 mb-1").append($link));
    $header.append($("<p>").addClass("small mb-0").text(restaurant.address));

    if (data && data.updated) {
        const $time = $("<time>").attr("datetime", data.updated).text(formatDateTime(data.updated));
        $header.append($("<p>").addClass("small mb-0 updated").append("Aktualizované: ", $time));
    }

    const $body = $("<div>").addClass("card-body");

    if (data && data.error) {
        let message = "Menu sa nepodarilo načítať: " + data.error;
        if (items.length > 0) message += " Zobrazujú sa staršie uložené dáta.";
        $body.append($("<div>").addClass("alert alert-warning small").attr("role", "alert").text(message));
    }

    if (items.length === 0) {
        $body.append($("<p>").addClass("no-menu").text("Menu nie je k dispozícii."));
    } else if (selectedDay === "week") {
        for (let day = 1; day <= 5; day++) {
            const first = items.find(item => item.day === day);
            const heading = DAY_NAMES[day] + (first ? " " + formatShortDate(first.date) : "");
            $body.append($("<h4>").addClass("day-heading").text(heading));
            $body.append(renderDayItems(items, day));
        }
    } else {
        $body.append(renderDayItems(items, selectedDay));
    }

    $card.append($header, $body);
    $col.append($card);
    return $col;
}

function render() {
    const $container = $("#menu-container").empty();

    RESTAURANTS
        .filter(restaurant => visibleRestaurants.has(restaurant.id))
        .forEach(restaurant => $container.append(renderCard(restaurant)));
}

function renderFilter() {
    const $filter = $("#restaurant-filter").empty();

    RESTAURANTS.forEach(restaurant => {
        const inputId = "filter-" + restaurant.id;

        const $input = $("<input>")
            .addClass("form-check-input")
            .attr({ type: "checkbox", id: inputId, value: restaurant.id })
            .prop("checked", visibleRestaurants.has(restaurant.id));

        const $label = $("<label>")
            .addClass("form-check-label")
            .attr("for", inputId)
            .text(restaurant.name);

        $filter.append($("<div>").addClass("form-check form-check-inline").append($input, $label));
    });
}

function bindEvents() {

    $("input[name='day']").on("change", function () {
        const value = $(this).val();
        selectedDay = value === "week" ? "week" : Number(value);
        render();
    });

    $("#restaurant-filter").on("change", "input", function () {
        const id = $(this).val();
        if (this.checked) {
            visibleRestaurants.add(id);
        } else {
            visibleRestaurants.delete(id);
        }
        render();
    });

    $("#refresh-btn").on("click", loadAll);

    $("#clear-btn").on("click", function () {
        clearData();
        render();
    });
}

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

if (menuData && menuData.savedDate === toISODate(new Date())) {
    render();
} else {
    loadAll();
}