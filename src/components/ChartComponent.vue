<template>
  <div class="chartContainer">
    <div class="chartBlock">
      <Chart :key="chartKey" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from "vue";
import { Chart } from "vue-tradingview-widgets";

const props = defineProps({
  ticker: {
    type: String,
    required: true,
  },
});

const chartOptions = ref({
  theme: "dark",
  width: "100%",
  interval: "5",
  symbol: `BINANCE:NEARUSD`,
  
});

const chartKey = ref("NEAR");

watch(
  () => props.ticker,
  (newTicker) => {
    chartOptions.value.symbol = `BINANCE:NEARUSD`;
    chartKey.value = newTicker;
  },
  { immediate: true }
);
</script>


