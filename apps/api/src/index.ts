import { TOP_SYMBOLS } from "./config/symbols.js";
import { BinanceAdapter } from "./exchanges/binance.adapter.js";
import { OrderBookEngine } from "./orderbook/orderbook.engine.js";
import { calculateOrderBookMetrics } from "./analytics/orderbook.metrics.js";
import { ApiServer } from "./server/api.server.js";
import type { DepthUpdate } from "./types/orderbook.types.js";

// Стан для одного символу
type SymbolRuntime = {
  symbol: string;
  engine: OrderBookEngine;
  adapter: BinanceAdapter;
  snapshotLoaded: boolean;
  lastUpdateId: number;
  buffer: DepthUpdate[];
};

// Усі активні символи
const runtimes = new Map<string, SymbolRuntime>();

// API для майбутнього frontend dashboard
const apiServer = new ApiServer(4000);
await apiServer.start();

// Запускаємо Binance adapter для кожного символу
for (const symbol of TOP_SYMBOLS) {
  const engine = new OrderBookEngine();

  const runtime: SymbolRuntime = {
    symbol,
    engine,
    adapter: null as unknown as BinanceAdapter,
    snapshotLoaded: false,
    lastUpdateId: 0,
    buffer: [],
  };

  const adapter = new BinanceAdapter({
    symbol,

    onOpen: async () => {
      console.log(`${symbol}: WebSocket connected`);

      // Завантажуємо початковий стакан
      const snapshot = await adapter.loadSnapshot();

      runtime.lastUpdateId = snapshot.lastUpdateId;
      runtime.engine.applySnapshot(snapshot.bids, snapshot.asks);

      // Застосовуємо оновлення, які прийшли до snapshot
      const validUpdates = runtime.buffer.filter(
        (u) => u.u > runtime.lastUpdateId
      );

      for (const update of validUpdates) {
        runtime.engine.applyUpdate(update.b, update.a);
        runtime.lastUpdateId = update.u;
      }

      runtime.snapshotLoaded = true;
      console.log(`${symbol}: Snapshot loaded`);
    },

    onUpdate: (update) => {
      // До snapshot — складаємо updates у буфер
      if (!runtime.snapshotLoaded) {
        runtime.buffer.push(update);
        return;
      }

      // Старі updates ігноруємо
      if (update.u <= runtime.lastUpdateId) {
        return;
      }

      // Оновлюємо локальний стакан
      runtime.engine.applyUpdate(update.b, update.a);
      runtime.lastUpdateId = update.u;
    },

    onError: (error) => {
      console.error(`${symbol}: WebSocket error:`, error.message);
    },
  });

  runtime.adapter = adapter;
  runtimes.set(symbol, runtime);

  adapter.connect();
}

// Раз на секунду рахуємо метрики і віддаємо їх у frontend
setInterval(() => {
  const rows = [];

  for (const runtime of runtimes.values()) {
    if (!runtime.snapshotLoaded) continue;

    const m = calculateOrderBookMetrics(runtime.symbol, runtime.engine, 100);

    rows.push({
      symbol: m.symbol,
      buyValueUSDT: Number(m.buyValue.toFixed(2)),
      sellValueUSDT: Number(m.sellValue.toFixed(2)),
      totalValueUSDT: Number((m.buyValue + m.sellValue).toFixed(2)),
      diffUSDT: Number(m.valueDifference.toFixed(2)),
      imbalancePercent: Number(m.imbalancePercent.toFixed(2)),
      spread: Number(m.spread.toFixed(6)),
      bestBid: m.bestBid,
      bestAsk: m.bestAsk,
    });
  }

  // Найліквідніші зверху
  rows.sort((a, b) => b.totalValueUSDT - a.totalValueUSDT);

  console.clear();
  console.table(rows);

  // Надсилаємо live-дані у майбутній frontend
  apiServer.broadcast({
    type: "orderbook_metrics",
    data: rows,
  });
}, 1000);