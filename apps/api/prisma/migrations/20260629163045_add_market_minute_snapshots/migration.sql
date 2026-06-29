-- CreateTable
CREATE TABLE "MarketMinuteSnapshot" (
    "id" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "minute" TIMESTAMP(3) NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "highPrice" DOUBLE PRECISION NOT NULL,
    "lowPrice" DOUBLE PRECISION NOT NULL,
    "closePrice" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "avgBuyValueUSDT" DOUBLE PRECISION NOT NULL,
    "avgSellValueUSDT" DOUBLE PRECISION NOT NULL,
    "avgTotalValueUSDT" DOUBLE PRECISION NOT NULL,
    "avgDiffUSDT" DOUBLE PRECISION NOT NULL,
    "avgImbalancePercent" DOUBLE PRECISION NOT NULL,
    "avgSpread" DOUBLE PRECISION NOT NULL,
    "minImbalancePercent" DOUBLE PRECISION NOT NULL,
    "maxImbalancePercent" DOUBLE PRECISION NOT NULL,
    "samplesCount" INTEGER NOT NULL,
    "depthZones" JSONB NOT NULL,
    "lastState" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketMinuteSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketMinuteSnapshot_symbol_minute_idx" ON "MarketMinuteSnapshot"("symbol", "minute");

-- CreateIndex
CREATE INDEX "MarketMinuteSnapshot_exchange_minute_idx" ON "MarketMinuteSnapshot"("exchange", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "MarketMinuteSnapshot_exchange_symbol_minute_key" ON "MarketMinuteSnapshot"("exchange", "symbol", "minute");
