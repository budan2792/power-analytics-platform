import type { OrderBookMetric } from "../../types/orderbook";

type Props = {
  row: OrderBookMetric;
};

// Визначаємо простий сигнал по imbalance
function getSignal(row: OrderBookMetric) {
  if (row.imbalancePercent >= 10) return "Strong buy";
  if (row.imbalancePercent >= 3) return "Buy";
  if (row.imbalancePercent <= -10) return "Strong sell";
  if (row.imbalancePercent <= -3) return "Sell";

  return "Neutral";
}

export function MarketSignalBadge({ row }: Props) {
  const signal = getSignal(row);

  const className =
    signal === "Strong buy" || signal === "Buy"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
      : signal === "Strong sell" || signal === "Sell"
        ? "border-red-400/30 bg-red-400/10 text-red-400"
        : "border-slate-400/20 bg-slate-400/10 text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {signal}
    </span>
  );
}