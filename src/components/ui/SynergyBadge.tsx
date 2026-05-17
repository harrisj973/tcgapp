"use client";

import { CardColor } from "@/types";

interface SynergyBadgeProps {
  color: CardColor;
  score?: number;
  reason?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const colorConfig = {
  green: {
    dot: "bg-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/50",
    text: "text-green-400",
    label: "High Synergy",
    glow: "shadow-green-500/30",
  },
  yellow: {
    dot: "bg-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    label: "Situational",
    glow: "shadow-yellow-500/30",
  },
  red: {
    dot: "bg-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/50",
    text: "text-red-400",
    label: "Low Synergy",
    glow: "shadow-red-500/30",
  },
  neutral: {
    dot: "bg-gray-400",
    bg: "bg-gray-500/20",
    border: "border-gray-500/50",
    text: "text-gray-400",
    label: "Neutral",
    glow: "shadow-gray-500/30",
  },
};

const sizeConfig = {
  sm: { dot: "w-2 h-2", text: "text-xs", padding: "px-1.5 py-0.5" },
  md: { dot: "w-2.5 h-2.5", text: "text-xs", padding: "px-2 py-1" },
  lg: { dot: "w-3 h-3", text: "text-sm", padding: "px-3 py-1.5" },
};

export function SynergyBadge({ color, score, reason, size = "md", showLabel = false }: SynergyBadgeProps) {
  const cfg = colorConfig[color];
  const sz = sizeConfig[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${sz.padding} shadow-sm ${cfg.glow}`}
      title={reason || cfg.label}
    >
      <div className={`rounded-full ${cfg.dot} ${sz.dot} animate-pulse`} />
      {showLabel && (
        <span className={`font-medium ${cfg.text} ${sz.text}`}>
          {score ? `${score}%` : cfg.label}
        </span>
      )}
    </div>
  );
}

export function SynergyIndicator({ color }: { color: CardColor }) {
  const icons = { green: "🟢", yellow: "🟡", red: "🔴", neutral: "⚪" };
  return <span className="text-sm">{icons[color]}</span>;
}
