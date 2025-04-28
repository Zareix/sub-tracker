import { env } from "~/env";
import { BASE_CURRENCY, CURRENCIES } from "~/lib/constant";
import { db, runTransaction } from "~/server/db";
import { exchangeRates } from "~/server/db/schema";

export const updateExchangeRates = async () => {
	console.log("Updating exchange rates...");
	if (!env.FIXER_API_KEY) {
		console.log("FIXER_API_KEY not set, skipping exchange rates update");
		return;
	}
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

	await runTransaction(db, async () => {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(exchangeRates);

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
			await db.insert(exchangeRates).values({
				baseCurrency: BASE_CURRENCY,
				targetCurrency: currency,
				rate,
			});

			console.log(`${currency} to ${BASE_CURRENCY} rate: ${1 / rate}`);
			await db.insert(exchangeRates).values({
				baseCurrency: currency,
				targetCurrency: BASE_CURRENCY,
				rate: 1 / rate,
			});
		}
	});

	console.log("Exchange rates updated!");
};
