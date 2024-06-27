<template>
  <div class="modal-wrapper" v-if="isVisible" @click.self="closeModal">
    <div class="modal-body card">
      <div class="modal-header">
        <h2 class="heading fw-bold">{{ header }}</h2>
        <button @click="closeModal" class="close" aria-label="close this modal">
          <svg viewBox="0 0 24 24" class="text-dark">
            <path
              d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
            />
          </svg>
        </button>
      </div>
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

  <script setup>
/*eslint-disable*/
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  header: {
    type: String,
    default: "Modal Header",
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => {
  emit("update:isVisible", false);
  emit('close');
};
</script>

  <style >
.modal-header {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-style: normal;
  /* font-family: "Bubblegum Sans", sans-serif; */
}

.close {
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  height: 16px;
  text-decoration: none;
  color: #fff;
  width: 16px;
}

.close svg {
  width: 16px;
}

.modal-wrapper {
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 9999; /* Ensure this is higher than other elements */

}

.modal-body {
  max-width: 500px;
  opacity: 1;
  transform: translateY(1);
  background: #171b26 !important;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  width: 100%;
  z-index: 10000; /* Ensure this is higher than other elements */
  border-radius: 8px;
  padding: 30px;
}
</style>
