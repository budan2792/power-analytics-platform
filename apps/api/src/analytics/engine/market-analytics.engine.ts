import { prisma } from "../../database/prisma.js";
import type { MarketSnapshotInput } from "../models/analytics.types.js";
import { calculateChange } from "../calculators/change.calculator.js";
import { calculateDepthChanges } from "../calculators/depth.calculator.js";
import { calculateScores } from "../calculators/score.calculator.js";

export class MarketAnalyticsEngine {
  async calculateForSnapshot(current: MarketSnapshotInput) {
    // Беремо попередній snapshot по цій самій парі
    const previous = await prisma.marketMinuteSnapshot.findFirst({
      where: {
        exchange: current.exchange,
        symbol: current.symbol,
        minute: {
          lt: current.minute,
        },
      },
      orderBy: {
        minute: "desc",
      },
    });

    // Якщо попередньої хвилини ще немає — аналітику не рахуємо
    if (!previous) {
      return null;
    }

    const priceChange = calculateChange(
      current.closePrice,
      previous.closePrice
    );

    const buyLiquidityChange = calculateChange(
      current.avgBuyValueUSDT,
      previous.avgBuyValueUSDT
    );

    const sellLiquidityChange = calculateChange(
      current.avgSellValueUSDT,
      previous.avgSellValueUSDT
    );

    const totalLiquidityChange = calculateChange(
      current.avgTotalValueUSDT,
      previous.avgTotalValueUSDT
    );

    const spreadChange = calculateChange(current.avgSpread, previous.avgSpread);

    const largestBuyWallChange = calculateChange(
      current.largestBuyWallValueUSDT,
      previous.largestBuyWallValueUSDT
    );

    const largestSellWallChange = calculateChange(
      current.largestSellWallValueUSDT,
      previous.largestSellWallValueUSDT
    );

    const imbalanceChangePct =
      current.avgImbalancePercent - previous.avgImbalancePercent;

    const depthChanges = calculateDepthChanges(
      current.depthZones,
      previous.depthZones
    );

    const scores = calculateScores({
      priceChangePct: priceChange.percent,
      buyLiquidityChangePct: buyLiquidityChange.percent,
      sellLiquidityChangePct: sellLiquidityChange.percent,
      imbalanceChangePct,
      largestBuyWallChangePct: largestBuyWallChange.percent,
      largestSellWallChangePct: largestSellWallChange.percent,
      spreadChangePct: spreadChange.percent,
    });

    const summary = {
      priceDirection:
        priceChange.value > 0 ? "up" : priceChange.value < 0 ? "down" : "flat",
      liquidityDirection:
        totalLiquidityChange.value > 0
          ? "increasing"
          : totalLiquidityChange.value < 0
            ? "decreasing"
            : "flat",
      pressure:
        scores.buyPressureScore > scores.sellPressureScore ? "buy" : "sell",
    };

    return prisma.marketMinuteAnalytics.upsert({
      where: {
        exchange_symbol_minute: {
          exchange: current.exchange,
          symbol: current.symbol,
          minute: current.minute,
        },
      },
      update: {},
      create: {
        snapshotId: current.id,

        exchange: current.exchange,
        symbol: current.symbol,
        minute: current.minute,

        priceChangeUSDT: priceChange.value,
        priceChangePct: priceChange.percent,

        buyLiquidityChangeUSDT: buyLiquidityChange.value,
        buyLiquidityChangePct: buyLiquidityChange.percent,

        sellLiquidityChangeUSDT: sellLiquidityChange.value,
        sellLiquidityChangePct: sellLiquidityChange.percent,

        totalLiquidityChangeUSDT: totalLiquidityChange.value,
        totalLiquidityChangePct: totalLiquidityChange.percent,

        imbalanceChangePct,

        spreadChangeUSDT: spreadChange.value,
        spreadChangePct: spreadChange.percent,

        largestBuyWallChangeUSDT: largestBuyWallChange.value,
        largestBuyWallChangePct: largestBuyWallChange.percent,

        largestSellWallChangeUSDT: largestSellWallChange.value,
        largestSellWallChangePct: largestSellWallChange.percent,

        depth1ChangeUSDT: depthChanges.depth1ChangeUSDT,
        depth3ChangeUSDT: depthChanges.depth3ChangeUSDT,
        depth5ChangeUSDT: depthChanges.depth5ChangeUSDT,
        depth10ChangeUSDT: depthChanges.depth10ChangeUSDT,
        depth30ChangeUSDT: depthChanges.depth30ChangeUSDT,

        buyPressureScore: scores.buyPressureScore,
        sellPressureScore: scores.sellPressureScore,
        liquidityFlowScore: scores.liquidityFlowScore,
        volatilityScore: scores.volatilityScore,
        wallActivityScore: scores.wallActivityScore,

        summary,
      },
    });
  }
}