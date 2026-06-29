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
  data: ImbalanceHistoryPoint[];
};

export function ImbalanceChart({ data }: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Market Imbalance
        </h2>

        <p className="text-sm text-slate-400">
          Live buy/sell liquidity difference across tracked symbols
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="imbalance"
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