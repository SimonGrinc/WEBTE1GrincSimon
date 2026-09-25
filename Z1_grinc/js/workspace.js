const hotspots = [
    {top: 20, left: 62, title:"Monitor", text:"Tu píšem kôd v Jetbrains Rider. Monitor: Lenovo Legion Y25"},
    {top: 20, left: 30, title:"Monitor 2", text:"Acer EK251Q/6bi"},
    {top: 45, left: 66, title:"Myš", text:"Logitech G305"},
    {top: 60, left: 55, title:"Klávesnica", text:"8Bitdo Mechanical keyboard C64 edition"},
    {top: 85, left: 65, title:"Počítač", text:"AMD Ryzen 7 5800XT, Intel Arc B580, 32GB RAM"}
]

const workspace = document.querySelector(".workspace");

for (let i = 0; i < hotspots.length; i++) {
    const spot = hotspots[i];
    
    const button = document.createElement("button");
    button.setAttribute("aria-label", spot.title);
    button.className = "hotspot";
    button.style.top = spot.top + "%";
    button.style.left = spot.left + "%";
    
    button.innerHTML = `
        <span class="hotspot-dot"></span>
        <span class="hotspot-panel">
            <strong>${spot.title}</strong>
            <p>${spot.text}</p>
        </span>
    `;
    
    // priday button do .workspace
    workspace.appendChild(button);
}