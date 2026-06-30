type Props = {
  limit: number;
  onChange: (limit: number) => void;
};

const OPTIONS = [
  { label: "1H", value: 60 },
  { label: "4H", value: 240 },
  { label: "12H", value: 720 },
  { label: "24H", value: 1440 },
];

export function HistoryRangeSelector({ limit, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-cyan-400/20 bg-black/30 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-2 text-sm transition ${
            limit === option.value
              ? "bg-cyan-400/20 text-cyan-200"
              : "text-slate-400 hover:text-cyan-200"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}