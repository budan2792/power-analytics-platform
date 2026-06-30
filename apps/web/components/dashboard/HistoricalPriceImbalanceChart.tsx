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

export function HistoricalPriceImbalanceChart({
  symbol,
  data,
  loading,
}: Props) {
  const chartData = data.map((row) => ({
    time: formatTime(row.minute),
    price: row.closePrice,
    imbalance: Number(row.avgImbalancePercent.toFixed(2)),
  }));

  return (
    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Historical Price / Imbalance
          </h2>

          <p className="text-sm text-slate-400">
            {symbol
              ? `${symbol} minute snapshots from database`
              : "Select symbol to view history"}
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

            <YAxis
              yAxisId="price"
              orientation="right"
              stroke="#facc15"
              domain={["auto", "auto"]}
            />

            <YAxis
              yAxisId="imbalance"
              stroke="#22d3ee"
              domain={["auto", "auto"]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid rgba(34, 211, 238, 0.35)",
                borderRadius: "12px",
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#67e8f9",
                fontWeight: 700,
              }}
              formatter={(value, name) => {
                if (name === "price") {
                  return [`$${Number(value).toLocaleString()}`, "Price"];
                }

                return [`${value}%`, "Imbalance"];
              }}
            />

            <Legend />

            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              name="Price"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            <Line
              yAxisId="imbalance"
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
  );
}