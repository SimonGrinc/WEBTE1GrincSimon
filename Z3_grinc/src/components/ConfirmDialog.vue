<script setup>
defineProps({
  title: { type: String, default: 'Potvrdenie' },
  message: String,
  confirmText: { type: String, default: 'Potvrdiť' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div
    class="modal d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5)"
    @click.self="emit('cancel')"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" aria-label="Zavrieť" @click="emit('cancel')"></button>
        </div>

        <div class="modal-body">
          <p class="mb-0">{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-secondary" @click="emit('cancel')">Zrušiť</button>
          <button class="btn btn-danger" @click="emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>