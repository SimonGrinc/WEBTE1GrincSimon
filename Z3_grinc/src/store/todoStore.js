import { reactive } from 'vue'
import * as api from '../services/api.js'
import { showToast } from './toastStore.js'

// Všetky zdieľané dáta aplikácie na jednom mieste
export const state = reactive({
  studentName: '',   // identifikátor študenta
  todos: [],         // zoznam úloh zo servera
  loading: false,    // true, kým čakáme na server
  error: '',         // text chyby, ak nejaká nastala
})

// Načíta úlohy zo servera do state.todos (so spinnerom)
export async function loadTodos() {
  state.loading = true
  state.error = ''
  try {
    state.todos = await api.getTodos(state.studentName)
  } catch (error) {
    state.error = error.message
  } finally {
    state.loading = false
  }
}

// Znova načíta úlohy bez spinnera – zoznam ostane na obrazovke
export async function refreshTodos() {
  try {
    state.todos = await api.getTodos(state.studentName)
  } catch (error) {
    state.error = error.message
  }
}

// Chyby v týchto funkciách zámerne NEzachytávame – zachytí ich komponent, ktorý ich volal.

export async function addTodo(todo) {
  await api.createTodo(state.studentName, todo)
  await refreshTodos()
  showToast('Úloha bola vytvorená.')
}

export async function editTodo(id, todo) {
  await api.updateTodo(state.studentName, id, todo)
  await refreshTodos()
  showToast('Úloha bola uložená.')
}

export async function removeTodo(id) {
  await api.deleteTodo(state.studentName, id)
  await refreshTodos()
  showToast('Úloha bola odstránená.')
}

// Označí úlohu ako dokončenú (true) alebo ju znovu otvorí (false)
export async function setFinished(id, finished) {
  if (finished) {
    await api.markDone(state.studentName, id)
  } else {
    await api.markUndone(state.studentName, id)
  }
  await refreshTodos()
  showToast(finished ? 'Úloha bola označená ako dokončená.' : 'Úloha bola znovu otvorená.')
}

// Nahradí všetky úlohy piatimi ukážkovými
export async function resetTodos() {
  await api.resetTodos(state.studentName)
  await refreshTodos()
  showToast('Ukážkové úlohy boli obnovené.')
}