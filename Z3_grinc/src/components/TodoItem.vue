<script setup>
import { ref } from 'vue'
import { formatDateTime } from '../utils/date.js'
import { removeTodo, setFinished } from '../store/todoStore.js'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps({
  todo: Object,
})

const emit = defineEmits(['edit'])

const busy = ref(false)           // true, kým server vybavuje akciu
const error = ref('')             // chyba pri tejto úlohe
const showConfirm = ref(false)    // je potvrdzovacie okno otvorené?

// Spoločný postup pre akcie: zablokuj tlačidlá, spusti akciu, zachyť chybu
async function run(action) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await action()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

function toggleDone() {
  run(() => setFinished(props.todo.id, !props.todo.is_finished))
}

// Zavolá sa až po potvrdení v okne
function remove() {
  showConfirm.value = false
  run(() => removeTodo(props.todo.id))
}
</script>

<template>
  <li class="list-group-item" :class="{ 'list-group-item-success': todo.is_finished }">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
      <div class="text-break">
        <strong :class="{ 'text-decoration-line-through': todo.is_finished }">
          {{ todo.title }}
        </strong>
        <span v-if="todo.is_finished" class="badge text-bg-success ms-2">Dokončená</span>
        <div>{{ todo.description }}</div>
        <small class="text-muted">
          {{ formatDateTime(todo.date_from) }} – {{ formatDateTime(todo.date_to) }}
        </small>
      </div>

      <div class="btn-group btn-group-sm flex-shrink-0">
        <button class="btn btn-outline-success" :disabled="busy" @click="toggleDone">
          {{ todo.is_finished ? 'Znovu otvoriť' : 'Dokončiť' }}
        </button>
        <button class="btn btn-outline-primary" :disabled="busy" @click="emit('edit', todo)">
          Upraviť
        </button>
        <button class="btn btn-outline-danger" :disabled="busy" @click="showConfirm = true">
          Odstrániť
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-2 mb-0 py-1">{{ error }}</div>

    <ConfirmDialog
      v-if="showConfirm"
      title="Odstrániť úlohu"
      :message="`Naozaj chceš odstrániť úlohu „${todo.title}“?`"
      confirm-text="Odstrániť"
      @confirm="remove"
      @cancel="showConfirm = false"
    />
  </li>
</template>