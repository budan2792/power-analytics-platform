export type MarketType = "spot" | "futures";

export const SCANNER_CONFIG = {
  exchange: "binance",

  markets: {
    spot: true,
    futures: false,
  },

  quoteAssets: ["USDT"],

  maxSymbols: 20,

  symbolStartDelayMs: 1500,

  // Поки Binance може давати 418, використовуємо локальний список
  useDynamicSymbols: false,

  fallbackSymbols: [
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "AVAXUSDT",
    "LINKUSDT",
    "TRXUSDT",
    "TONUSDT",
    "DOTUSDT",
    "MATICUSDT",
    "LTCUSDT",
    "BCHUSDT",
    "UNIUSDT",
    "APTUSDT",
    "ARBUSDT",
    "OPUSDT",
    "NEARUSDT",
  ],

  excludeSymbols: ["USDCUSDT", "FDUSDUSDT", "TUSDUSDT", "BUSDUSDT"],
};