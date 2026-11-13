<script setup>
import { ref, reactive } from 'vue'
import { addTodo, editTodo } from '../store/todoStore.js'
import { toInputValue } from '../utils/date.js'

// Úloha, ktorú upravujeme (ak nie je zadaná, ide o novú úlohu)
const props = defineProps({
  todo: { type: Object, default: null },
  start: { type: Date, default: null },   // predvyplnený začiatok (z kalendára)
  end: { type: Date, default: null },     // predvyplnený koniec (z kalendára)
})
// Komponent vie rodičovi povedať, že sa má zavrieť
const emit = defineEmits(['close'])

const isEdit = props.todo !== null

// Hodnoty políčok: pri úprave z úlohy, pri novej úlohe z aktuálneho času
const now = new Date()
const startDate = props.start ?? now
const endDate = props.end ?? new Date(startDate.getTime() + 60 * 60 * 1000)

const title = ref(isEdit ? props.todo.title : '')
const description = ref(isEdit ? props.todo.description : '')
const dateFrom = ref(toInputValue(isEdit ? new Date(props.todo.date_from) : startDate))
const dateTo = ref(toInputValue(isEdit ? new Date(props.todo.date_to) : endDate))
const isFinished = ref(isEdit ? props.todo.is_finished : false)

// Chyby pri jednotlivých poliach (prázdny text = bez chyby)
const errors = reactive({ title: '', description: '', dateFrom: '', dateTo: '' })
const serverError = ref('')   // chyba zo servera
const saving = ref(false)     // true, kým sa úloha ukladá

// Skontroluje polia, vráti true ak je všetko v poriadku
function validate() {
  errors.title = ''
  errors.description = ''
  errors.dateFrom = ''
  errors.dateTo = ''

  const cleanTitle = title.value.trim()
  if (!cleanTitle) errors.title = 'Názov je povinný.'
  else if (cleanTitle.length > 200) errors.title = 'Názov môže mať najviac 200 znakov.'

  if (description.value.trim().length > 1000) {
    errors.description = 'Popis môže mať najviac 1000 znakov.'
  }

  if (!dateFrom.value) errors.dateFrom = 'Zadaj dátum aj čas začiatku.'
  if (!dateTo.value) errors.dateTo = 'Zadaj dátum aj čas konca.'

  if (dateFrom.value && dateTo.value && new Date(dateFrom.value) > new Date(dateTo.value)) {
    errors.dateTo = 'Koniec nemôže byť skôr ako začiatok.'
  }

  return !errors.title && !errors.description && !errors.dateFrom && !errors.dateTo
}

async function submit() {
  if (saving.value) return        // ochrana proti dvojitému odoslaniu
  serverError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    const data = {
      title: title.value.trim(),
      description: description.value.trim(),
      date_from: new Date(dateFrom.value).toISOString(),
      date_to: new Date(dateTo.value).toISOString(),
      is_finished: isFinished.value,
    }

    if (isEdit) {
      await editTodo(props.todo.id, data)
    } else {
      await addTodo(data)
    }
    emit('close')                  // úspech -> zavrieme formulár
  } catch (error) {
    serverError.value = error.message   // chyba -> formulár ostane otvorený
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="modal d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog">
      <form class="modal-content" novalidate @submit.prevent="submit">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? 'Upraviť úlohu' : 'Nová úloha' }}</h5>
          <button type="button" class="btn-close" aria-label="Zavrieť" @click="emit('close')"></button>
        </div>

        <div class="modal-body">
          <div v-if="serverError" class="alert alert-danger">{{ serverError }}</div>

          <div class="mb-3">
            <label for="title" class="form-label">Názov *</label>
            <input id="title" v-model="title" class="form-control" :class="{ 'is-invalid': errors.title }" />
            <div class="invalid-feedback">{{ errors.title }}</div>
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Popis</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              class="form-control"
              :class="{ 'is-invalid': errors.description }"
            ></textarea>
            <div class="invalid-feedback">{{ errors.description }}</div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="dateFrom" class="form-label">Začiatok *</label>
              <input
                id="dateFrom"
                v-model="dateFrom"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.dateFrom }"
              />
              <div class="invalid-feedback">{{ errors.dateFrom }}</div>
            </div>
            <div class="col-md-6 mb-3">
              <label for="dateTo" class="form-label">Koniec *</label>
              <input
                id="dateTo"
                v-model="dateTo"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.dateTo }"
              />
              <div class="invalid-feedback">{{ errors.dateTo }}</div>
            </div>
          </div>

          <!-- Stav úlohy sa dá meniť len pri úprave -->
          <div v-if="isEdit" class="form-check">
            <input id="finished" v-model="isFinished" type="checkbox" class="form-check-input" />
            <label for="finished" class="form-check-label">Úloha je dokončená</label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="emit('close')">Zrušiť</button>
          <button class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Ukladám…' : isEdit ? 'Uložiť zmeny' : 'Vytvoriť úlohu' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>