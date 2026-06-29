import type { OrderBookMetric } from "../../types/orderbook";
import { MarketSignalBadge } from "./MarketSignalBadge";

type Props = {
  rows: OrderBookMetric[];
  selectedSymbol: string | null;
  onSelectSymbol: (symbol: string) => void;
};

export function WatchlistPanel({
  rows,
  selectedSymbol,
  onSelectSymbol,
}: Props) {
  return (
    <aside className="h-full rounded-2xl border border-cyan-400/20 bg-white/5 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
          Watchlist
        </h2>
        <p className="mt-1 text-xs text-slate-500">Tracked CEX pairs</p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <button
            key={row.symbol}
            onClick={() => onSelectSymbol(row.symbol)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              selectedSymbol === row.symbol
                ? "border-cyan-300 bg-cyan-400/15"
                : "border-white/10 bg-black/20 hover:border-cyan-400/40 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-cyan-300">{row.symbol}</div>
              <MarketSignalBadge row={row} />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Price</span>
              <span className="text-white">${row.price.toLocaleString()}</span>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">Imbalance</span>
              <span
                className={
                  row.imbalancePercent >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {row.imbalancePercent}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}