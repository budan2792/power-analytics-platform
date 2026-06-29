"use client";

import { useEffect, useState } from "react";
import type { OrderBookMetric, WsPayload } from "../types/orderbook";

export type ImbalanceHistoryPoint = {
  time: string;
  imbalance: number;
};

export function useOrderBookMetrics() {
  const [rows, setRows] = useState<OrderBookMetric[]>([]);
  const [connected, setConnected] = useState(false);
  const [imbalanceHistory, setImbalanceHistory] = useState<
    ImbalanceHistoryPoint[]
  >([]);

  useEffect(() => {
    // Live-зʼєднання з backend API
    const ws = new WebSocket("ws://localhost:4000/ws");

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as WsPayload;

      if (payload.type !== "orderbook_metrics") return;

      setRows(payload.data);

      // Рахуємо загальний дисбаланс по всіх парах
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

      // Зберігаємо останні 60 точок графіка
      setImbalanceHistory((prev) => [
        ...prev.slice(-59),
        {
          time,
          imbalance: Number(imbalance.toFixed(2)),
        },
      ]);
    };

    return () => ws.close();
  }, []);

  return {
    rows,
    connected,
    imbalanceHistory,
  };
}