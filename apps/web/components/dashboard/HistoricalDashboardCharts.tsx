"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MarketHistoryPoint } from "../../hooks/useMarketHistory";

type Props = {
  symbol: string | null;
  data: MarketHistoryPoint[];
  loading: boolean;
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString();
}

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function HistoricalDashboardCharts({ symbol, data, loading }: Props) {
  const chartData = data.map((row) => {
    const depth1 = row.depthZones?.find((z) => z.percent === 1);
    const depth3 = row.depthZones?.find((z) => z.percent === 3);
    const depth5 = row.depthZones?.find((z) => z.percent === 5);
    const depth10 = row.depthZones?.find((z) => z.percent === 10);

    return {
      time: formatTime(row.minute),

      price: row.closePrice,

      buyValue: row.avgBuyValueUSDT,
      sellValue: row.avgSellValueUSDT,

      depth1: depth1?.totalValue ?? 0,
      depth3: depth3?.totalValue ?? 0,
      depth5: depth5?.totalValue ?? 0,
      depth10: depth10?.totalValue ?? 0,

      imbalance: Number(row.avgImbalancePercent.toFixed(2)),
    };
  });

  return (
    <div className="space-y-4">
      {/* Price curve */}
      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Price history
            </h2>
            <p className="text-sm text-slate-400">
              {symbol ? `${symbol} minute close price` : "Select symbol"}
            </p>
          </div>

          <div className="text-sm text-slate-400">
            {loading ? "Loading..." : `${data.length} points`}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" domain={["auto", "auto"]} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(34, 211, 238, 0.35)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Price",
                ]}
              />

              <Line
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="#facc15"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Buy / Sell orders */}
      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Buy / Sell orders
          </h2>
          <p className="text-sm text-slate-400">
            Average buy and sell order book value per minute
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" tickFormatter={formatUsd} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(34, 211, 238, 0.35)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
                formatter={(value, name) => [
                  formatUsd(Number(value)),
                  name === "buyValue" ? "Buy orders" : "Sell orders",
                ]}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="buyValue"
                name="Buy orders"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="sellValue"
                name="Sell orders"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Depth volume */}
      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Order depth volume
          </h2>
          <p className="text-sm text-slate-400">
            Historical liquidity depth by price range
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" tickFormatter={formatUsd} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(34, 211, 238, 0.35)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
                formatter={(value) => [formatUsd(Number(value)), "Depth"]}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="depth1"
                name="0-1%"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="depth3"
                name="1-3%"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="depth5"
                name="3-5%"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="depth10"
                name="5-10%"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Imbalance */}
      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Imbalance history
          </h2>
          <p className="text-sm text-slate-400">
            Buy/Sell order book imbalance
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" domain={["auto", "auto"]} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(34, 211, 238, 0.35)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
                formatter={(value) => [`${value}%`, "Imbalance"]}
              />

              <Line
                type="monotone"
                dataKey="imbalance"
                name="Imbalance"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}