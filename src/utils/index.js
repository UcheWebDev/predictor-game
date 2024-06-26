// import moment from "moment";

export async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd');
        const data = await response.json()
        return data.near.usd
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        throw error;
    }
}


export async function fetchCryptoPrice(crypto) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd&precision=0`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log(data[crypto].usd)
        return data[crypto].usd;
    } catch (error) {
        console.error("Error fetching the cryptocurrency price:", error);
        throw error;
    }
}

export async function fetchAlternativePrice() {
    try {
        const response = await fetch("https://api.livecoinwatch.com/coins/single", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": "0f5b14df-2ef4-4476-ba6e-a79e9a3f1570",
            },
            body: JSON.stringify({
                currency: "USD",
                code: "NEAR",
                meta: true,
            }),
        });

        const data = await response.json();

        if (!data.rate) {
            console.error(`cannot fetch`);
            return null;
        }

        return data.rate;
    } catch (error) {
        console.error('Error fetching crypto price:', error);
        return null;
    }
}


// export function getTimeSince(timestamp) {
//     const then = moment(timestamp)
//     const now = moment()
//     return then.from(now)
// };