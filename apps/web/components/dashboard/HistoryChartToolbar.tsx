import type { HistoryChartType, HistoryTimeframe } from "../../types/chart";
import { HISTORY_TIMEFRAMES } from "../../types/chart";

type Props = {
  timeframe: HistoryTimeframe;
  chartType: HistoryChartType;
  onTimeframeChange: (timeframe: HistoryTimeframe) => void;
  onChartTypeChange: (chartType: HistoryChartType) => void;
};

export function HistoryChartToolbar({
  timeframe,
  chartType,
  onTimeframeChange,
  onChartTypeChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-xl border border-cyan-400/20 bg-black/30 p-1">
        {HISTORY_TIMEFRAMES.map((option) => (
          <button
            key={option.value}
            onClick={() => onTimeframeChange(option.value)}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              timeframe === option.value
                ? "bg-cyan-400/20 text-cyan-200"
                : "text-slate-400 hover:text-cyan-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex rounded-xl border border-cyan-400/20 bg-black/30 p-1">
        <button
          onClick={() => onChartTypeChange("candles")}
          className={`rounded-lg px-3 py-2 text-sm transition ${
            chartType === "candles"
              ? "bg-cyan-400/20 text-cyan-200"
              : "text-slate-400 hover:text-cyan-200"
          }`}
        >
          Candles
        </button>

        <button
          onClick={() => onChartTypeChange("line")}
          className={`rounded-lg px-3 py-2 text-sm transition ${
            chartType === "line"
              ? "bg-cyan-400/20 text-cyan-200"
              : "text-slate-400 hover:text-cyan-200"
          }`}
        >
          Line
        </button>
      </div>
    </div>
  );
}