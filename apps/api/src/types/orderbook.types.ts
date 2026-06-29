// Один рівень стакану: [ціна, кількість]
export type OrderBookLevelRaw = [string, string];

// Повний snapshot стакану з REST API
export type DepthSnapshot = {
  lastUpdateId: number;
  bids: OrderBookLevelRaw[];
  asks: OrderBookLevelRaw[];
};

// Оновлення стакану з Binance WebSocket
export type DepthUpdate = {
  e: "depthUpdate";
  E: number;
  s: string;
  U: number;
  u: number;
  b: OrderBookLevelRaw[];
  a: OrderBookLevelRaw[];
};