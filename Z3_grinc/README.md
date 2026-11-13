# Môj TODO List

Webová aplikácia na správu osobných úloh so zoznamom a kalendárom. Zadanie č. 3 z predmetu WEBTE1.

**Autor:** [Meno Priezvisko]
**Nasadená aplikácia:** [odkaz na školský server]
**REST API:** https://wt1zadanie.iolab.sk (dokumentácia: https://wt1zadanie.iolab.sk/docs)

## Opis aplikácie

Po zadaní identifikátora študenta aplikácia načíta jeho úlohy zo servera. Úlohy je možné vytvárať, upravovať, odstraňovať a označovať ako dokončené. Zobrazujú sa v kalendári aj v zozname a oba používajú rovnaké dáta. Všetky údaje sa ukladajú na serveri cez REST API, v prehliadači sa neukladá nič.

### Funkcie
- kalendár s mesačným, týždenným a denným zobrazením (FullCalendar),
- klik na úlohu otvorí detail, klik na deň alebo označenie časového úseku vytvorí novú úlohu s predvyplneným časom,
- zoznam úloh s filtrom podľa stavu, vyhľadávaním podľa názvu a zoradením podľa začiatku alebo konca,
- zvýraznenie dokončených úloh a úloh po termíne,
- formulár s validáciou (názov povinný do 200 znakov, popis do 1000 znakov, začiatok nesmie byť po konci),
- potvrdenie pri odstránení a pri obnove ukážkových úloh,
- oznámenia o úspešných akciách a hlásenia o chybách (sieť, server, neplatné údaje),
- obnova piatich ukážkových úloh,
- responzívny dizajn pre počítač, tablet a mobil.

## Použité technológie

- [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Bootstrap 5](https://getbootstrap.com/) (štýly a responzívny dizajn)
- [FullCalendar 6](https://fullcalendar.io/) (kalendár)
- [Vite](https://vite.dev/) (vývojový server a build)
- Fetch API (komunikácia so serverom)

## Inštalácia a spustenie

Požiadavky: [Node.js](https://nodejs.org/) 20 alebo novší.

```bash
# inštalácia závislostí
npm install

# spustenie vývojového servera (http://localhost:5173)
npm run dev

# zostavenie produkčnej verzie do priečinka dist/
npm run build

# lokálny náhľad zostavenej verzie
npm run preview
```

Na server sa nahráva **obsah priečinka `dist/`**.

## Štruktúra projektu

```
├── index.html               vstupná stránka
├── public/favicon.svg       ikona stránky
├── dist/                    zostavená verzia na nasadenie
└── src/
    ├── main.js              spustenie aplikácie
    ├── App.vue              hlavný komponent
    ├── style.css            vlastné štýly
    ├── services/api.js      komunikácia s REST API
    ├── store/
    │   ├── todoStore.js     zdieľané dáta a operácie nad úlohami
    │   └── toastStore.js    oznámenia
    ├── utils/date.js        pomocné funkcie pre dátumy
    └── components/
        ├── AppHeader.vue, AppFooter.vue, AboutPage.vue
        ├── LoginForm.vue
        ├── TodoCalendar.vue, TodoList.vue, TodoItem.vue
        ├── TodoForm.vue, TodoDetail.vue
        └── ConfirmDialog.vue, ToastMessage.vue
```

## Poznámky k implementácii

- Komunikácia so serverom je oddelená od rozhrania v `src/services/api.js`.
- Zoznam aj kalendár čítajú úlohy z jedného zdieľaného stavu (`todoStore.js`), preto sú vždy zhodné.
- Dátumy sa na server posielajú v ISO 8601 (UTC) a používateľovi sa zobrazujú v lokálnom čase.
- Údaje zo servera sa zobrazujú ako text, nikdy ako HTML.

## Použitie AI

Pri vypracovaní zadania som použil AI nástroj Claude (Anthropic). Pomáhal mi vysvetľovať princípy Vue, navrhnúť štruktúru aplikácie a vytvoriť časti kódu.