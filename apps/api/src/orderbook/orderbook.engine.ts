import type { OrderBookLevelRaw } from "../types/orderbook.types.js";

export class OrderBookEngine {
  private bids = new Map<number, number>();
  private asks = new Map<number, number>();

  applySnapshot(bids: OrderBookLevelRaw[], asks: OrderBookLevelRaw[]) {
    this.bids.clear();
    this.asks.clear();

    this.applyLevels(this.bids, bids);
    this.applyLevels(this.asks, asks);
  }

  applyUpdate(bids: OrderBookLevelRaw[], asks: OrderBookLevelRaw[]) {
    this.applyLevels(this.bids, bids);
    this.applyLevels(this.asks, asks);
  }

  getTopBids(limit = 100) {
    return [...this.bids.entries()]
      .sort((a, b) => b[0] - a[0])
      .slice(0, limit);
  }

  getTopAsks(limit = 100) {
    return [...this.asks.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(0, limit);
  }

  // Buy-рівні в межах % нижче від midPrice
  getBidsWithinPercent(midPrice: number, percent: number) {
    const minPrice = midPrice * (1 - percent / 100);

    return [...this.bids.entries()]
      .filter(([price]) => price >= minPrice && price <= midPrice)
      .sort((a, b) => b[0] - a[0]);
  }

  // Sell-рівні в межах % вище від midPrice
  getAsksWithinPercent(midPrice: number, percent: number) {
    const maxPrice = midPrice * (1 + percent / 100);

    return [...this.asks.entries()]
      .filter(([price]) => price >= midPrice && price <= maxPrice)
      .sort((a, b) => a[0] - b[0]);
  }

  private applyLevels(book: Map<number, number>, levels: OrderBookLevelRaw[]) {
    for (const [priceStr, qtyStr] of levels) {
      const price = Number(priceStr);
      const qty = Number(qtyStr);

      if (qty === 0) {
        book.delete(price);
      } else {
        book.set(price, qty);
      }
    }
  }
}