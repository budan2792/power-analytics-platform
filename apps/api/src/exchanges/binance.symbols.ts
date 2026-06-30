import { SCANNER_CONFIG } from "../config/scanner.config.js";

type BinanceExchangeInfoSymbol = {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  isSpotTradingAllowed?: boolean;
};

type BinanceExchangeInfoResponse = {
  symbols: BinanceExchangeInfoSymbol[];
};

export async function loadBinanceSpotSymbols() {
  if (!SCANNER_CONFIG.useDynamicSymbols) {
    console.log("Using fallback Binance spot symbols");

    return SCANNER_CONFIG.fallbackSymbols.slice(0, SCANNER_CONFIG.maxSymbols);
  }

  try {
    const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");

    if (!response.ok) {
      throw new Error(`Failed to load Binance symbols: ${response.status}`);
    }

    const data = (await response.json()) as BinanceExchangeInfoResponse;

    return data.symbols
      .filter((item) => item.status === "TRADING")
      .filter((item) => item.isSpotTradingAllowed !== false)
      .filter((item) => SCANNER_CONFIG.quoteAssets.includes(item.quoteAsset))
      .filter((item) => !SCANNER_CONFIG.excludeSymbols.includes(item.symbol))
      .map((item) => item.symbol)
      .slice(0, SCANNER_CONFIG.maxSymbols);
  } catch (error) {
    console.error(
      "Failed to load dynamic Binance symbols, using fallback list:",
      error instanceof Error ? error.message : error
    );

    return SCANNER_CONFIG.fallbackSymbols.slice(0, SCANNER_CONFIG.maxSymbols);
  }
}