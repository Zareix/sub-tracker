import { expect, test } from "bun:test";
import { Currencies } from "~/lib/constant";
import { db } from "~/server/db";
import { updateExchangeRates } from "~/server/services/exchange-rates";

test("Exchange rates (live Frankfurter API)", async () => {
	// WHEN
	await updateExchangeRates();

	// THEN
	const rows = await db.query.exchangeRates.findMany({
		orderBy: (rate) => [rate.baseCurrency, rate.targetCurrency],
	});

	expect(rows).toHaveLength(Currencies.length * Currencies.length);

	const byPair = new Map<string, number>();
	for (const row of rows) {
		const key = `${row.baseCurrency}->${row.targetCurrency}`;
		byPair.set(key, row.rate);

		expect(Number.isFinite(row.rate)).toBeTrue();
		expect(row.rate).toBeGreaterThan(0);
	}

	for (const from of Currencies) {
		expect(byPair.get(`${from}->${from}`)).toBe(1);

		for (const to of Currencies) {
			const forward = byPair.get(`${from}->${to}`);
			const reverse = byPair.get(`${to}->${from}`);

			expect(forward).toBeDefined();
			expect(reverse).toBeDefined();

			if (forward !== undefined && reverse !== undefined) {
				expect(Math.abs(forward * reverse - 1)).toBeLessThan(0.00001);
			}
		}
	}
});
