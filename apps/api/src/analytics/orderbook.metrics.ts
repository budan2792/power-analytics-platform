import type { OrderBookEngine } from "../orderbook/orderbook.engine.js";

const DEPTH_ZONES = [1, 3, 5, 10, 30];

function sumVolume(levels: [number, number][]) {
  return levels.reduce((sum, [, qty]) => sum + qty, 0);
}

function sumValue(levels: [number, number][]) {
  return levels.reduce((sum, [price, qty]) => sum + price * qty, 0);
}

function findLargestWall(levels: [number, number][]) {
  let largestPrice = 0;
  let largestQty = 0;
  let largestValue = 0;

  for (const [price, qty] of levels) {
    const value = price * qty;

    if (value > largestValue) {
      largestPrice = price;
      largestQty = qty;
      largestValue = value;
    }
  }

  return {
    price: largestPrice,
    qty: largestQty,
    valueUSDT: largestValue,
  };
}

function getDistancePercent(price: number, targetPrice: number) {
  if (!price || !targetPrice) return 0;
  return ((targetPrice - price) / price) * 100;
}

function calculateDepthZone(
  engine: OrderBookEngine,
  midPrice: number,
  percent: number
) {
  const bids = engine.getBidsWithinPercent(midPrice, percent);
  const asks = engine.getAsksWithinPercent(midPrice, percent);

  const buyVolume = sumVolume(bids);
  const sellVolume = sumVolume(asks);

  const buyValue = sumValue(bids);
  const sellValue = sumValue(asks);

  const totalValue = buyValue + sellValue;
  const diffValue = buyValue - sellValue;

  const imbalancePercent = totalValue > 0 ? (diffValue / totalValue) * 100 : 0;

  return {
    percent,
    bidLevels: bids.length,
    askLevels: asks.length,
    buyVolume,
    sellVolume,
    buyValue,
    sellValue,
    totalValue,
    diffValue,
    imbalancePercent,
  };
}

export function calculateOrderBookMetrics(
  symbol: string,
  engine: OrderBookEngine,
  depth = 100
) {
  const topBids = engine.getTopBids(depth);
  const topAsks = engine.getTopAsks(depth);

  const buyVolume = sumVolume(topBids);
  const sellVolume = sumVolume(topAsks);

  const buyValue = sumValue(topBids);
  const sellValue = sumValue(topAsks);

  const bestBid = topBids[0]?.[0] ?? 0;
  const bestAsk = topAsks[0]?.[0] ?? 0;

  const spread = bestBid && bestAsk ? bestAsk - bestBid : 0;
  const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
  const price = midPrice;

  const largestBuyWall = findLargestWall(topBids);
  const largestSellWall = findLargestWall(topAsks);

  const largestBuyWallDistancePct = getDistancePercent(
    price,
    largestBuyWall.price
  );

  const largestSellWallDistancePct = getDistancePercent(
    price,
    largestSellWall.price
  );

  const imbalancePercent =
    buyVolume + sellVolume > 0
      ? ((buyVolume - sellVolume) / (buyVolume + sellVolume)) * 100
      : 0;

  const depthZones =
    midPrice > 0
      ? DEPTH_ZONES.map((percent) =>
          calculateDepthZone(engine, midPrice, percent)
        )
      : [];

  return {
    symbol,
    price,

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

    largestBuyWall,
    largestSellWall,
    largestBuyWallDistancePct,
    largestSellWallDistancePct,

    depthZones,
  };
}