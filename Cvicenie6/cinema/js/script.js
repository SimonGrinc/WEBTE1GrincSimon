const SOURCE_URL = "source/kino-hviezda.html";

async function loadCinemaHtml() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Stránku kina sa nepodarilo načítať (HTTP ${response.status}).`);
  }
  return response.text();
}

loadCinemaHtml();

async function main() {
  const html = await loadCinemaHtml();
  console.log(html.length);
}

main();