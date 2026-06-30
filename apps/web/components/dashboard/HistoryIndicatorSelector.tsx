import type { HistoricalIndicator } from "../../types/chart";
import { HISTORY_INDICATORS } from "../../types/chart";

type Props = {
  selected: HistoricalIndicator[];
  onChange: (selected: HistoricalIndicator[]) => void;
};

export function HistoryIndicatorSelector({ selected, onChange }: Props) {
  function toggle(indicator: HistoricalIndicator) {
    if (selected.includes(indicator)) {
      onChange(selected.filter((item) => item !== indicator));
      return;
    }

    onChange([...selected, indicator]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {HISTORY_INDICATORS.map((indicator) => (
        <button
          key={indicator.value}
          onClick={() => toggle(indicator.value)}
          className={`rounded-full border px-3 py-2 text-sm transition ${
            selected.includes(indicator.value)
              ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
              : "border-white/10 bg-black/20 text-slate-400 hover:border-cyan-400/40 hover:text-cyan-200"
          }`}
        >
          {indicator.label}
        </button>
      ))}
    </div>
  );
}