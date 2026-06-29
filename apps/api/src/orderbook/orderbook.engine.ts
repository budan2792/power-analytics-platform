import type { OrderBookLevelRaw } from "../types/orderbook.types.js";

export class OrderBookEngine {
  // Buy-рівні стакану
  private bids = new Map<number, number>();

  // Sell-рівні стакану
  private asks = new Map<number, number>();

  // Повністю замінюємо стакан snapshot-ом
  applySnapshot(bids: OrderBookLevelRaw[], asks: OrderBookLevelRaw[]) {
    this.bids.clear();
    this.asks.clear();

    this.applyLevels(this.bids, bids);
    this.applyLevels(this.asks, asks);
  }

  // Накладаємо WebSocket-оновлення на стакан
  applyUpdate(bids: OrderBookLevelRaw[], asks: OrderBookLevelRaw[]) {
    this.applyLevels(this.bids, bids);
    this.applyLevels(this.asks, asks);
  }

  // Отримати топ buy-рівнів
  getTopBids(limit = 100) {
    return [...this.bids.entries()]
      .sort((a, b) => b[0] - a[0])
      .slice(0, limit);
  }

  // Отримати топ sell-рівнів
  getTopAsks(limit = 100) {
    return [...this.asks.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(0, limit);
  }

  // Додаємо, оновлюємо або видаляємо рівні
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