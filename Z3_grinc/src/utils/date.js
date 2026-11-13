// Prevedie dátum zo servera na text v lokálnom čase, napr. "12. 11. 2026, 16:26"
export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('sk-SK', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const pad = (n) => String(n).padStart(2, '0')

// Date -> text pre <input type="datetime-local"> v lokálnom čase
export function toInputValue(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}
