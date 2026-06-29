import type { OrderBookMetric } from "../../types/orderbook";

type Props = {
  selected: OrderBookMetric | null;
};

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function SymbolDetailsPanel({ selected }: Props) {
  if (!selected) {
    return (
      <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 text-slate-400">
        Select a symbol from the table to see details
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
    
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cyan-300">
            {selected.symbol}
          </h2>

          <p className="text-sm text-slate-400">
            Live order book liquidity details
          </p>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm ${
            selected.diffUSDT >= 0
              ? "bg-emerald-400/10 text-emerald-400"
              : "bg-red-400/10 text-red-400"
          }`}
        >
          {selected.diffUSDT >= 0 ? "Buy pressure" : "Sell pressure"}
        </div>
      </div>

     <div className="grid gap-4 md:grid-cols-5">
    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <div className="text-xs uppercase text-slate-500">Price</div>
        <div className="mt-2 text-lg font-semibold text-cyan-300">
        ${selected.price.toLocaleString()}
        </div>
    </div>

    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs uppercase text-slate-500">Best bid</div>
        <div className="mt-2 text-lg font-semibold">
        {selected.bestBid.toLocaleString()}
        </div>
    </div>

    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs uppercase text-slate-500">Best ask</div>
        <div className="mt-2 text-lg font-semibold">
        {selected.bestAsk.toLocaleString()}
        </div>
    </div>

    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs uppercase text-slate-500">Spread</div>
        <div className="mt-2 text-lg font-semibold">{selected.spread}</div>
    </div>

    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs uppercase text-slate-500">Imbalance</div>
        <div
        className={`mt-2 text-lg font-semibold ${
            selected.imbalancePercent >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
        >
        {selected.imbalancePercent}%
        </div>
    </div>
    </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="text-xs uppercase text-slate-500">Buy value</div>
          <div className="mt-2 text-lg font-semibold text-emerald-400">
            {formatUsd(selected.buyValueUSDT)}
          </div>
        </div>

        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
          <div className="text-xs uppercase text-slate-500">Sell value</div>
          <div className="mt-2 text-lg font-semibold text-red-400">
            {formatUsd(selected.sellValueUSDT)}
          </div>
        </div>

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <div className="text-xs uppercase text-slate-500">Difference</div>
          <div
            className={`mt-2 text-lg font-semibold ${
              selected.diffUSDT >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatUsd(selected.diffUSDT)}
          </div>
        </div>
      </div>
    </div>
  );
}