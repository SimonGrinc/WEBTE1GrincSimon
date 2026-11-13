<script setup>
import { ref } from 'vue'
import { state, loadTodos } from '../store/todoStore.js'

const name = ref('')    // text v políčku
const error = ref('')   // chyba pod políčkom

function submit() {
  const value = name.value.trim()
  if (!value) {
    error.value = 'Zadaj svoj identifikátor.'
    return
  }
  error.value = ''
  state.studentName = value   // App.vue podľa toho prepne na zoznam
  loadTodos()
}
</script>

<template>
  <div class="card mx-auto mt-5" style="max-width: 400px">
    <div class="card-body">
      <h2 class="h4 mb-3">Prihlásenie</h2>
      <form @submit.prevent="submit">
        <label for="name" class="form-label">Identifikátor študenta</label>
        <input
          id="name"
          v-model="name"
          class="form-control"
          :class="{ 'is-invalid': error }"
        />
        <div class="invalid-feedback">{{ error }}</div>
        <button class="btn btn-primary w-100 mt-3">Pokračovať</button>
      </form>
    </div>
  </div>
</template>