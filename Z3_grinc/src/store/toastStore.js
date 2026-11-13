import { reactive } from 'vue'

// Zoznam práve zobrazených oznámení
export const toasts = reactive([])

let nextId = 1

// Zobrazí oznámenie a po 4 sekundách ho samo odstráni
export function showToast(message, type = 'success') {
  const id = nextId++
  toasts.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}

export function removeToast(id) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) toasts.splice(index, 1)
}