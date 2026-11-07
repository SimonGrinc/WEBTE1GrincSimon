const button = document.querySelector('#menu-toggle');
const menu = document.querySelector('#menu');

function toggleMenu() {
  // TODO: Zisti aktuálny stav a zmeň hidden aj aria-expanded.
  const isOpen = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!isOpen));
  menu.hidden = isOpen;
}

function handleKeydown(event) {
  // TODO: Pri Escape zatvor menu a vráť fokus.
  if(event.key === "Escape"){
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.focus();
  }
}

// TODO: Pripoj click na tlačidlo a keydown na navigáciu.

button.addEventListener("click", toggleMenu);
menu.addEventListener("keydown", handleKeydown);