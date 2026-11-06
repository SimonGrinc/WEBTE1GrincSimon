// =====================================================================
// POMOCNÉ FUNKCIE
// Používajú ich všetky parsery. Regulárne výrazy sa používajú iba na krátke
// texty jednotlivých prvkov, nie na celý HTML dokument.
// =====================================================================

// Text ceny → číslo. "7,29 €" → 7.29, "1.70€" → 1.7, "v cene menu" → null
function parsePrice(text) {
    if (!text) return null;
    // Prvé číslo s nepovinnou desatinnou časťou (bodka alebo čiarka)
    const match = text.match(/\d+(?:[.,]\d+)?/);
    if (!match) return null;
    return parseFloat(match[0].replace(",", "."));
}

// Text s alergénmi → pole čísel. "Alergény: 1,3,7" → ["1", "3", "7"]
function parseAllergens(text) {
    if (!text) return [];
    // Všetky celé čísla v texte (g = všetky výskyty)
    const numbers = text.match(/\d+/g);
    return numbers || [];
}

// Text s dátumom → Date. "pondelok, 12.10.2026" → Date(2026, 9, 12)
function parseDate(text) {
    if (!text) return null;
    // Skupiny: [1] deň, [2] mesiac, [3] rok
    const match = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (!match) return null;
    // Mesiac sa v Date počíta od 0, preto - 1
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

// Nájde element vnútri rodiča a vráti jeho vyčistený text, alebo null
function getText(parent, selector) {
    const el = parent.querySelector(selector);
    if (!el) return null;
    return cleanText(el);
}

// Date → "2026-10-12" (miestny čas; toISOString by prevádzal na UTC a posunul deň)
function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Text elementu bez zalomení a viacnásobných medzier
function cleanText(el) {
    return el.textContent.replace(/\s+/g, " ").trim();
}

// =====================================================================
// PARSERY
// Každý dostane DOM dokument reštaurácie a vráti pole jedál v jednotnej štruktúre:
// { day, date, type, name, price, priceStudent, weight, allergens }
// Ak nenájde žiadne jedlo, vyhodí chybu (stránka zmenila štruktúru).
// =====================================================================

// ---------------------------------------------------------------------
// Naše Hospoda Karloveská
// Každý deň je <article> v sekcii #menu, jedlá sú div v .divide-y,
// typ, hmotnosť a alergény sú v samostatných span.
// ---------------------------------------------------------------------
function parseHospoda(doc) {
    const items = [];
    // Iba články v sekcii menu (na stránke sú aj iné article)
    const days = doc.querySelectorAll("#menu article");

    days.forEach(article => {
        // Dátum z hlavičky dňa (prvý priamy div)
        const date = parseDate(getText(article, ":scope > div"));
        // Týždenný špeciál nemá dátum → preskočiť
        if (!date) return;

        // Víkend preskočiť (1–5 = pondelok–piatok)
        const day = date.getDay();
        if (day < 1 || day > 5) return;

        const dishes = article.querySelectorAll(".divide-y > div");

        dishes.forEach(dish => {

            const price = parsePrice(getText(dish, ".shrink-0"));

            // Predvolené hodnoty, cyklus cez span ich prepíše
            let type = "main";
            let weight = null;
            let allergens = [];

            // Rozhoduje obsah span, nie ich poradie
            dish.querySelectorAll("span").forEach(span => {
                const text = cleanText(span);

                if (text.startsWith("Alergény")) {
                    allergens = parseAllergens(text);
                } else if (text === "Polievka") {
                    type = "soup";
                } else if (/^\d+(?:,\d+)?\s*(g|l)$/i.test(text)) {
                    // Celý text je hmotnosť, napr. "130g" alebo "0,3 l"
                    weight = text;
                }
            });

            const nameEl = dish.querySelector(".flex-1 > div");
            if (!nameEl) return;

            // Názov je voľný text vedľa span (poradie, hmotnosť),
            // preto berieme iba textové uzly
            const name = Array.from(nameEl.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

            if (!name) return;

            items.push({
                day: day,
                date: toISODate(date),
                type: type,
                name: name,
                price: price,
                priceStudent: null,
                weight: weight,
                allergens: allergens
            });
        });
    });

    if (items.length === 0) {
        throw new Error("Hospoda: nepodarilo sa nájsť žiadne jedlá – stránka mohla zmeniť štruktúru.");
    }

    return items;
}

// ---------------------------------------------------------------------
// Družba catering
// Každý deň je div.heading-title s h2 a hneď za ním tabuľka.
// Riadok tabuľky = jedno jedlo, prvá bunka názov, druhá cena.
// ---------------------------------------------------------------------
function parseDruzba(doc) {
    const items = [];
    const headings = doc.querySelectorAll(".heading-title");

    headings.forEach(heading => {

        const date = parseDate(getText(heading, "h2"));

        if (!date) return;

        const day = date.getDay();
        if (day < 1 || day > 5) return;

        // Tabuľka je nasledujúci súrodenec nadpisu
        const table = heading.nextElementSibling;
        if (!table || table.tagName !== "TABLE") return;

        table.querySelectorAll("tr").forEach(row => {

            // Hlavička s th nemá td → preskočiť
            const cells = row.querySelectorAll("td");
            if (cells.length !== 2) return;

            // Prázdne riadky a hlavička zapísaná v td → preskočiť
            const nameText = cleanText(cells[0]);
            if (!nameText || nameText.includes("Názov")) return;

            // Text sa postupne „obkrajuje“
            let text = nameText;
            const type = text.startsWith("Polievka") ? "soup" : "main";

            // Alergény: zátvorka na konci, iba čísla, čiarky a medzery
            // (zátvorky ako "(s lečom)" v názve sa nezachytia)
            let allergens = [];
            const allergenRegex = /\(([\d,\s]+)\)\s*$/;
            const allergenMatch = text.match(allergenRegex);

            if (allergenMatch) {
                allergens = parseAllergens(allergenMatch[1]);
                text = text.replace(allergenRegex, "").trim();
            }

            // Odstránenie poradia "I.", "II.", "III."
            text = text.replace(/^[IVX]+\.\s*/, "");
            let weight = null;
            let name = text;

            if (type === "soup") {
                // "Polievka 0,33l: Rascová s vajíčkom" – hmotnosť pred dvojbodkou, názov za ňou
                const colonIndex = text.indexOf(":");

                if (colonIndex !== -1) {
                    const beforeColon = text.slice(0, colonIndex);
                    const weightMatch = beforeColon.match(/\d+(?:,\d+)?\s*l/);
                    if (weightMatch) weight = weightMatch[0];

                    name = text.slice(colonIndex + 1).trim();
                }
            } else {
                // "150g Gurmánske soté, 200g Ryža" – všetky hmotnosti, z názvu sa odstránia
                const weights = text.match(/\d+g/g);

                if (weights) {
                    weight = weights.join(", ");
                    name = text.replace(/\d+g\s*/g, "").trim();
                }
            }

            // Medzera pred čiarkou zo zdrojovej stránky
            name = name.replace(/\s+,/g, ",");

            //console.log(type, "|", name, "|", weight, "|", allergens);

            // "Isic 4,70€/7,10€" → študentská a bežná cena; "v cene menu" → null
            const priceText = cleanText(cells[1]);
            const priceParts = priceText.split("/");

            let price = null;
            let priceStudent = null;

            if (priceParts.length === 2) {
                priceStudent = parsePrice(priceParts[0]);
                price = parsePrice(priceParts[1]);
            } else {
                price = parsePrice(priceText);
            }

            items.push({
                day: day,
                date: toISODate(date),
                type: type,
                name: name,
                price: price,
                priceStudent: priceStudent,
                weight: weight,
                allergens: allergens
            });
        });
    });

    if (items.length === 0) {
        throw new Error("Družba: nepodarilo sa nájsť žiadne jedlá – stránka mohla zmeniť štruktúru.");
    }
    return items;
}

// ---------------------------------------------------------------------
// FiitFood (stránka freefood.sk obsahuje viac prevádzok)
// Deň je li v #fiit-food .daily-offer, jedlá sú li v .day-offer.
// Názov, hmotnosť a alergény sú v jednom texte: "Názov 300g A:1,3,7 (V)".
// ---------------------------------------------------------------------
function parseFiitFood(doc) {
    const items = [];
    // Iba sekcia FiitFood, iba priami potomkovia (dni, nie jedlá)
    const days = doc.querySelectorAll("#fiit-food .daily-offer > li");

    days.forEach(dayLi => {
        const date = parseDate(getText(dayLi, ".day-title"));
        if (!date) return;

        const day = date.getDay();
        if (day < 1 || day > 5) return;

        const foods = dayLi.querySelectorAll(".day-offer > li");

        foods.forEach(food => {

            // Prvý .brand je poradie: "P." = polievka, "1." atď. = hlavné jedlo
            const label = getText(food, ".brand") || "";
            const type = label.startsWith("P") ? "soup" : "main";

            const price = parsePrice(getText(food, ".price"));

            // Iba textové uzly li (bez span s poradím a cenou)
            let text = Array.from(food.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

            // Časti sa odstraňujú od konca: (V) → alergény → hmotnosť
            // 1. značka vegetariánskeho jedla
            text = text.replace(/\s*\(V\)\s*$/, "");

            // 2. alergény "A:1,3,7" (aj prázdne "A:", preto * namiesto +)
            let allergens = [];
            const allergenRegex = /\s*A:\s*([\d,]*)\s*$/;
            const allergenMatch = text.match(allergenRegex);

            if (allergenMatch) {
                allergens = parseAllergens(allergenMatch[1]);
                text = text.replace(allergenRegex, "");
            }

            // 3. hmotnosť "0,3l" alebo "120g,150g,50g"
            //    (jedna hmotnosť + ľubovoľný počet ďalších oddelených čiarkou)
            let weight = null;
            const weightRegex = /\s(\d+(?:,\d+)?[gl](?:,\d+(?:,\d+)?[gl])*)$/;
            const weightMatch = text.match(weightRegex);

            if (weightMatch) {
                weight = weightMatch[1];
                text = text.replace(weightRegex, "");
            }

            // Čo ostalo, je názov
            const name = text.trim();
            if (!name) return;

            items.push({
                day: day,
                date: toISODate(date),
                type: type,
                name: name,
                price: price,
                priceStudent: null,
                weight: weight,
                allergens: allergens
            });
        });
    });

    if (items.length === 0) {
        throw new Error("FiitFood: nepodarilo sa nájsť žiadne jedlá – stránka mohla zmeniť štruktúru.");
    }

    return items;
}
