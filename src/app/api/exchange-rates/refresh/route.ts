import { updateExchangeRates } from "~/server/services/exchange-rates";

export const POST = async () => {
  await updateExchangeRates();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
