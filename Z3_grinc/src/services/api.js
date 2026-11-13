// src/services/api.js
// Všetka komunikácia so serverom je v tomto súbore.

const BASE_URL = 'https://wt1zadanie.iolab.sk/api'

// Text chyby podľa HTTP kódu, ktorý vrátil server
function getErrorMessage(status) {
  if (status === 404) return 'Úloha sa nenašla.'
  if (status === 422) return 'Server odmietol údaje – skontroluj vyplnené polia.'
  if (status >= 500) return 'Chyba na serveri. Skús to neskôr.'
  return `Požiadavka zlyhala (chyba ${status}).`
}

// Spoločná funkcia pre všetky požiadavky
async function request(method, path, body) {
  const options = { method: method, headers: {} }

  // Ak posielame dáta (POST, PUT), prevedieme ich na JSON
  if (body) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(BASE_URL + path, options)
  } catch (error) {
    // Server vôbec neodpovedal (nie je internet a pod.)
    throw new Error('Nepodarilo sa spojiť so serverom. Skontroluj pripojenie.')
  }

  // Server odpovedal, ale s chybou (404, 422, 500...)
  if (!response.ok) {
    throw new Error(getErrorMessage(response.status))
  }

  // Niektoré odpovede (napr. DELETE) nemusia mať telo
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

// Meno študenta môže obsahovať špeciálne znaky, preto encodeURIComponent
function userPath(name) {
  return '/' + encodeURIComponent(name)
}

function todoPath(name, id) {
  return userPath(name) + '/' + id
}

// ---------- Funkcie pre jednotlivé endpointy ----------

// GET /api/{name} – všetky úlohy
// Server vracia objekt { id, name, created_at, todos: [...] }, my chceme iba pole úloh
export async function getTodos(name) {
  const data = await request('GET', userPath(name))
  return data.todos
}

// GET /api/{name}/{id} – detail jednej úlohy
export function getTodo(name, id) {
  return request('GET', todoPath(name, id))
}

// POST /api/{name} – nová úloha
export function createTodo(name, todo) {
  return request('POST', userPath(name), todo)
}

// PUT /api/{name}/{id} – úprava úlohy (posielajú sa všetky polia)
export function updateTodo(name, id, todo) {
  return request('PUT', todoPath(name, id), todo)
}

// DELETE /api/{name}/{id} – odstránenie úlohy
export function deleteTodo(name, id) {
  return request('DELETE', todoPath(name, id))
}

// PATCH /api/{name}/{id}/done – označiť ako dokončenú
export function markDone(name, id) {
  return request('PATCH', todoPath(name, id) + '/done')
}

// PATCH /api/{name}/{id}/undone – znovu otvoriť
export function markUndone(name, id) {
  return request('PATCH', todoPath(name, id) + '/undone')
}

// POST /api/{name}/reset – obnoviť 5 ukážkových úloh
export function resetTodos(name) {
  return request('POST', userPath(name) + '/reset')
}