import { loadBinanceSpotSymbols } from "../exchanges/binance.symbols.js";

export async function loadTrackedSymbols() {
  const symbols = await loadBinanceSpotSymbols();

  console.log(`Loaded ${symbols.length} symbols`);
  console.log(symbols.join(", "));

  return symbols;
}