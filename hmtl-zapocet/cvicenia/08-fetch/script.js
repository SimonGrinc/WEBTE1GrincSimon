const WEATHER_URL = './weather.json';
const button = document.querySelector('#load');
const output = document.querySelector('#weather');

async function loadWeather() {
  // TODO: Zobraz načítavanie a zablokuj tlačidlo.
 output.textContent = 'Načítavam…';
  button.disabled = true;

  try {
    const response = await fetch(WEATHER_URL);

    if (!response.ok) {
      throw new Error('Server vrátil chybu ' + response.status);
    }

    const data = await response.json();
    const temperature = data?.current?.temperature_2m;
    const wind = data?.current?.wind_speed_10m;

    if (!Number.isFinite(temperature) || !Number.isFinite(wind)) {
      throw new Error('Údaje o počasí majú zlý tvar');
    }

    output.textContent =
      `Teplota: ${temperature.toLocaleString('sk-SK')} °C, ` +
      `vietor: ${wind.toLocaleString('sk-SK')} km/h`;
  } catch (error) {
    console.error(error);
    if (error.name === 'AbortError') {
      output.textContent = 'Server neodpovedal včas. Skús to znova.';
    } else {
      output.textContent = 'Počasie sa nepodarilo načítať. Skús to znova.';
    }
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
  }
  // TODO: Over obe číselné hodnoty, zobraz výsledok alebo chybu.
  // TODO: Pri každom výsledku odblokuj tlačidlo.
  // BONUS: Pridaj timeout cez AbortController.
}

// TODO: Pripoj udalosť tlačidla.
button.addEventListener("click", ()=>loadWeather());