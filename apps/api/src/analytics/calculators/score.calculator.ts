type ScoreInput = {
  priceChangePct: number;
  buyLiquidityChangePct: number;
  sellLiquidityChangePct: number;
  imbalanceChangePct: number;
  largestBuyWallChangePct: number;
  largestSellWallChangePct: number;
  spreadChangePct: number;
};

// Обмежує score в межах 0–100
function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

// Перші прості scoring-формули v1
export function calculateScores(input: ScoreInput) {
  const buyPressureScore = clampScore(
    50 +
      input.buyLiquidityChangePct * 1.5 +
      input.imbalanceChangePct * 2 +
      input.largestBuyWallChangePct
  );

  const sellPressureScore = clampScore(
    50 +
      input.sellLiquidityChangePct * 1.5 -
      input.imbalanceChangePct * 2 +
      input.largestSellWallChangePct
  );

  const liquidityFlowScore = clampScore(
    50 +
      (input.buyLiquidityChangePct - input.sellLiquidityChangePct) * 1.2
  );

  const volatilityScore = clampScore(
    Math.abs(input.priceChangePct) * 10 + Math.abs(input.spreadChangePct) * 2
  );

  const wallActivityScore = clampScore(
    Math.abs(input.largestBuyWallChangePct) +
      Math.abs(input.largestSellWallChangePct)
  );

  return {
    buyPressureScore,
    sellPressureScore,
    liquidityFlowScore,
    volatilityScore,
    wallActivityScore,
  };
}