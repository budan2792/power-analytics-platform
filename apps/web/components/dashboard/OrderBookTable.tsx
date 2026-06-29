import type { OrderBookMetric } from "../../types/orderbook";
import { MarketSignalBadge } from "./MarketSignalBadge";

type Props = {
  rows: OrderBookMetric[];
  selectedSymbol: string | null;
  onSelectSymbol: (symbol: string) => void;
};

export function OrderBookTable({
  rows,
  selectedSymbol,
  onSelectSymbol,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <table className="w-full text-sm">
        <thead className="bg-cyan-400/10 text-cyan-200">
          <tr>
            <th className="px-4 py-3 text-left">Symbol</th>
            <th className="px-4 py-3 text-right">Buy $</th>
            <th className="px-4 py-3 text-right">Sell $</th>
            <th className="px-4 py-3 text-right">Total $</th>
            <th className="px-4 py-3 text-right">Diff $</th>
            <th className="px-4 py-3 text-right">Imbalance</th>
            <th className="px-4 py-3 text-right">Signal</th>
            <th className="px-4 py-3 text-right">Spread</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.symbol}
              onClick={() => onSelectSymbol(row.symbol)}
              className={`cursor-pointer border-t border-white/10 hover:bg-white/5 ${
                selectedSymbol === row.symbol ? "bg-cyan-400/10" : ""
              }`}
            >
              <td className="px-4 py-3 font-semibold text-cyan-300">
                {row.symbol}
              </td>

              <td className="px-4 py-3 text-right">
                ${row.buyValueUSDT.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-right">
                ${row.sellValueUSDT.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-right">
                ${row.totalValueUSDT.toLocaleString()}
              </td>

              <td
                className={`px-4 py-3 text-right ${
                  row.diffUSDT >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                ${row.diffUSDT.toLocaleString()}
              </td>

              <td
                className={`px-4 py-3 text-right ${
                  row.imbalancePercent >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {row.imbalancePercent}%
              </td>

              <td className="px-4 py-3 text-right">
                <MarketSignalBadge row={row} />
              </td>

              <td className="px-4 py-3 text-right text-slate-300">
                {row.spread}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}