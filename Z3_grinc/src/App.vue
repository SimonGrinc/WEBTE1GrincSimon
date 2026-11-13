<script setup>
import { ref, computed } from 'vue'
import { state, resetTodos } from './store/todoStore.js'
import { showToast } from './store/toastStore.js'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import AboutPage from './components/AboutPage.vue'
import LoginForm from './components/LoginForm.vue'
import TodoList from './components/TodoList.vue'
import TodoForm from './components/TodoForm.vue'
import TodoCalendar from './components/TodoCalendar.vue'
import TodoDetail from './components/TodoDetail.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import ToastMessage from './components/ToastMessage.vue'

const view = ref('calendar')   // 'calendar' | 'list' | 'about'

// ----- Detail úlohy -----
const detailId = ref(null)     // id úlohy, ktorej detail je otvorený
const detailTodo = computed(() => state.todos.find((t) => t.id === detailId.value) ?? null)

// ----- Formulár -----
const showForm = ref(false)
const editedTodo = ref(null)   // null = nová úloha, inak úprava tejto úlohy
const formDates = ref(null)    // { start, end } z kalendára, alebo null

function openNewForm(dates = null) {
  editedTodo.value = null
  formDates.value = dates
  showForm.value = true
}

function openEditForm(todo) {
  detailId.value = null        // detail zavrieme, otvára sa formulár
  editedTodo.value = todo
  formDates.value = null
  showForm.value = true
}

// ----- Obnova ukážkových úloh -----
const showResetConfirm = ref(false)
const resetting = ref(false)

async function confirmReset() {
  showResetConfirm.value = false
  resetting.value = true
  try {
    await resetTodos()
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    resetting.value = false
  }
}

function logout() {
  detailId.value = null
  state.studentName = ''
  state.todos = []
}
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader :view="view" @change-view="view = $event" @logout="logout" />

    <main class="container py-4 flex-grow-1">
      <AboutPage v-if="view === 'about'" />

      <LoginForm v-else-if="!state.studentName" />

      <template v-else>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <button class="btn btn-primary btn-sm" @click="openNewForm()">+ Nová úloha</button>
          <button
            class="btn btn-outline-warning btn-sm"
            :disabled="resetting"
            @click="showResetConfirm = true"
          >
            {{ resetting ? 'Obnovujem…' : 'Obnoviť ukážkové úlohy' }}
          </button>
        </div>

        <TodoCalendar
          v-if="view === 'calendar'"
          @detail="detailId = $event"
          @create="openNewForm"
        />
        <TodoList v-else @edit="openEditForm" />
      </template>
    </main>

    <AppFooter />

    <TodoDetail
      v-if="detailTodo"
      :todo="detailTodo"
      @close="detailId = null"
      @edit="openEditForm"
    />

    <TodoForm
      v-if="showForm"
      :todo="editedTodo"
      :start="formDates?.start"
      :end="formDates?.end"
      @close="showForm = false"
    />

    <ConfirmDialog
      v-if="showResetConfirm"
      title="Obnoviť ukážkové úlohy"
      message="Všetky tvoje aktuálne úlohy sa nahradia piatimi ukážkovými. Naozaj chceš pokračovať?"
      confirm-text="Obnoviť"
      @confirm="confirmReset"
      @cancel="showResetConfirm = false"
    />

    <ToastMessage />
  </div>
</template>