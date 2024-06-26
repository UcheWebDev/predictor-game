<template>
  <div class="marquee-container">
    <div class="marquee" :style="{ animationDuration: `${duration}s` }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { defineProps } from "vue";

const props = defineProps({
  duration: {
    type: Number,
    default: 15,
  },
  backgroundColor: {
    type: String,
    default: "#000",
  },
  padding: {
    type: String,
    default: "10px",
  },
});
</script>

<style scoped>
.marquee-container {
  overflow: hidden;
  white-space: nowrap;
}

.marquee {
  display: inline-block;
  padding-left: 100%;
  animation: marquee linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>