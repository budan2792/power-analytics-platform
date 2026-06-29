export type OrderBookMetric = {
  symbol: string;
  buyValueUSDT: number;
  sellValueUSDT: number;
  totalValueUSDT: number;
  diffUSDT: number;
  imbalancePercent: number;
  spread: number;
  bestBid: number;
  bestAsk: number;
};

export type WsPayload = {
  type: "orderbook_metrics";
  data: OrderBookMetric[];
};