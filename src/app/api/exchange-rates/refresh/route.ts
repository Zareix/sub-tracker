import { env } from "~/env";
import { BASE_CURRENCY, CURRENCIES } from "~/lib/constant";
import { db } from "~/server/db";
import { exchangeRates } from "~/server/db/schema";

export const POST = async () => {
  const response = await fetch(
    `http://data.fixer.io/api/latest?access_key=${env.FIXER_API_KEY}`,
    {
      method: "GET",
    },
  );
  const data = (await response.json()) as {
    success: boolean;
    timestamp: number;
    base: string;
    date: string;
    rates: Record<string, number>;
  };

  await db.transaction(async (trx) => {
    await trx.delete(exchangeRates);

    for (const currency of CURRENCIES.filter((c) => c !== "EUR")) {
      if (!data.rates[currency]) {
        return new Response(JSON.stringify(data), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const rate = data.rates[currency];
      if (!rate) {
        return;
      }
      console.log(`${BASE_CURRENCY} to ${currency} rate: ${rate}`);
      await trx.insert(exchangeRates).values({
        baseCurrency: BASE_CURRENCY,
        targetCurrency: currency,
        rate,
      });

      console.log(`${currency} to ${BASE_CURRENCY} rate: ${1 / rate}`);
      await trx.insert(exchangeRates).values({
        baseCurrency: currency,
        targetCurrency: BASE_CURRENCY,
        rate: 1 / rate,
      });
    }
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
