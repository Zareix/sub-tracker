import { env } from "~/env";
import {
	Currencies,
	type Currency,
	DEFAULT_BASE_CURRENCY,
} from "~/lib/constant";
import { db, runTransaction } from "~/server/db";
import { exchangeRates } from "~/server/db/schema";

export const updateExchangeRates = async () => {
	console.log("Updating exchange rates...");
	if (!env.FIXER_API_KEY) {
		console.log("FIXER_API_KEY not set, skipping exchange rates update");
		return;
	}

	const nonBaseSymbols = Currencies.filter((c) => c !== DEFAULT_BASE_CURRENCY);
	const params = new URLSearchParams({
		symbols: nonBaseSymbols.join(","),
		base: DEFAULT_BASE_CURRENCY,
		access_key: env.FIXER_API_KEY,
	}).toString();
	const response = await fetch(`http://data.fixer.io/api/latest?${params}`, {
		method: "GET",
	});
	const data = (await response.json()) as {
		success: boolean;
		timestamp: number;
		base: typeof DEFAULT_BASE_CURRENCY;
		date: string;
		rates: Partial<Record<Currency, number>>;
	};

	await runTransaction(db, async () => {
		// eslint-disable-next-line drizzle/enforce-delete-with-where
		await db.delete(exchangeRates);

		// Build a complete rates map relative to DEFAULT_BASE_CURRENCY
		const ratesMap: Record<Currency, number> = Object.create(null);
		ratesMap[DEFAULT_BASE_CURRENCY] = 1;

		for (const currency of nonBaseSymbols) {
			const rate = data.rates?.[currency];
			if (!rate || !Number.isFinite(rate)) {
				throw new Error(
					`Missing or invalid rate for ${currency}. Received: ${String(rate)}`,
				);
			}
			ratesMap[currency] = rate;
		}

		// Prepare all pair conversions by passing through base:
		// rate(A -> B) = rate(BASE -> B) / rate(BASE -> A)
		const values: Array<typeof exchangeRates.$inferInsert> = [];
		for (const from of Currencies) {
			for (const to of Currencies) {
				const rateFrom = ratesMap[from];
				const rateTo = ratesMap[to];
				const rate = rateTo / rateFrom; // includes identity when from === to
				values.push({ baseCurrency: from, targetCurrency: to, rate });
			}
		}

		await db.insert(exchangeRates).values(values);
	});

	console.log("Exchange rates updated!");
};
