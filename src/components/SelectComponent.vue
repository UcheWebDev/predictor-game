<template>
  <div class="custom-select" ref="dropdownRef">
    <div class="select-selected" @click="toggleDropdown">
      <img
        v-if="selectedOption"
        :src="`../assets/images/chains/${selectedOption.img}`"
        alt=""
        class="icon"
      />
      <span>{{ selectedOption ? selectedOption.text : "Select Pair" }}</span>
      <span :class="{ 'select-arrow-active': isOpen }"></span>
    </div>
    <div v-if="isOpen" class="select-items">
      <div
        v-for="option in options"
        :key="option.value"
        :class="{ 'same-as-selected': option.value === selectedOption?.value }"
        @click="selectOption(option)"
      >
        <img
          :src="`../assets/images/chains/${option.img}`"
          alt=""
          class="icon"
        />
        {{ option.text }}
      </div>
    </div>
  </div>
</template>
  
  <script setup>
/* eslint-disable */
import { ref, defineEmits, defineProps, onMounted } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  defaultSelected: {
    type: Object,
    required: false,
    default: null,
  },
});

const emit = defineEmits(["update:selectedOption"]);

const isOpen = ref(false);
const selectedOption = ref(props.defaultSelected);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  selectedOption.value = option;
  isOpen.value = false;
  emit("update:selectedOption", selectedOption.value);
};

const closeDropdown = () => {
  isOpen.value = false;
};

const dropdownRef = ref(null);
onClickOutside(dropdownRef, closeDropdown);

onMounted(() => {
  if (props.defaultSelected) {
    selectedOption.value = props.defaultSelected;
  }
});
</script>
  
  <style>
.custom-select {
  position: relative;
  display: inline-block;
  width: 200px; /* Adjust the width as needed */
}

.select-selected {
  /* background-color: #f1f1f1; */
  color: #fff;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  /* border: 1px solid #ccc; */
  display: flex;
  align-items: center;
  width: 100%; /* Ensure it takes the full width */
}

.select-items {
  position: absolute;
  background-color: #000;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
  width: 100%;

  /* border: 1px solid #ccc; */
}

.select-items div,
.select-selected {
  color: #fff;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 100%; /* Ensure it takes the full width */
}

.select-items div:hover,
.same-as-selected {
  background-color: rgba(0, 0, 0, 0.1);
}

.icon {
  margin-right: 10px;
  width: 20px;
  height: 20px;
}

.select-selected:after {
  content: "";
  position: absolute;
  top: 14px;
  right: 10px;
  border: 6px solid transparent;
  border-color: #333 transparent transparent transparent;
}

.select-selected.select-arrow-active:after {
  border-color: transparent transparent #333 transparent;
  top: 7px;
}
</style>
  