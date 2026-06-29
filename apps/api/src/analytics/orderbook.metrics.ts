import type { OrderBookEngine } from "../orderbook/orderbook.engine.js";

export function calculateOrderBookMetrics(
  symbol: string,
  engine: OrderBookEngine,
  depth = 100
) {
  // Беремо топ рівні стакану
  const topBids = engine.getTopBids(depth);
  const topAsks = engine.getTopAsks(depth);

  // Рахуємо обʼєм у монетах
  const buyVolume = topBids.reduce((sum, [, qty]) => sum + qty, 0);
  const sellVolume = topAsks.reduce((sum, [, qty]) => sum + qty, 0);

  // Рахуємо вартість у USDT
  const buyValue = topBids.reduce((sum, [price, qty]) => sum + price * qty, 0);
  const sellValue = topAsks.reduce((sum, [price, qty]) => sum + price * qty, 0);

  // Найкраща ціна купівлі/продажу
  const bestBid = topBids[0]?.[0] ?? 0;
  const bestAsk = topAsks[0]?.[0] ?? 0;

  // Spread і середня ціна
  const spread = bestBid && bestAsk ? bestAsk - bestBid : 0;
  const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;

  // Дисбаланс між buy/sell
  const imbalancePercent =
    buyVolume + sellVolume > 0
      ? ((buyVolume - sellVolume) / (buyVolume + sellVolume)) * 100
      : 0;

  return {
    symbol,
    bidLevels: topBids.length,
    askLevels: topAsks.length,
    buyVolume,
    sellVolume,
    buyValue,
    sellValue,
    volumeDifference: buyVolume - sellVolume,
    valueDifference: buyValue - sellValue,
    imbalancePercent,
    bestBid,
    bestAsk,
    midPrice,
    spread,
  };
}