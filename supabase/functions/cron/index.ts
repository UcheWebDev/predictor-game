import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.5";


serve(async (req) => {
  console.log("Script running at interval");

  const supabaseUrl = "https://liqvehozsqomoftifbgf.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXZlaG96c3FvbW9mdGlmYmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5OTk4MjQsImV4cCI6MjAzNDU3NTgyNH0.PRnvTO9zE_X-FvVQuznnAQf0k_TIuyZ7xc7O13s0h6Y"
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {

    const { data, error } = await supabase.from('bids').select('*').eq('status', 'active');

    if (error) {
      console.error('error getting data from table', error)
      return new Response(JSON.stringify({ success: false, error }), { status: 500 })
    }

    /* handle data */
    console.log('Data:', data);
    const currentTime = new Date();

    for (const record of data) {
      const createdTime = new Date(record.created_at)
      const diffMinutes = (currentTime.getTime() - createdTime.getTime()) / (1000 * 60);

      if (diffMinutes >= 5) {
        const price = await fetchCryptoCurrentPrice(record.coinType)
        const currentCryptoPrice = price !== undefined && price !== null ? Number(price.toFixed(5)) : 0;

        if (currentCryptoPrice === null) {
          console.error(`Failed to fetch current price`);
          continue;
        }

        let _status = 'lost';

        if (record.bidType === 'up') {
          _status = currentCryptoPrice > record.bid_price ? 'won' : 'lost';
        } else if (record.bidType === 'down') {
          _status = currentCryptoPrice < record.bid_price ? 'won' : 'lost';
        }

        // update status
        const { data: updatedData, error: updateError } = await supabase.from('bids')
          .update({ status: _status, close_price: currentCryptoPrice }).eq('id', record.id)
        if (updateError) {
          console.error(`Error updating record ID ${record.id}:`, updateError);
        } else {
          console.log(`Record ID ${record.id} updated successfully`, updatedData);
        }

      }
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }

});


// Function to fetch the current price of a cryptocurrency
async function fetchCryptoCurrentPrice(symbol: string): Promise<number | null> {
  try {

    const response = await fetch(new Request("https://api.livecoinwatch.com/coins/single"), {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        "x-api-key": "0f5b14df-2ef4-4476-ba6e-a79e9a3f1570",
      }),
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