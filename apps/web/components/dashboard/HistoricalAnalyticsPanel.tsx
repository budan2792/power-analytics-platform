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
import type { MarketAnalyticsPoint } from "../../hooks/useMarketAnalytics";

type Props = {
  symbol: string | null;
  data: MarketAnalyticsPoint[];
  loading: boolean;
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString();
}

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatScore(value: number) {
  return Math.round(value).toString();
}

function getLatest(data: MarketAnalyticsPoint[]) {
  return data[data.length - 1] ?? null;
}

export function HistoricalAnalyticsPanel({ symbol, data, loading }: Props) {
  const latest = getLatest(data);

  const chartData = data.map((row) => ({
    time: formatTime(row.minute),

    buyPressureScore: Number(row.buyPressureScore.toFixed(2)),
    sellPressureScore: Number(row.sellPressureScore.toFixed(2)),
    liquidityFlowScore: Number(row.liquidityFlowScore.toFixed(2)),
    volatilityScore: Number(row.volatilityScore.toFixed(2)),
    wallActivityScore: Number(row.wallActivityScore.toFixed(2)),

    buyLiquidityChangeUSDT: row.buyLiquidityChangeUSDT,
    sellLiquidityChangeUSDT: row.sellLiquidityChangeUSDT,
    totalLiquidityChangeUSDT: row.totalLiquidityChangeUSDT,

    largestBuyWallChangeUSDT: row.largestBuyWallChangeUSDT,
    largestSellWallChangeUSDT: row.largestSellWallChangeUSDT,

    imbalanceChangePct: Number(row.imbalanceChangePct.toFixed(2)),
    priceChangePct: Number(row.priceChangePct.toFixed(4)),
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Analytics Intelligence
            </h2>

            <p className="text-sm text-slate-400">
              {symbol
                ? `${symbol} calculated market behavior analytics`
                : "Select symbol"}
            </p>
          </div>

          <div className="text-sm text-slate-400">
            {loading ? "Loading..." : `${data.length} points`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="text-xs uppercase text-slate-500">
              Buy pressure
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-400">
              {latest ? formatScore(latest.buyPressureScore) : "0"}
            </div>
          </div>

          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
            <div className="text-xs uppercase text-slate-500">
              Sell pressure
            </div>
            <div className="mt-2 text-2xl font-bold text-red-400">
              {latest ? formatScore(latest.sellPressureScore) : "0"}
            </div>
          </div>

          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <div className="text-xs uppercase text-slate-500">
              Liquidity flow
            </div>
            <div className="mt-2 text-2xl font-bold text-cyan-300">
              {latest ? formatScore(latest.liquidityFlowScore) : "0"}
            </div>
          </div>

          <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
            <div className="text-xs uppercase text-slate-500">Volatility</div>
            <div className="mt-2 text-2xl font-bold text-yellow-300">
              {latest ? formatScore(latest.volatilityScore) : "0"}
            </div>
          </div>

          <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-4">
            <div className="text-xs uppercase text-slate-500">
              Wall activity
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-300">
              {latest ? formatScore(latest.wallActivityScore) : "0"}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Pressure Scores
          </h2>
          <p className="text-sm text-slate-400">
            Buy pressure, sell pressure and liquidity flow over time
          </p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(34, 211, 238, 0.35)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="buyPressureScore"
                name="Buy pressure"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="sellPressureScore"
                name="Sell pressure"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="liquidityFlowScore"
                name="Liquidity flow"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Liquidity Delta
          </h2>
          <p className="text-sm text-slate-400">
            Minute-to-minute buy, sell and total liquidity changes
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
                formatter={(value, name) => {
                  const label =
                    name === "buyLiquidityChangeUSDT"
                      ? "Buy delta"
                      : name === "sellLiquidityChangeUSDT"
                        ? "Sell delta"
                        : "Total delta";

                  return [formatUsd(Number(value)), label];
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="buyLiquidityChangeUSDT"
                name="Buy delta"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="sellLiquidityChangeUSDT"
                name="Sell delta"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="totalLiquidityChangeUSDT"
                name="Total delta"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Wall Delta</h2>
          <p className="text-sm text-slate-400">
            Largest buy and sell wall value changes
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
                formatter={(value, name) => {
                  const label =
                    name === "largestBuyWallChangeUSDT"
                      ? "Buy wall delta"
                      : "Sell wall delta";

                  return [formatUsd(Number(value)), label];
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="largestBuyWallChangeUSDT"
                name="Buy wall delta"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="largestSellWallChangeUSDT"
                name="Sell wall delta"
                stroke="#ef4444"
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