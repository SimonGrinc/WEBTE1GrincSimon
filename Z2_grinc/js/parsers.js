function parsePrice(text) {
    if (!text) return null;
    const match = text.match(/\d+(?:[.,]\d+)?/);
    if (!match) return null;
    return parseFloat(match[0].replace(",", "."));
}

function parseAllergens(text) {
    if (!text) return [];
    const numbers = text.match(/\d+/g);
    return numbers || [];
}

function parseDate(text) {
    if (!text) return null;
    const match = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function getText(parent, selector) {
    const el = parent.querySelector(selector);
    if (!el) return null;
    return cleanText(el);
}

function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function cleanText(el) {
    return el.textContent.replace(/\s+/g, " ").trim();
}

function parseHospoda(doc) {
    const items = [];
    const days = doc.querySelectorAll("#menu article");

    days.forEach(article => {
        const date = parseDate(getText(article, ":scope > div"));
        if (!date) return;

        const day = date.getDay();
        if (day < 1 || day > 5) return;

        const dishes = article.querySelectorAll(".divide-y > div");

        dishes.forEach(dish => {

            const price = parsePrice(getText(dish, ".shrink-0"));

            let type = "main";
            let weight = null;
            let allergens = [];

            dish.querySelectorAll("span").forEach(span => {
                const text = cleanText(span);

                if (text.startsWith("Alergény")) {
                    allergens = parseAllergens(text);
                } else if (text === "Polievka") {
                    type = "soup";
                } else if (/^\d+(?:,\d+)?\s*(g|l)$/i.test(text)) {
                    weight = text;
                }
            });

            const nameEl = dish.querySelector(".flex-1 > div");
            if (!nameEl) return;

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

function parseDruzba(doc) {
    const items = [];
    const headings = doc.querySelectorAll(".heading-title");

    headings.forEach(heading => {

        const date = parseDate(getText(heading, "h2"));

        if (!date) return;

        const day = date.getDay();
        if (day < 1 || day > 5) return;

        const table = heading.nextElementSibling;
        if (!table || table.tagName !== "TABLE") return;

        table.querySelectorAll("tr").forEach(row => {

            const cells = row.querySelectorAll("td");
            if (cells.length !== 2) return;

            const nameText = cleanText(cells[0]);
            if (!nameText || nameText.includes("Názov")) return;

            let text = nameText;
            const type = text.startsWith("Polievka") ? "soup" : "main";

            let allergens = [];
            const allergenRegex = /\(([\d,\s]+)\)\s*$/;
            const allergenMatch = text.match(allergenRegex);

            if (allergenMatch) {
                allergens = parseAllergens(allergenMatch[1]);
                text = text.replace(allergenRegex, "").trim();
            }

            text = text.replace(/^[IVX]+\.\s*/, "");
            let weight = null;
            let name = text;

            if (type === "soup") {
                const colonIndex = text.indexOf(":");

                if (colonIndex !== -1) {
                    const beforeColon = text.slice(0, colonIndex);
                    const weightMatch = beforeColon.match(/\d+(?:,\d+)?\s*l/);
                    if (weightMatch) weight = weightMatch[0];

                    name = text.slice(colonIndex + 1).trim();
                }
            } else {
                const weights = text.match(/\d+g/g);

                if (weights) {
                    weight = weights.join(", ");
                    name = text.replace(/\d+g\s*/g, "").trim();
                }
            }

            name = name.replace(/\s+,/g, ",");

            //console.log(type, "|", name, "|", weight, "|", allergens);
            
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

function parseFiitFood(doc) {
    const items = [];
    const days = doc.querySelectorAll("#fiit-food .daily-offer > li");

    days.forEach(dayLi => {
        const date = parseDate(getText(dayLi, ".day-title"));
        if (!date) return;

        const day = date.getDay();
        if (day < 1 || day > 5) return;

        const foods = dayLi.querySelectorAll(".day-offer > li");

        foods.forEach(food => {
           
            const label = getText(food, ".brand") || "";
            const type = label.startsWith("P") ? "soup" : "main";

            const price = parsePrice(getText(food, ".price"));

            let text = Array.from(food.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

            text = text.replace(/\s*\(V\)\s*$/, "");

            let allergens = [];
            const allergenRegex = /\s*A:\s*([\d,]*)\s*$/;
            const allergenMatch = text.match(allergenRegex);

            if (allergenMatch) {
                allergens = parseAllergens(allergenMatch[1]);
                text = text.replace(allergenRegex, "");
            }

            let weight = null;
            const weightRegex = /\s(\d+(?:,\d+)?[gl](?:,\d+(?:,\d+)?[gl])*)$/;
            const weightMatch = text.match(weightRegex);

            if (weightMatch) {
                weight = weightMatch[1];
                text = text.replace(weightRegex, "");
            }

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