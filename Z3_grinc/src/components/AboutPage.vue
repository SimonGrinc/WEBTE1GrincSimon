<template>
  <div class="card">
    <div class="card-body">
      <h2 class="h4">O projekte</h2>
      <p>
        <strong>Môj TODO List</strong> je webová aplikácia na správu osobných úloh, vytvorená ako zadanie č. 3
        z predmetu WEBTE1. Úlohy môžeš vytvárať, upravovať, označovať ako dokončené a odstraňovať. Zobrazujú sa
        v zozname aj v kalendári a oba používajú rovnaké dáta zo servera.
      </p>

      <h3 class="h5 mt-4">Funkcie</h3>
      <ul>
        <li>kalendár s mesačným, týždenným a denným zobrazením,</li>
        <li>vytvorenie úlohy kliknutím na deň alebo označením časového úseku,</li>
        <li>zoznam úloh s filtrom podľa stavu, vyhľadávaním a zoradením,</li>
        <li>zvýraznenie dokončených úloh a úloh po termíne,</li>
        <li>obnovenie piatich ukážkových úloh.</li>
      </ul>

      <h3 class="h5 mt-4">Použité technológie</h3>
      <ul>
        <li>
          <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue.js 3</a>
          – framework na tvorbu používateľského rozhrania,
        </li>
        <li>
          <a href="https://getbootstrap.com/" target="_blank" rel="noopener">Bootstrap 5</a>
          – štýly a responzívny dizajn,
        </li>
        <li>
          <a href="https://fullcalendar.io/" target="_blank" rel="noopener">FullCalendar</a>
          – knižnica kalendára,
        </li>
        <li>
          <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a>
          – nástroj na vývoj a zostavenie aplikácie,
        </li>
        <li>Fetch API – komunikácia so serverom.</li>
      </ul>

      <h3 class="h5 mt-4">REST API</h3>
      <p class="mb-0">
        Úlohy sa ukladajú na serveri cez
        <a href="https://wt1zadanie.iolab.sk/docs" target="_blank" rel="noopener">REST API</a>.
      </p>
    </div>
  </div>
</template>