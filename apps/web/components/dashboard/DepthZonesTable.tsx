import type { DepthZoneMetric } from "../../types/orderbook";

type Props = {
  zones: DepthZoneMetric[];
  selectedDepth: number;
  onSelectDepth: (depth: number) => void;
};

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function DepthZonesTable({
  zones,
  selectedDepth,
  onSelectDepth,
}: Props) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Depth Zones Table</h2>
        <p className="text-sm text-slate-400">
          Buy/sell liquidity by selected price-depth ranges
        </p>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-cyan-400/10 text-cyan-200">
          <tr>
            <th className="px-4 py-3 text-left">Depth</th>
            <th className="px-4 py-3 text-right">Bid levels</th>
            <th className="px-4 py-3 text-right">Ask levels</th>
            <th className="px-4 py-3 text-right">Buy $</th>
            <th className="px-4 py-3 text-right">Sell $</th>
            <th className="px-4 py-3 text-right">Total $</th>
            <th className="px-4 py-3 text-right">Diff $</th>
            <th className="px-4 py-3 text-right">Imbalance</th>
          </tr>
        </thead>

        <tbody>
          {zones.map((zone) => (
            <tr
              key={zone.percent}
              onClick={() => onSelectDepth(zone.percent)}
              className={`cursor-pointer border-t border-white/10 hover:bg-white/5 ${
                selectedDepth === zone.percent ? "bg-cyan-400/10" : ""
              }`}
            >
              <td className="px-4 py-3 font-semibold text-cyan-300">
                {zone.percent}%
              </td>

              <td className="px-4 py-3 text-right">{zone.bidLevels}</td>

              <td className="px-4 py-3 text-right">{zone.askLevels}</td>

              <td className="px-4 py-3 text-right text-emerald-400">
                {formatUsd(zone.buyValue)}
              </td>

              <td className="px-4 py-3 text-right text-red-400">
                {formatUsd(zone.sellValue)}
              </td>

              <td className="px-4 py-3 text-right">
                {formatUsd(zone.totalValue)}
              </td>

              <td
                className={`px-4 py-3 text-right ${
                  zone.diffValue >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatUsd(zone.diffValue)}
              </td>

              <td
                className={`px-4 py-3 text-right ${
                  zone.imbalancePercent >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {zone.imbalancePercent.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}