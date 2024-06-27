<template>
  <!-- Overlay -->
  <div v-if="isMakingRequest" class="overlay">
    <div class="spinner"></div>
  </div>
  <!-- Header -->
  <div>
    <nav class="nav">
      <section class="navbar">
        <div class="navLogoSection">
          <a href="https://www.kredict.com/"> PREDICTOR </a>
        </div>
        <div class="navActionSection">
          <div class="connectWalletBtn" v-if="!isSignedIn" @click="signIn">
            Connect Wallet
          </div>
          <div v-else class="button-container">
            <div class="connectWalletBtn" @click="addStakeOneNear">
              Add Stake
            </div>
            <div class="connectWalletBtn" @click="signOut">Log Out</div>
          </div>
        </div>
      </section>
    </nav>
  </div>
  <!-- Main Container -->
  <section class="container">
    <div class="mainContainer">
      <!-- <Marquee :duration="20">
        PREDICTOR is a gambling contract where bosses stake to earn by
        predicting the price of a crypto price in the next 5 minutes
      </Marquee> -->
      <div class="gameContainer">
        <Chart :ticker="selectedTicker" />
        <div class="actionContainer">
          <h2 class="actionHead">PLACE YOUR BID</h2>
          <div class="balanceContainer">
            Your Staking Balance:
            <span>{{ stakeBalanceNear }}</span> Ⓝ ($
            <span>{{ stakeBalanceUsd }}</span
            >)
          </div>
          <div class="inputContainer">
            <input
              type="number"
              placeholder="Price"
              v-model="cashOutPrice"
              step="0.1"
              readonly
            />
            <div class="inputCurrency">
              <Select
                :defaultSelected="defaultSelected"
                @update:selectedOption="handleSelectionChange"
              />
            </div>
            <div class="inputEq">
              $ ≈ <span>{{ cashOutPrice }}</span>
            </div>
          </div>
          <div class="balanceScale">
            <p
              v-for="percent in [10, 25, 50, 75, 100]"
              :key="percent"
              class="balanceScaleItem"
              @click="calculateStakeBalance(percent)"
              :class="{ active: selectedPercentage === percent }"
            >
              {{ percent }}%
            </p>
          </div>
          <p v-if="errorText">{{ errorText }}</p>
          <!-- <div class="winningAmount">
            PnL ≈ $ <span>{{ cashOutPrice }} | {{ nearEquiv }}</span>
          </div> -->
          <div class="actionBtnContainer" v-if="isSignedIn">
            <div class="actionBtn up" @click="createNewBid('up')">UP</div>
            <div class="actionBtn down" @click="createNewBid('down')">DOWN</div>
          </div>
          <div class="previousBets">
            <h5 class="previousHead" style="color: #fff">Your Bids</h5>
            <ul class="previousList" v-if="!isSignedIn">
              <li>Connect Wallet First</li>
            </ul>
            <div class="table-responsive" v-else>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Stake ($)</th>
                    <th scope="col">Open</th>
                    <th scope="col">Close</th>
                    <th scope="col">Status</th>
                    <th scope="col">Bid</th>
                    <th scope="col">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bet in items" :key="bet.id">
                    <td>{{ bet.total_stake }}</td>
                    <td>{{ bet.bid_price }}</td>
                    <td>
                      {{
                        bet.close_price ? bet.close_price.toFixed(6) : "0.00"
                      }}
                    </td>
                    <td>
                      <template v-if="bet.status === 'won'">
                        <button class="btn-small" @click="cashout(bet.id)">
                          Pay
                        </button>
                      </template>
                      <template v-else>
                        <span style="text-transform: capitalize">
                          {{ bet.status }}</span
                        >
                      </template>
                    </td>
                    <td style="text-transform: capitalize">
                      {{ bet.bidType }}
                    </td>
                    <td>{{ getTimeSince(bet.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <button
                class="btn btn-primary btn-sm"
                @click="previousPage"
                :disabled="page === 1"
              >
                Prev
              </button>
              <span style="margin-right: 4px">Page {{ page }}</span>
              <button
                class="btn btn-primary btn-sm"
                @click="nextPage"
                :disabled="page >= totalPages"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, watch, onUnmounted } from "vue";
import * as nearAPI from "near-api-js";
import { useWallet } from "./composables/useWallet";
import { fetchAlternativePrice, fetchExchangeRate } from "./utils";
import { supabase } from "@/libs/supabaseClient";

import moment from "moment";

import Chart from "./components/ChartComponent.vue";
import Select from "./components/SelectComponent.vue";
// import Marquee from "./components/MarqueeComponent.vue";

/* NETWORK DETAILS */
const contractName = "predictor.testnet";
const networkId = "testnet";

const {
  accountId,
  isSignedIn,
  startUp,
  signIn,
  signOut,
  viewMethod,
  callMethod,
} = useWallet({
  networkId,
  createAccessKeyFor: contractName,
});
const defaultSelected = ref({
  value: 4,
  text: "NEAR",
  img: "near.png",
  name: "NEAR",
});

const isMakingRequest = ref(false);
const errorText = ref(null);
const stakeBalanceNear = ref(0);
const stakeBalanceUsd = ref(0);
const exchangeRate = ref(0);
const cashOutPrice = ref(0);
const nearEquiv = ref(0);
const selectedPercentage = ref(null);
const selectedCrypto = ref("NEAR");
const selectedCoinName = ref("NEAR");
const currentCoinPrice = ref(null);
const selectedTicker = ref("NEAR");

const items = ref([]);
const page = ref(1);
const totalPages = ref(1);
const itemsPerPage = 3;
let intervalId = null;

const handleSelectionChange = (newOption) => {
  selectedTicker.value = newOption.text;
  selectedCoinName.value = newOption.text;
  selectedCrypto.value = newOption.name;
};

const getExchangeRate = async () => {
  try {
    exchangeRate.value = await fetchExchangeRate();
    convertToUsd();
  } catch (error) {
    console.error("Error getting exchange rate:", error);
  }
};

const convertToUsd = () => {
  stakeBalanceUsd.value = (stakeBalanceNear.value * exchangeRate.value).toFixed(
    2
  );
};

const convertUsdToNear = () => {
  const rate = cashOutPrice.value / exchangeRate.value;
  nearEquiv.value = rate.toFixed(1);
};

const getTimeSince = (timestamp) => {
  const then = moment(timestamp);
  const now = moment();
  return then.from(now);
};

const fetchItems = async () => {
  const { data, count } = await supabase
    .from("bids")
    .select("*", { count: "exact" })
    .eq("bidder", accountId.value)
    .order("created_at", { ascending: false })
    .range((page.value - 1) * itemsPerPage, page.value * itemsPerPage - 1);

  items.value = data;
  totalPages.value = Math.ceil(count / itemsPerPage);
};

const previousPage = () => {
  if (page.value > 1) {
    page.value--;
  }
};

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
  }
};

