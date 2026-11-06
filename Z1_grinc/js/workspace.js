// =========================================================
// workspace.js – interaktívne body (hotspoty) na fotke
// pracovného stola (workspace.html)
// =========================================================

// Zoznam bodov: pozícia v percentách od horného (top) a ľavého
// (left) okraja obrázka, nadpis a popis. Percentá zabezpečia,
// že body sedia na správnom mieste pri akejkoľvek veľkosti obrázka.
const hotspots = [
    {top: 20, left: 62, title:"Monitor", text:"Tu píšem kód C# v Jetbrains Rider. Monitor: Lenovo Legion Y25"},
    {top: 20, left: 30, title:"Monitor 2", text:"Acer EK251Q/6bi"},
    {top: 45, left: 66, title:"Myš", text:"Logitech G305"},
    {top: 60, left: 55, title:"Klávesnica", text:"8Bitdo Mechanical keyboard C64 edition"},
    {top: 85, left: 65, title:"Počítač", text:"AMD Ryzen 7 5800XT, Intel Arc B580, 32GB RAM"}
]

// Kontajner s obrázkom, do ktorého body vkladáme.
const workspace = document.querySelector(".workspace");

for (let i = 0; i < hotspots.length; i++) {
    const spot = hotspots[i];

    // Každý bod je <button> – dá sa zamerať klávesnicou (Tab)
    // a na mobile aktivovať ťuknutím.
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hotspot";
    // Prístupný názov pre čítačky obrazovky.
    button.setAttribute("aria-label", spot.title);
    // Pozícia sa odovzdá do CSS cez vlastné premenné --top a --left
    // (používajú ich .hotspot-dot a .hotspot-panel v styles.css).
    button.style.setProperty("--top", spot.top + "%");
    button.style.setProperty("--left", spot.left + "%");

    // Vnútro tlačidla: viditeľná bodka a popisný panel,
    // ktorý sa zobrazí pri hover/focus (riešené v CSS).
    // Pozn.: innerHTML je tu v poriadku, lebo texty sú pevne
    // v kóde – pre vstup od používateľa by bolo bezpečnejšie textContent.
    button.innerHTML = `
        <span class="hotspot-dot"></span>
        <span class="hotspot-panel">
            <strong>${spot.title}</strong>
            <span>${spot.text}</span>
        </span>
    `;

    workspace.appendChild(button);
}
