"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DepthZoneMetric } from "../../types/orderbook";

type Props = {
  zones: DepthZoneMetric[];
};

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

export function DepthZonesChart({ zones }: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Depth Zones Chart</h2>
        <p className="text-sm text-slate-400">
          Buy and sell liquidity across depth ranges
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={zones}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            <XAxis
              dataKey="percent"
              stroke="#94a3b8"
              tickFormatter={(value) => `${value}%`}
            />

            <YAxis stroke="#94a3b8" tickFormatter={formatUsd} />

            <Tooltip
              cursor={{ fill: "rgba(34, 211, 238, 0.08)" }}
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
              formatter={(value, name) => [
                formatUsd(Number(value)),
                name === "buyValue" ? "Buy depth" : "Sell depth",
              ]}
              labelFormatter={(label) => `Depth: ${label}%`}
            />

            <Legend />

            {/* Buy depth */}
            <Bar
              dataKey="buyValue"
              name="Buy depth"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
            />

            {/* Sell depth */}
            <Bar
              dataKey="sellValue"
              name="Sell depth"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}