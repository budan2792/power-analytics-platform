export type DepthZoneSnapshot = {
  percent: number;
  totalValue: number;
};

export type MarketSnapshotInput = {
  id: string;
  exchange: string;
  symbol: string;
  minute: Date;

  closePrice: number;

  avgBuyValueUSDT: number;
  avgSellValueUSDT: number;
  avgTotalValueUSDT: number;
  avgImbalancePercent: number;
  avgSpread: number;

  largestBuyWallValueUSDT: number;
  largestSellWallValueUSDT: number;

  depthZones: unknown;
};

export type ChangeMetric = {
  value: number;
  percent: number;
};