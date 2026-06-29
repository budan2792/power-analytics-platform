"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ImbalanceHistoryPoint } from "../../hooks/useOrderBookMetrics";

type Props = {
  symbol: string | null;
  data: ImbalanceHistoryPoint[];
};

export function SymbolImbalanceChart({ symbol, data }: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          {symbol ? `${symbol} Imbalance` : "Symbol Imbalance"}
        </h2>

        <p className="text-sm text-slate-400">
          Live buy/sell imbalance for selected symbol
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis stroke="#94a3b8" domain={["auto", "auto"]} />

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
              formatter={(value) => [`${value}%`, "Imbalance"]}
            />

            <Line
              type="monotone"
              dataKey="imbalance"
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