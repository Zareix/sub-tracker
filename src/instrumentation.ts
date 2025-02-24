export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./server/db/migrate");
    await (await import("./server/exchange-rates")).updateExchangeRates();
  }
}
