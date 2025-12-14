import { expect, test } from "bun:test";
import { useFetchMock } from "bun-fetch-mock";
import { db } from "~/server/db";
import { updateExchangeRates } from "~/server/services/exchange-rates";
import * as _mock from "~/tests/integrations/_mock";

// biome-ignore lint/correctness/useHookAtTopLevel: Not a React hook
const fetchMock = useFetchMock({
	baseUrl: "http://data.fixer.io",
});

test("Exchange rates", async () => {
	// GIVEN
	fetchMock.get(
		"/api/latest?symbols=USD%2CGBP&base=EUR&access_key=API_KEY_FOR_TESTS",
		{
			status: 200,
			data: {
				success: true,
				timestamp: _mock.now.getTime() / 1000,
				base: "EUR",
				date: _mock.now.toISOString().split("T")[0],
				rates: {
					USD: 1.1,
					GBP: 0.8,
					EUR: 1,
				},
			},
		},
	);

	// WHEN
	await updateExchangeRates();

	// THEN
	fetchMock.assertAllMocksUsed();
	const exchangeRates = await db.query.exchangeRates.findMany({
		orderBy: (rate) => [rate.baseCurrency, rate.targetCurrency],
	});
	expect(exchangeRates).toHaveLength(9); // 3 base currencies x 3 target currencies

	expect(exchangeRates[0]).toEqual({
		baseCurrency: "EUR",
		targetCurrency: "EUR",
		rate: 1,
	});
	expect(exchangeRates[1]).toEqual({
		baseCurrency: "EUR",
		targetCurrency: "GBP",
		rate: 0.8,
	});
	expect(exchangeRates[2]).toEqual({
		baseCurrency: "EUR",
		targetCurrency: "USD",
		rate: 1.1,
	});

	expect(exchangeRates[3]).toEqual({
		baseCurrency: "GBP",
		targetCurrency: "EUR",
		rate: 1.25,
	});
	expect(exchangeRates[4]).toEqual({
		baseCurrency: "GBP",
		targetCurrency: "GBP",
		rate: 1,
	});
	expect(exchangeRates[5]).toEqual({
		baseCurrency: "GBP",
		targetCurrency: "USD",
		rate: 1.375,
	});

	expect(exchangeRates[6]).toEqual({
		baseCurrency: "USD",
		targetCurrency: "EUR",
		rate: 0.909091,
	});
	expect(exchangeRates[7]).toEqual({
		baseCurrency: "USD",
		targetCurrency: "GBP",
		rate: 0.727273,
	});
	expect(exchangeRates[8]).toEqual({
		baseCurrency: "USD",
		targetCurrency: "USD",
		rate: 1,
	});
});
