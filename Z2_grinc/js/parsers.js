function parsePrice(text){
    if (!text) return null;
    const match = text.match(/\d+(?:[.,]\d+)?/);
    if (!match) return null;
    return parseFloat(match[0].replace(",", "."));
}

function parseAllergens(text){
    if(!text) return [];
    const numbers = text.match(/\d+/g);
    return numbers || [];
}

function parseDate(text){
    if(!text) return null;
    const match = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function getText(parent,selector){
    const el = parent.querySelector(selector);
    if(!el) return null;
    return el.textContent.replace(/\s+/g, " ").trim();
}

function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
            // Price
            const price = parsePrice(getText(dish, ".shrink-0"));

            // Type, weight and allergens from spans
            let type = "main";
            let weight = null;
            let allergens = [];

            dish.querySelectorAll("span").forEach(span => {
                const text = span.textContent.replace(/\s+/g, " ").trim();

                if (text.startsWith("Alergény")) {
                    allergens = parseAllergens(text);
                } else if (text === "Polievka") {
                    type = "soup";
                } else if (/^\d+(?:,\d+)?\s*(g|l)$/i.test(text)) {
                    weight = text;
                }
            });

            // Name = only text nodes of the first div (without spans)
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