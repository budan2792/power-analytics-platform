"use client";

import { useEffect, useState } from "react";
import type { OrderBookMetric, WsPayload } from "../types/orderbook";

export function useOrderBookMetrics() {
  const [rows, setRows] = useState<OrderBookMetric[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Live-зʼєднання з backend API
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

  return {
    rows,
    connected,
  };
}