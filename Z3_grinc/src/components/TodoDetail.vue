<script setup>
import { ref } from 'vue'
import { formatDateTime } from '../utils/date.js'
import { removeTodo, setFinished } from '../store/todoStore.js'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps({
  todo: Object,
})

const emit = defineEmits(['close', 'edit'])

const busy = ref(false)
const error = ref('')
const showConfirm = ref(false)

// Rovnaký postup ako v TodoItem: zablokuj tlačidlá, spusti akciu, zachyť chybu
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

function remove() {
  showConfirm.value = false
  run(() => removeTodo(props.todo.id))
}
</script>

<template>
  <div
    class="modal d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5)"
    @click.self="emit('close')"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ todo.title }}</h5>
          <button type="button" class="btn-close" aria-label="Zavrieť" @click="emit('close')"></button>
        </div>

        <div class="modal-body">
          <span class="badge mb-3" :class="todo.is_finished ? 'text-bg-success' : 'text-bg-primary'">
            {{ todo.is_finished ? 'Dokončená' : 'Nedokončená' }}
          </span>

          <p>{{ todo.description || 'Bez popisu.' }}</p>
          <p class="mb-1"><strong>Začiatok:</strong> {{ formatDateTime(todo.date_from) }}</p>
          <p class="mb-0"><strong>Koniec:</strong> {{ formatDateTime(todo.date_to) }}</p>

          <div v-if="error" class="alert alert-danger mt-3 mb-0">{{ error }}</div>
        </div>

        <div class="modal-footer justify-content-between">
          <button class="btn btn-outline-danger" :disabled="busy" @click="showConfirm = true">
            Odstrániť
          </button>
          <div>
            <button class="btn btn-outline-success me-2" :disabled="busy" @click="toggleDone">
              {{ todo.is_finished ? 'Znovu otvoriť' : 'Dokončiť' }}
            </button>
            <button class="btn btn-primary" :disabled="busy" @click="emit('edit', todo)">
              Upraviť
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ConfirmDialog
    v-if="showConfirm"
    title="Odstrániť úlohu"
    :message="`Naozaj chceš odstrániť úlohu „${todo.title}“?`"
    confirm-text="Odstrániť"
    @confirm="remove"
    @cancel="showConfirm = false"
  />
</template>