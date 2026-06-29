"use client";

import { useEffect, useState } from "react";

type OrderBookMetric = {
  symbol: string;
  buyValueUSDT: number;
  sellValueUSDT: number;
  totalValueUSDT: number;
  diffUSDT: number;
  imbalancePercent: number;
  spread: number;
  bestBid: number;
  bestAsk: number;
};

type WsPayload = {
  type: "orderbook_metrics";
  data: OrderBookMetric[];
};

export default function HomePage() {
  const [rows, setRows] = useState<OrderBookMetric[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Підключення до backend WebSocket
    const ws = new WebSocket("ws://localhost:4000/ws");

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as WsPayload;

      if (payload.type === "orderbook_metrics") {
        setRows(payload.data);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Power Analytics Platform
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Live CEX liquidity and order book analytics
            </p>
          </div>

          <div className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm">
            {connected ? "🟢 Live connected" : "🔴 Disconnected"}
          </div>
        </div>

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
                <th className="px-4 py-3 text-right">Spread</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.symbol}
                  className="border-t border-white/10 hover:bg-white/5"
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
                  <td className="px-4 py-3 text-right text-slate-300">
                    {row.spread}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}