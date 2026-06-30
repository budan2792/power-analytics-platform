-- CreateTable
CREATE TABLE "MarketMinuteAnalytics" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "minute" TIMESTAMP(3) NOT NULL,
    "priceChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "buyLiquidityChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "buyLiquidityChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellLiquidityChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellLiquidityChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLiquidityChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLiquidityChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imbalanceChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spreadChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spreadChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestBuyWallChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestBuyWallChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestSellWallChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestSellWallChangePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depth1ChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depth3ChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depth5ChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depth10ChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depth30ChangeUSDT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "buyPressureScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellPressureScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liquidityFlowScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "volatilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wallActivityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketMinuteAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketMinuteAnalytics_snapshotId_key" ON "MarketMinuteAnalytics"("snapshotId");

-- CreateIndex
CREATE INDEX "MarketMinuteAnalytics_symbol_minute_idx" ON "MarketMinuteAnalytics"("symbol", "minute");

-- CreateIndex
CREATE INDEX "MarketMinuteAnalytics_exchange_minute_idx" ON "MarketMinuteAnalytics"("exchange", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "MarketMinuteAnalytics_exchange_symbol_minute_key" ON "MarketMinuteAnalytics"("exchange", "symbol", "minute");

-- AddForeignKey
ALTER TABLE "MarketMinuteAnalytics" ADD CONSTRAINT "MarketMinuteAnalytics_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "MarketMinuteSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
