export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./server/db/migrate");

		await (await import("./server/db/seed")).seed();

		await (
			await import("./server/services/exchange-rates")
		).updateExchangeRates();
	}
}
