<script setup>
import { toasts, removeToast } from '../store/toastStore.js'
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast show align-items-center border-0"
      :class="toast.type === 'error' ? 'text-bg-danger' : 'text-bg-success'"
      role="alert"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toast.message }}</div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          aria-label="Zavrieť"
          @click="removeToast(toast.id)"
        ></button>
      </div>
    </div>
  </div>
</template>