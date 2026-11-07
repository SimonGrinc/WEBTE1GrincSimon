const meals = [
  { id: 1, name: 'Paradajková polievka', type: 'soup', price: 2.5 },
  { id: 2, name: 'Kurací rezeň', type: 'main', price: 6.9 },
  { id: 3, name: 'Zeleninové rizoto', type: 'main', price: 5.2 },
  { id: 4, name: 'Cesnaková polievka', type: 'soup', price: 2.8 }
];
const results = document.querySelector('#results');
const button = document.querySelector('button');

function renderMeals(meals) {
  // TODO: Vyčisti výsledky, ošetri prázdne pole, vytvor články a pripoj ich.
  // TODO: Text vkladaj cez textContent, polievkam daj triedu soup.
  results.innerHTML = '';
  if(meals.length === 0){
    results.innerHTML = "Nic tu neni zamn :(";
  }
  meals.forEach(meal => {
    const article = document.createElement("article");
    if(meal.type === 'soup'){
      article.className = 'soup';
    }
    else if(meal.type === 'main'){
      article.className = 'main';
    }
    else{
      console.log("Zle fujky fuj");
    }
    article.innerHTML =  `<span class="meal-name">${meal.name}
                          <span class = "meal-type">${meal.type}</span></span>
                          <span class = "meal-price">${meal.price}€</span>`;
    results.appendChild(article);
  })
}

// TODO: Pripoj tlačidlo. Over aj opakované vykreslenie a názov <b>Test</b>.
button.addEventListener("click", () => renderMeals(meals));