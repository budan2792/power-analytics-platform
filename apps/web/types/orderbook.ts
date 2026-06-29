export type DepthZoneMetric = {
  percent: number;
  bidLevels: number;
  askLevels: number;
  buyVolume: number;
  sellVolume: number;
  buyValue: number;
  sellValue: number;
  totalValue: number;
  diffValue: number;
  imbalancePercent: number;
};

export type OrderBookMetric = {
  symbol: string;
  price: number;
  buyValueUSDT: number;
  sellValueUSDT: number;
  totalValueUSDT: number;
  diffUSDT: number;
  imbalancePercent: number;
  spread: number;
  bestBid: number;
  bestAsk: number;
  depthZones: DepthZoneMetric[];
};

export type WsPayload = {
  type: "orderbook_metrics";
  data: OrderBookMetric[];
};