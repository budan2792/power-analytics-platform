import type { OrderBookMetric } from "../../types/orderbook";

type Props = {
  rows: OrderBookMetric[];
};

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function DashboardStats({ rows }: Props) {
  // Загальна buy-ліквідність
  const totalBuy = rows.reduce((sum, row) => sum + row.buyValueUSDT, 0);

  // Загальна sell-ліквідність
  const totalSell = rows.reduce((sum, row) => sum + row.sellValueUSDT, 0);

  // Загальна ліквідність
  const totalLiquidity = totalBuy + totalSell;

  // Загальна різниця buy/sell
  const diff = totalBuy - totalSell;

  // Загальний дисбаланс у %
  const imbalance =
    totalLiquidity > 0 ? (diff / totalLiquidity) * 100 : 0;

  const cards = [
    {
      label: "Total liquidity",
      value: formatUsd(totalLiquidity),
      hint: "Top symbols order book value",
    },
    {
      label: "Buy liquidity",
      value: formatUsd(totalBuy),
      hint: "Bid-side liquidity",
    },
    {
      label: "Sell liquidity",
      value: formatUsd(totalSell),
      hint: "Ask-side liquidity",
    },
    {
      label: "Market imbalance",
      value: `${imbalance.toFixed(2)}%`,
      hint: diff >= 0 ? "Buy side dominates" : "Sell side dominates",
      positive: diff >= 0,
    },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-xl shadow-cyan-500/10 backdrop-blur"
        >
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
            {card.label}
          </div>

          <div
            className={`mt-3 text-2xl font-bold ${
              card.positive === undefined
                ? "text-white"
                : card.positive
                  ? "text-emerald-400"
                  : "text-red-400"
            }`}
          >
            {card.value}
          </div>

          <div className="mt-2 text-sm text-slate-500">{card.hint}</div>
        </div>
      ))}
    </div>
  );
}