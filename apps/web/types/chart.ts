export type HistoryChartType = "candles" | "line";

export type HistoryTimeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type HistoricalIndicator =
  | "orders"
  | "depth"
  | "imbalance"
  | "liquidityDelta"
  | "wallDelta"
  | "scores";

export type TimeframeOption = {
  label: string;
  value: HistoryTimeframe;
  minutes: number;
};

export const HISTORY_TIMEFRAMES: TimeframeOption[] = [
  { label: "1m", value: "1m", minutes: 1 },
  { label: "5m", value: "5m", minutes: 5 },
  { label: "15m", value: "15m", minutes: 15 },
  { label: "1H", value: "1h", minutes: 60 },
  { label: "4H", value: "4h", minutes: 240 },
  { label: "1D", value: "1d", minutes: 1440 },
];

export const HISTORY_INDICATORS: {
  label: string;
  value: HistoricalIndicator;
}[] = [
  { label: "Orders", value: "orders" },
  { label: "Depth", value: "depth" },
  { label: "Imbalance", value: "imbalance" },
  { label: "Liquidity Δ", value: "liquidityDelta" },
  { label: "Walls Δ", value: "wallDelta" },
  { label: "Scores", value: "scores" },
];