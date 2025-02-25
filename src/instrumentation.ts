export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./server/db/migrate");
    if (process.env.NODE_ENV !== "development") {
      await (await import("./server/exchange-rates")).updateExchangeRates();
    }
  }
}
