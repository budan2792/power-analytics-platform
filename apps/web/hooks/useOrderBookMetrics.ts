"use client";

import { useEffect, useState } from "react";
import type { OrderBookMetric, WsPayload } from "../types/orderbook";

export type ImbalanceHistoryPoint = {
  time: string;
  imbalance: number;
};

export type SymbolHistoryMap = Record<string, ImbalanceHistoryPoint[]>;

export function useOrderBookMetrics() {
  const [rows, setRows] = useState<OrderBookMetric[]>([]);
  const [connected, setConnected] = useState(false);
  const [imbalanceHistory, setImbalanceHistory] = useState<
    ImbalanceHistoryPoint[]
  >([]);
  const [symbolHistory, setSymbolHistory] = useState<SymbolHistoryMap>({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/ws");

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as WsPayload;

      if (payload.type !== "orderbook_metrics") return;

      setRows(payload.data);

      const totalBuy = payload.data.reduce(
        (sum, row) => sum + row.buyValueUSDT,
        0
      );

      const totalSell = payload.data.reduce(
        (sum, row) => sum + row.sellValueUSDT,
        0
      );

      const total = totalBuy + totalSell;
      const imbalance = total > 0 ? ((totalBuy - totalSell) / total) * 100 : 0;
      const time = new Date().toLocaleTimeString();

      // Загальна історія по всьому ринку
      setImbalanceHistory((prev) => [
        ...prev.slice(-59),
        {
          time,
          imbalance: Number(imbalance.toFixed(2)),
        },
      ]);

      // Історія окремо по кожній парі
      setSymbolHistory((prev) => {
        const next = { ...prev };

        for (const row of payload.data) {
          const current = next[row.symbol] ?? [];

          next[row.symbol] = [
            ...current.slice(-59),
            {
              time,
              imbalance: row.imbalancePercent,
            },
          ];
        }

        return next;
      });
    };

    return () => ws.close();
  }, []);

  return {
    rows,
    connected,
    imbalanceHistory,
    symbolHistory,
  };
}