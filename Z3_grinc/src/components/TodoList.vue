<script setup>
import { ref, computed } from 'vue'
import { state } from '../store/todoStore.js'
import TodoItem from './TodoItem.vue'

// Správu o úprave posielame vyššie do App.vue
const emit = defineEmits(['edit'])

// Nastavenia filtra, hľadania a zoradenia
const filter = ref('all')            // 'all' | 'open' | 'done'
const search = ref('')               // hľadaný text
const sort = ref('date_from-asc')    // 'pole-smer'

const filters = [
  { value: 'all', label: 'Všetky' },
  { value: 'open', label: 'Nedokončené' },
  { value: 'done', label: 'Dokončené' },
]

// Odstráni diakritiku a veľké písmená, aby "ulo" našlo aj "Úloha"
function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Zoznam, ktorý sa naozaj zobrazí: prefiltrovaný a zoradený
const visibleTodos = computed(() => {
  const query = normalize(search.value.trim())

  // 1. filter podľa stavu a hľadanie v názve (filter() vytvorí novú kópiu poľa)
  const list = state.todos.filter((todo) => {
    if (filter.value === 'open' && todo.is_finished) return false
    if (filter.value === 'done' && !todo.is_finished) return false
    return normalize(todo.title).includes(query)
  })

  // 2. zoradenie podľa začiatku alebo konca
  const [field, direction] = sort.value.split('-')
  list.sort((a, b) => new Date(a[field]) - new Date(b[field]))
  if (direction === 'desc') list.reverse()

  return list
})
</script>

<template>
  <!-- Ovládanie zoznamu (zobrazí sa, keď existujú nejaké úlohy) -->
  <div v-if="state.todos.length > 0" class="d-flex flex-wrap gap-2 mb-3">
    <div class="btn-group" role="group" aria-label="Filter podľa stavu">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        class="btn btn-outline-primary"
        :class="{ active: filter === f.value }"
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <input
      v-model="search"
      type="search"
      class="form-control w-auto flex-grow-1"
      placeholder="Hľadať podľa názvu…"
      aria-label="Hľadať podľa názvu"
    />

    <select v-model="sort" class="form-select w-auto" aria-label="Zoradiť úlohy">
      <option value="date_from-asc">Začiatok: od najskoršieho</option>
      <option value="date_from-desc">Začiatok: od najneskoršieho</option>
      <option value="date_to-asc">Koniec: od najskoršieho</option>
      <option value="date_to-desc">Koniec: od najneskoršieho</option>
    </select>
  </div>

  <div v-if="state.loading" class="text-center">
    <div class="spinner-border" role="status"></div>
    <p>Načítavam úlohy…</p>
  </div>

  <div v-else-if="state.error" class="alert alert-danger">
    {{ state.error }}
  </div>

  <div v-else-if="state.todos.length === 0" class="alert alert-info">
    Zatiaľ nemáš žiadne úlohy.
  </div>

  <div v-else-if="visibleTodos.length === 0" class="alert alert-warning">
    Žiadna úloha nevyhovuje filtru alebo hľadanému textu.
  </div>

  <template v-else>
    <p class="text-muted small mb-2">
      Zobrazených {{ visibleTodos.length }} z {{ state.todos.length }}
    </p>
    <ul class="list-group">
      <TodoItem
        v-for="todo in visibleTodos"
        :key="todo.id"
        :todo="todo"
        @edit="emit('edit', $event)"
      />
    </ul>
  </template>
</template>