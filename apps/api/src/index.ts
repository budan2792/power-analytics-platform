import { BinanceAdapter } from "./exchanges/binance.adapter.js";
import { OrderBookEngine } from "./orderbook/orderbook.engine.js";
import { calculateOrderBookMetrics } from "./analytics/orderbook.metrics.js";
import type { DepthUpdate } from "./types/orderbook.types.js";

const SYMBOL = "BTCUSDT";

const engine = new OrderBookEngine();

let snapshotLoaded = false;
let lastUpdateId = 0;

// Буфер для WebSocket-повідомлень до завантаження snapshot
const buffer: DepthUpdate[] = [];

const binance = new BinanceAdapter({
  symbol: SYMBOL,

  onOpen: async () => {
    console.log("WebSocket connected");

    // Спочатку завантажуємо повний стакан
    const snapshot = await binance.loadSnapshot();

    lastUpdateId = snapshot.lastUpdateId;
    engine.applySnapshot(snapshot.bids, snapshot.asks);

    // Потім застосовуємо накопичені WebSocket-оновлення
    const validUpdates = buffer.filter((u) => u.u > lastUpdateId);

    for (const update of validUpdates) {
      engine.applyUpdate(update.b, update.a);
      lastUpdateId = update.u;
    }

    snapshotLoaded = true;
    console.log("Snapshot loaded");
  },

  onUpdate: (update) => {
    // Поки snapshot не завантажено — складаємо оновлення в буфер
    if (!snapshotLoaded) {
      buffer.push(update);
      return;
    }

    // Ігноруємо старі оновлення
    if (update.u <= lastUpdateId) {
      return;
    }

    // Оновлюємо локальний стакан
    engine.applyUpdate(update.b, update.a);
    lastUpdateId = update.u;
  },

  onError: (error) => {
    console.error("WebSocket error:", error.message);
  },
});

binance.connect();

// Раз на секунду виводимо метрики
setInterval(() => {
  if (!snapshotLoaded) return;

  const m = calculateOrderBookMetrics(SYMBOL, engine, 100);

  console.clear();
  console.table({
    symbol: m.symbol,
    bidLevels: m.bidLevels,
    askLevels: m.askLevels,
    buyVolume: m.buyVolume.toFixed(4),
    sellVolume: m.sellVolume.toFixed(4),
    buyValueUSDT: m.buyValue.toFixed(2),
    sellValueUSDT: m.sellValue.toFixed(2),
    valueDifferenceUSDT: m.valueDifference.toFixed(2),
    imbalancePercent: `${m.imbalancePercent.toFixed(2)}%`,
    bestBid: m.bestBid,
    bestAsk: m.bestAsk,
    spread: m.spread.toFixed(2),
  });
}, 1000);

// to start project run 'pnpm dev'