<script setup>
import { state } from '../store/todoStore.js'

// Aktuálna sekcia príde od rodiča (App.vue)
defineProps({
  view: String,
})

const emit = defineEmits(['change-view', 'logout'])

const tabs = [
  { value: 'calendar', label: 'Kalendár' },
  { value: 'list', label: 'Zoznam úloh' },
  { value: 'about', label: 'O projekte' },
]
</script>

<template>
  <header class="bg-primary text-white">
    <div class="container py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
      <h1 class="h4 mb-0">Môj TODO List</h1>

      <div v-if="state.studentName" class="d-flex align-items-center gap-2">
        <span>Prihlásený: <strong>{{ state.studentName }}</strong></span>
        <button class="btn btn-light btn-sm" @click="emit('logout')">Zmeniť používateľa</button>
      </div>
    </div>

    <nav class="container pb-3" aria-label="Hlavná navigácia">
      <div class="d-flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="btn btn-sm"
          :class="view === tab.value ? 'btn-light' : 'btn-outline-light'"
          @click="emit('change-view', tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </nav>
  </header>
</template>