import type { DepthZoneMetric } from "../../types/orderbook";

type Props = {
  zones: DepthZoneMetric[];
  selectedDepth: number;
  onSelectDepth: (depth: number) => void;
};

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function DepthZonesPanel({
  zones,
  selectedDepth,
  onSelectDepth,
}: Props) {
  const selectedZone =
    zones.find((zone) => zone.percent === selectedDepth) ?? zones[0];

  if (!selectedZone) {
    return (
      <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 text-slate-400">
        Depth data is loading...
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Order Book Depth
          </h2>

          <p className="text-sm text-slate-400">
            Liquidity inside selected price depth range
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {zones.map((zone) => (
            <button
              key={zone.percent}
              onClick={() => onSelectDepth(zone.percent)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedDepth === zone.percent
                  ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                  : "border-white/10 bg-black/20 text-slate-400 hover:border-cyan-400/40 hover:text-cyan-200"
              }`}
            >
              {zone.percent}%
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="text-xs uppercase text-slate-500">Buy depth</div>
          <div className="mt-2 text-lg font-semibold text-emerald-400">
            {formatUsd(selectedZone.buyValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {selectedZone.bidLevels} bid levels
          </div>
        </div>

        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
          <div className="text-xs uppercase text-slate-500">Sell depth</div>
          <div className="mt-2 text-lg font-semibold text-red-400">
            {formatUsd(selectedZone.sellValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {selectedZone.askLevels} ask levels
          </div>
        </div>

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <div className="text-xs uppercase text-slate-500">Depth total</div>
          <div className="mt-2 text-lg font-semibold text-cyan-300">
            {formatUsd(selectedZone.totalValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Inside {selectedZone.percent}% price range
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            selectedZone.diffValue >= 0
              ? "border-emerald-400/20 bg-emerald-400/5"
              : "border-red-400/20 bg-red-400/5"
          }`}
        >
          <div className="text-xs uppercase text-slate-500">Depth imbalance</div>
          <div
            className={`mt-2 text-lg font-semibold ${
              selectedZone.diffValue >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {selectedZone.imbalancePercent.toFixed(2)}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {formatUsd(selectedZone.diffValue)}
          </div>
        </div>
      </div>
    </div>
  );
}