const calculateStakeBalance = (percent) => {
  errorText.value = "";
  selectedPercentage.value = percent;
  cashOutPrice.value = ((stakeBalanceUsd.value * percent) / 100).toFixed(2);
  convertUsdToNear();
};

/* Wallet Functions */
const getAvailableBalance = async () => {
  try {
    const result = await viewMethod({
      contractId: contractName,
      method: "get_stake_bal",
      args: { staker: accountId.value },
    });
    stakeBalanceNear.value = nearAPI.utils.format.formatNearAmount(result);
  } catch (error) {
    console.error("Error calling get_stake_bal:", error);
  }
};

const addStakeOneNear = async () => {
  const amt = nearAPI.utils.format.parseNearAmount("1");
  try {
    await callMethod({
      contractId: contractName,
      method: "create_stake",
      args: {},
      gas: "30000000000000",
      deposit: amt,
    });
  } catch (error) {
    console.error("Error calling create_stake:", error);
  }
};

const createNewBid = async (bidType) => {
  isMakingRequest.value = true;

  if (stakeBalanceNear.value == 0) {
    errorText.value = "Oh no ! you are low on stake power";
    isMakingRequest.value = false;
    return false;
  }

  if (!cashOutPrice.value) {
    errorText.value = "Please select % stake";
    isMakingRequest.value = false;
    return false;
  }

  try {
    const price = await fetchAlternativePrice();
    const { error } = await supabase.from("bids").insert([
      {
        bidder: accountId.value,
        bid_price: price.toFixed(5),
        total_stake: cashOutPrice.value,
        coinType: selectedCoinName.value,
        bidType: bidType,
        status: "active",
      },
    ]);
    if (error) throw error;
    await callMethod({
      contractId: contractName,
      method: "deduct_stake",

      args: {
        orderVal: nearAPI.utils.format.parseNearAmount(
          nearEquiv.value.toString()
        ),
      },
    });
    errorText.value = null;
    currentCoinPrice.value = null;
    getAvailableBalance();
    fetchItems();
  } catch (error) {
    errorText.value = "Something went wrong";
    console.error("Error creating new bid:", error);
  } finally {
    isMakingRequest.value = false;
  }
};

const cashout = async (id) => {
  isMakingRequest.value = true;
  try {
    const { data } = await supabase.from("bids").select("*").eq("id", id);
    const { total_stake } = data[0];
    const rate = total_stake / exchangeRate.value;
    const stakeInNear = rate.toFixed(1);
    await callMethod({
      contractId: contractName,
      method: "increment_stake",
      args: {
        orderVal: nearAPI.utils.format.parseNearAmount(stakeInNear.toString()),
      },
    });
    const { data: updatedData, error: updateError } = await supabase
      .from("bids")
      .update({ status: "Paid" })
      .eq("id", id);
    if (updateError) throw Error(updateError);
    console.log(updatedData);
    getAvailableBalance();
    fetchItems();
    isMakingRequest.value = false;
  } catch (error) {
    console.log(error);
  }
};

/* Lifecycle Hook */
onMounted(async () => {
  await startUp();
  await getAvailableBalance();
  fetchItems();
  getExchangeRate();
  convertUsdToNear();
  intervalId = setInterval(fetchItems, 1000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});

watch(stakeBalanceNear, convertToUsd);
watch(page, fetchItems);
</script>

<style>
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 12px;
}
th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.table-responsive .table {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.balanceScaleItem.active {
  background: rgba(0, 177, 106, 255);
  font-weight: bold;
  color: black;
}
.btn {
  margin-right: 5px;
}

/* New overlay styles */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* .btn.disabled {
  pointer-events: none;
  opacity: 0.65;
} */

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
