const sourceHtml = `
<section data-day="1">
  <h2>Pondelok 9. 11. 2026</h2>
  <table>
    <tr><th>Názov</th><th>Cena</th></tr>
    <tr><td>  Paradajková   polievka </td><td>2,50 €</td></tr>
    <tr><td>Kurací rezeň</td><td>6,90 €</td></tr>
    <tr><td></td><td>3,00 €</td></tr>
  </table>
</section>`;

const output = document.querySelector("#output");

function cleanText(value) { /* TODO: Zjednoť medzery a orež okraje. */ 
  return value.textContent.replace(/\s+/g, " ").trim();
}
function parseDate(text) { /* TODO: Vráť YYYY-MM-DD alebo null. */ 
  if (!text) return null;
    const match = text.split(" ");
    return `${match[3]}-${Number(match[2])}-${Number(match[1])}`;
}

function parseMenu(html) {
  // TODO: Vytvor oddelený dokument, vyber sekciu, dátum a platné riadky.
  const doc = new DOMParser().parseFromString(html,"text/html");
  const section = doc.querySelector("section");

  if(section == null){
    return null;
  }

  const dayWeek = Number(section.dataset.day);
  const heading = section.querySelector("h2");
  const headingClean = parseDate(heading?.textContent);
  const menuItems = section.querySelectorAll("tr");
  const items = [];

  for(let i = 0; i<menuItems.length;i++){
    const currItem = menuItems[i];
    if(currItem.firstChild.textContent == "Názov"){
      continue;
    }
    const innerTd = currItem.querySelectorAll("td");
    const itemName = cleanText(innerTd[0]);
    const itemPrice = cleanText(innerTd[1]);

    if(itemPrice == '' || itemName == ''){
      continue;
    }

    items.push({name: itemName, price:itemPrice});
  }

  // TODO: Vráť objekt day/date/items alebo null pri chýbajúcej sekcii.
  return { day: dayWeek, date: headingClean, items: items };
}

// TODO: Pripoj tlačidlo a výsledok zobraz ako JSON text do #output.
document.querySelector("button").addEventListener("click", () => {
  const result = parseMenu(sourceHtml);
  output.textContent = JSON.stringify(result, null, 2);
});