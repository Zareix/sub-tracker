export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./server/db/migrate");
		await import("./server/db/seed");
		(await import("./server/webpush")).startScheduler();
		if (process.env.NODE_ENV !== "development") {
			// await (
			//   await import("./server/services/exchange-rates")
			// ).updateExchangeRates();
		}
	}
}
