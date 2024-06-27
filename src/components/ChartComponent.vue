<template>
  <div class="chartContainer">
    <div class="">
      <!-- <Chart :key="chartKey" :options="chartOptions" /> -->
      <div class="livecoinwatch-widget-container">
        <div
          class="livecoinwatch-widget-1"
          lcw-coin="NEAR"
          lcw-base="USD"
          lcw-secondary="BTC"
          lcw-period="y"
          lcw-color-tx="#ffffff"
          lcw-color-pr="#00d084"
          lcw-color-bg="#1f2434"
          lcw-border-w="0"
        >
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/*eslint-disable*/
import { onMounted, defineEmits, onBeforeUnmount } from "vue";

const emits = defineEmits(["updatePrice"]);

let pollingInterval = null;

const extractPrice = () => {
  const container = document.querySelector(".livecoinwatch-widget-1");
  if (container) {
    const pTags = container.querySelectorAll("p");
    pTags.forEach((p) => {
      const text = p.innerText;
      const priceMatch = text.match(
        /(?:[1-9]\d*|0)?(?:\.\d{4,5})\b(?<!0\.00008)/
      );
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(/,/g, ""));
        if (!isNaN(price)) {
          emits("updatePrice", price);
        }
      }
    });
  }
};

onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://www.livecoinwatch.com/static/lcw-widget.js";
  script.defer = true;
  document.head.appendChild(script);

  script.onload = () => {
    pollingInterval = setInterval(extractPrice, 5000);
  };
});

onBeforeUnmount(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>


<style scoped>
.livecoinwatch-widget-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1f2434;
  padding: 20px;
  border-radius: 10px;
}

.livecoinwatch-widget-1 {
  width: 100%;
  max-width: 400px;
}
</style>