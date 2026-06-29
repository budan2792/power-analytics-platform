import WebSocket from "ws";
import type {
  DepthSnapshot,
  DepthUpdate,
} from "../types/orderbook.types.js";

type BinanceAdapterOptions = {
  symbol: string;

  // Викликається при кожному WebSocket-оновленні
  onUpdate: (update: DepthUpdate) => void;

  // Викликається після підключення
  onOpen?: () => void;

  // Обробка помилок WebSocket
  onError?: (error: Error) => void;
};

export class BinanceAdapter {
  private symbol: string;
  private ws?: WebSocket;

  constructor(private options: BinanceAdapterOptions) {
    this.symbol = options.symbol.toUpperCase();
  }

  // Підключення до Binance WebSocket
  connect() {
    const symbolLower = this.symbol.toLowerCase();
    const url = `wss://stream.binance.com:9443/ws/${symbolLower}@depth@100ms`;

    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      this.options.onOpen?.();
    });

    this.ws.on("message", (raw) => {
      const update = JSON.parse(raw.toString()) as DepthUpdate;
      this.options.onUpdate(update);
    });

    this.ws.on("error", (error) => {
      this.options.onError?.(error);
    });
  }

  // Завантаження початкового snapshot стакану
  async loadSnapshot(): Promise<DepthSnapshot> {
    const url = `https://api.binance.com/api/v3/depth?symbol=${this.symbol}&limit=5000`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Snapshot error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as DepthSnapshot;
  }
}