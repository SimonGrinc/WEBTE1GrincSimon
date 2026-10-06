const menuButton = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Otvoriť menu" : "Zavrieť menu");
    navLinks.classList.toggle("is-open", !isOpen);
  });
}