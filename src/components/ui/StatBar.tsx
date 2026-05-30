"use client";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
  size?: "sm" | "md";
}

function getBarColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.7) return "from-green-500 to-emerald-400";
  if (pct >= 0.45) return "from-yellow-500 to-amber-400";
  return "from-red-500 to-rose-400";
}

export function StatBar({ label, value, max = 100, color, showValue = true, size = "md" }: StatBarProps) {
  const pct = Math.round((value / max) * 100);
  const barColor = color || getBarColor(value, max);
  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/35 font-medium">{label}</span>
        {showValue && (
          <span className="text-xs font-bold text-white/70">{value}%</span>
        )}
      </div>
      <div className={`w-full ${height} bg-white/[0.07] rounded-full overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
