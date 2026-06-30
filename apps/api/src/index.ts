import { loadTrackedSymbols } from "./config/symbols.js";
import { BinanceAdapter } from "./exchanges/binance.adapter.js";
import { OrderBookEngine } from "./orderbook/orderbook.engine.js";
import { calculateOrderBookMetrics } from "./analytics/orderbook.metrics.js";
import { ApiServer } from "./server/api.server.js";
import { MinuteAggregator } from "./storage/minute-aggregator.js";
import type { DepthUpdate } from "./types/orderbook.types.js";

type SymbolRuntime = {
  symbol: string;
  engine: OrderBookEngine;
  adapter: BinanceAdapter;
  snapshotLoaded: boolean;
  lastUpdateId: number;
  buffer: DepthUpdate[];
};

const TOP_SYMBOLS = await loadTrackedSymbols();

const runtimes = new Map<string, SymbolRuntime>();

const apiServer = new ApiServer(4000);
const minuteAggregator = new MinuteAggregator();

await apiServer.start();

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

      const snapshot = await adapter.loadSnapshot();

      runtime.lastUpdateId = snapshot.lastUpdateId;
      runtime.engine.applySnapshot(snapshot.bids, snapshot.asks);

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
      if (!runtime.snapshotLoaded) {
        runtime.buffer.push(update);
        return;
      }

      if (update.u <= runtime.lastUpdateId) {
        return;
      }

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

setInterval(async () => {
  const rows = [];

  for (const symbol of TOP_SYMBOLS) {
    const runtime = runtimes.get(symbol);

    if (!runtime || !runtime.snapshotLoaded) continue;

    const m = calculateOrderBookMetrics(runtime.symbol, runtime.engine, 100);

    rows.push({
      symbol: m.symbol,
      price: Number(m.price.toFixed(8)),

      bidLevels: m.bidLevels,
      askLevels: m.askLevels,

      buyValueUSDT: Number(m.buyValue.toFixed(2)),
      sellValueUSDT: Number(m.sellValue.toFixed(2)),
      totalValueUSDT: Number((m.buyValue + m.sellValue).toFixed(2)),
      diffUSDT: Number(m.valueDifference.toFixed(2)),

      imbalancePercent: Number(m.imbalancePercent.toFixed(2)),
      spread: Number(m.spread.toFixed(6)),

      bestBid: m.bestBid,
      bestAsk: m.bestAsk,

      largestBuyWallValueUSDT: Number(m.largestBuyWall.valueUSDT.toFixed(2)),
      largestBuyWallPrice: m.largestBuyWall.price,
      largestBuyWallDistancePct: Number(
        m.largestBuyWallDistancePct.toFixed(4)
      ),

      largestSellWallValueUSDT: Number(m.largestSellWall.valueUSDT.toFixed(2)),
      largestSellWallPrice: m.largestSellWall.price,
      largestSellWallDistancePct: Number(
        m.largestSellWallDistancePct.toFixed(4)
      ),

      depthZones: m.depthZones,
    });
  }

  console.clear();
  console.table(
    rows.map((row) => ({
      symbol: row.symbol,
      price: row.price,
      buyValueUSDT: row.buyValueUSDT,
      sellValueUSDT: row.sellValueUSDT,
      imbalance: `${row.imbalancePercent}%`,
      buyWall: row.largestBuyWallValueUSDT,
      sellWall: row.largestSellWallValueUSDT,
    }))
  );

  for (const row of rows) {
    minuteAggregator.addSample("binance_spot", row);
  }

  await minuteAggregator.flushCompletedBuckets();

  apiServer.broadcast({
    type: "orderbook_metrics",
    data: rows,
  });
}, 1000);