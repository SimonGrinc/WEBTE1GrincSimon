<script setup>
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import skLocale from '@fullcalendar/core/locales/sk'
import { state } from '../store/todoStore.js'

// Kalendár vie rodičovi povedať: "otvor detail" a "vytvor úlohu"
const emit = defineEmits(['detail', 'create'])

// Farba udalosti podľa stavu úlohy
function colorFor(todo) {
  if (todo.is_finished) return '#198754'                        // zelená
  if (new Date(todo.date_to) < new Date()) return '#dc3545'     // červená (po termíne)
  return '#0d6efd'                                              // modrá
}

// Úlohy zo store -> udalosti kalendára
const events = computed(() =>
  state.todos.map((todo) => ({
    id: String(todo.id),
    title: todo.title,
    start: todo.date_from,
    end: todo.date_to,
    color: colorFor(todo),
  }))
)

// Klik na udalosť -> pošli rodičovi id úlohy
function onEventClick(info) {
  emit('detail', Number(info.event.id))
}

// Označenie dňa alebo časového úseku -> pošli rodičovi začiatok a koniec
function onSelect(info) {
  let start = info.start
  let end = info.end

  // V mesačnom zobrazení kalendár hlási celé dni (allDay). Nastavíme rozumný čas.
  if (info.allDay) {
    start = new Date(info.start)
    start.setHours(9, 0, 0, 0)               // 9:00 prvého dňa

    end = new Date(info.end)
    end.setDate(end.getDate() - 1)           // koniec výberu je "o deň ďalej", vrátime ho
    end.setHours(10, 0, 0, 0)                // 10:00 posledného dňa
  }

  info.view.calendar.unselect()              // zruší modré označenie v kalendári
  emit('create', { start, end })
}

// Úzka obrazovka (mobil)? Zistíme raz pri načítaní stránky
const isMobile = window.innerWidth < 576

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: skLocale,
  firstDay: 1,
    headerToolbar: isMobile
    ? { left: 'prev,next', center: 'title', right: 'today' }
    : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
  footerToolbar: isMobile
    ? { center: 'dayGridMonth,timeGridWeek,timeGridDay' }
    : false,
  dayMaxEvents: true,     // ak je v dni veľa úloh, ukáže "+ ďalšie"
  events: events.value,
  height: 'auto',
  selectable: true,          // dá sa označiť deň alebo časový úsek
  eventClick: onEventClick,
  select: onSelect,
}))
</script>

<template>
  <div v-if="state.error" class="alert alert-danger">{{ state.error }}</div>
  <p v-if="state.loading" class="text-muted">Načítavam úlohy…</p>

  <FullCalendar :options="calendarOptions" />
</template>