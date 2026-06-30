import type { DashboardMode } from "../../types/dashboard";

type Props = {
  mode: DashboardMode;
  onChange: (mode: DashboardMode) => void;
};

export function DashboardModeTabs({ mode, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-cyan-400/20 bg-black/30 p-1">
      <button
        onClick={() => onChange("live")}
        className={`rounded-lg px-4 py-2 text-sm transition ${
          mode === "live"
            ? "bg-cyan-400/20 text-cyan-200"
            : "text-slate-400 hover:text-cyan-200"
        }`}
      >
        LIVE
      </button>

      <button
        onClick={() => onChange("history")}
        className={`rounded-lg px-4 py-2 text-sm transition ${
          mode === "history"
            ? "bg-cyan-400/20 text-cyan-200"
            : "text-slate-400 hover:text-cyan-200"
        }`}
      >
        HISTORY
      </button>
    </div>
  );
}