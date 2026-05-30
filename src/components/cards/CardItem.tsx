"use client";

import { Card, Deck } from "@/types";
import { calculateCardSynergy } from "@/lib/synergy-engine";
import { SynergyBadge } from "@/components/ui/SynergyBadge";
import { Plus, Minus } from "lucide-react";

interface CardItemProps {
  card: Card;
  deck?: Deck;
  quantity?: number;
  showSynergy?: boolean;
  onAdd?: (card: Card) => void;
  onRemove?: (card: Card) => void;
  compact?: boolean;
}

// Maps card color string → Tailwind left-border class
function getColorBorder(color?: string): string {
  const c = (color || "").toLowerCase();
  if (c.includes("red") || c.includes("fire") || c.includes("ruby") || c.includes("aggression")) return "border-l-red-500";
  if (c.includes("blue") || c.includes("water") || c.includes("sapphire") || c.includes("vigilance")) return "border-l-blue-500";
  if (c.includes("green") || c.includes("wind") || c.includes("emerald") || c.includes("command") || c.includes("grass") || c.includes("nature")) return "border-l-green-500";
  if (c.includes("yellow") || c.includes("lightning") || c.includes("electric") || c.includes("cunning") || c.includes("amber") || c.includes("light")) return "border-l-yellow-400";
  if (c.includes("purple") || c.includes("amethyst") || c.includes("psychic") || c.includes("villainy")) return "border-l-purple-500";
  if (c.includes("dark")) return "border-l-violet-700";
  if (c.includes("white") || c.includes("heroism")) return "border-l-slate-300";
  if (c.includes("black") || c.includes("shadow")) return "border-l-gray-500";
  if (c.includes("multi") || c.includes("gold")) return "border-l-yellow-500";
  if (c.includes("steel") || c.includes("metal") || c.includes("colorless")) return "border-l-slate-400";
  if (c.includes("earth") || c.includes("brown")) return "border-l-amber-700";
  if (c.includes("orange")) return "border-l-orange-500";
  return "border-l-gray-600";
}

// Maps card color string → Tailwind background class for the dot
function getColorDot(color?: string): string {
  const c = (color || "").toLowerCase();
  if (c.includes("red") || c.includes("fire") || c.includes("ruby") || c.includes("aggression")) return "bg-red-500";
  if (c.includes("blue") || c.includes("water") || c.includes("sapphire") || c.includes("vigilance")) return "bg-blue-500";
  if (c.includes("green") || c.includes("wind") || c.includes("emerald") || c.includes("command") || c.includes("grass")) return "bg-green-500";
  if (c.includes("yellow") || c.includes("lightning") || c.includes("electric") || c.includes("cunning") || c.includes("amber") || c.includes("light")) return "bg-yellow-400";
  if (c.includes("purple") || c.includes("amethyst") || c.includes("psychic") || c.includes("villainy")) return "bg-purple-500";
  if (c.includes("dark")) return "bg-violet-700";
  if (c.includes("white") || c.includes("heroism")) return "bg-slate-300";
  if (c.includes("black") || c.includes("shadow")) return "bg-gray-500";
  if (c.includes("multi") || c.includes("gold")) return "bg-yellow-500";
  if (c.includes("steel") || c.includes("colorless")) return "bg-slate-400";
  if (c.includes("earth")) return "bg-amber-700";
  if (c.includes("orange")) return "bg-orange-500";
  return "bg-gray-500";
}

// Returns an emoji icon for a card type
function getTypeIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("digi-egg") || t.includes("egg")) return "🥚";
  if (t.includes("tamer")) return "🎯";
  if (t.includes("pilot")) return "🎖️";
  if (t.includes("leader")) return "👑";
  if (t.includes("land") || t.includes("base")) return "🏔️";
  if (t.includes("planeswalker")) return "🌟";
  if (t.includes("enchantment")) return "🔮";
  if (t.includes("artifact")) return "⚙️";
  if (t.includes("upgrade") || t.includes("item")) return "🔧";
  if (t.includes("trap")) return "🪤";
  if (t.includes("spell") || t.includes("instant") || t.includes("sorcery") || t.includes("action") || t.includes("event") || t.includes("option") || t.includes("command") || t.includes("extra")) return "✨";
  if (t.includes("final memory") || t.includes("site")) return "💫";
  if (t.includes("monster") || t.includes("creature") || t.includes("unit") || t.includes("character") || t.includes("digimon") || t.includes("battle")) return "⚔️";
  return "🃏";
}

interface RarityConfig { label: string; bg: string; text: string }
const RARITY: Record<string, RarityConfig> = {
  "Secret Rare":                { label: "SEC", bg: "bg-yellow-400/20", text: "text-yellow-300" },
  "Special Illustration Rare":  { label: "SIR", bg: "bg-yellow-300/20", text: "text-yellow-200" },
  "Hyper Rare":                 { label: "HYP", bg: "bg-pink-400/20",   text: "text-pink-300"   },
  "Mega Hyper Rare":            { label: "MHR", bg: "bg-pink-500/20",   text: "text-pink-200"   },
  "Ultra Rare":                 { label: "UR",  bg: "bg-yellow-500/20", text: "text-yellow-400" },
  "Super Rare":                 { label: "SR",  bg: "bg-blue-400/20",   text: "text-blue-300"   },
  "Illustration Rare":          { label: "IR",  bg: "bg-sky-400/20",    text: "text-sky-300"    },
  "Mythic Rare":                { label: "M",   bg: "bg-orange-400/20", text: "text-orange-400" },
  "Legendary":                  { label: "L",   bg: "bg-orange-400/20", text: "text-orange-300" },
  "Legend Rare":                { label: "LGD", bg: "bg-orange-300/20", text: "text-orange-300" },
  "Rare":                       { label: "R",   bg: "bg-purple-400/20", text: "text-purple-300" },
  "Uncommon":                   { label: "UC",  bg: "bg-gray-500/20",   text: "text-gray-400"   },
  "Leader":                     { label: "LDR", bg: "bg-amber-500/20",  text: "text-amber-400"  },
  "Common":                     { label: "C",   bg: "bg-gray-700/40",   text: "text-gray-500"   },
};

function RarityBadge({ rarity }: { rarity?: string }) {
  if (!rarity) return null;
  const cfg = RARITY[rarity] ?? { label: rarity.slice(0, 3).toUpperCase(), bg: "bg-gray-700/40", text: "text-gray-500" };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

export function CardItem({ card, deck, quantity, showSynergy = true, onAdd, onRemove, compact = false }: CardItemProps) {
  const synergy = deck && showSynergy ? calculateCardSynergy(card, deck) : null;
  const borderColor = getColorBorder(card.color);
  const dotColor = getColorDot(card.color);
  const typeIcon = getTypeIcon(card.type);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 pl-0 pr-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700/50 border-l-4 ${borderColor} overflow-hidden ${card.banned ? "opacity-50" : ""}`}>
        {/* Type icon */}
        <span className="text-sm pl-2 shrink-0">{typeIcon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-white truncate">{card.name}</span>
            {card.banned && <span className="text-[10px] bg-red-500/30 text-red-400 px-1 rounded font-bold">BAN</span>}
            {card.limited && <span className="text-[10px] bg-orange-500/30 text-orange-400 px-1 rounded font-bold">LIM</span>}
            {card.semiLimited && <span className="text-[10px] bg-yellow-500/30 text-yellow-400 px-1 rounded font-bold">SL</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {card.color && <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotColor}`} />}
            <span className="text-xs text-gray-500 truncate">{card.type}</span>
            {card.cost !== undefined && <span className="text-xs text-blue-400 shrink-0">· {card.cost}</span>}
            {card.rarity && <RarityBadge rarity={card.rarity} />}
          </div>
        </div>

        {synergy && <SynergyBadge color={synergy.color} size="sm" />}

        {quantity !== undefined && (
          <div className="flex items-center gap-1 shrink-0">
            {onRemove && (
              <button onClick={() => onRemove(card)} className="w-5 h-5 rounded bg-gray-700 hover:bg-red-600 transition-colors flex items-center justify-center">
                <Minus className="w-3 h-3 text-white" />
              </button>
            )}
            <span className="w-5 text-center text-sm font-bold text-white">{quantity}</span>
            {onAdd && (
              <button onClick={() => onAdd(card)} className="w-5 h-5 rounded bg-gray-700 hover:bg-green-600 transition-colors flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        )}
        {quantity === undefined && onAdd && (
          <button onClick={() => onAdd(card)} className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-gray-800/60 border border-gray-700/50 border-l-4 ${borderColor} overflow-hidden hover:border-gray-600 transition-all hover:shadow-lg ${card.banned ? "opacity-60" : ""}`}>
      {/* Card Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base shrink-0">{typeIcon}</span>
              <h3 className="font-bold text-white text-sm leading-tight">{card.name}</h3>
              {card.banned && <span className="text-[10px] bg-red-500/30 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold">BANNED</span>}
              {card.limited && <span className="text-[10px] bg-orange-500/30 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full font-bold">LIMITED</span>}
              {card.semiLimited && <span className="text-[10px] bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-bold">SEMI</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {card.color && <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />}
              <span className="text-xs text-gray-400">{card.type}{card.subtype ? ` · ${card.subtype}` : ""}</span>
              {card.rarity && <RarityBadge rarity={card.rarity} />}
            </div>
          </div>
          {synergy && <SynergyBadge color={synergy.color} score={synergy.score} showLabel size="md" />}
        </div>
      </div>

      {/* Card Stats */}
      <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-1 text-xs border-t border-gray-700/30">
        {card.cost !== undefined && (
          <span className="text-blue-400">Cost {card.cost}</span>
        )}
        {card.level !== undefined && (
          <span className="text-yellow-400">Lv.{card.level}</span>
        )}
        {card.hp !== undefined && (
          <span className="text-green-400">HP {card.hp}</span>
        )}
        {card.atk !== undefined && (
          <span className="text-red-400">ATK {card.atk}</span>
        )}
        {card.def !== undefined && (
          <span className="text-blue-400">DEF {card.def}</span>
        )}
        {card.power !== undefined && card.atk === undefined && (
          <span className="text-orange-400">PWR {card.power.toLocaleString()}</span>
        )}
        {card.attribute && (
          <span className="text-gray-400">{card.attribute}</span>
        )}
        {card.manaCost && (
          <span className="text-purple-300 font-mono">{card.manaCost}</span>
        )}
      </div>

      {/* Description */}
      {card.description && (
        <div className="px-4 py-2 border-t border-gray-700/30">
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{card.description}</p>
        </div>
      )}

      {/* Synergy Reason */}
      {synergy?.reason && (
        <div className="px-4 py-2 border-t border-gray-700/30 bg-gray-900/30">
          <p className="text-xs text-gray-500 italic">{synergy.reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-700/30 flex items-center justify-between">
        {quantity !== undefined ? (
          <div className="flex items-center gap-2">
            {onRemove && (
              <button onClick={() => onRemove(card)} className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-red-600 transition-colors flex items-center justify-center">
                <Minus className="w-4 h-4 text-white" />
              </button>
            )}
            <span className="w-8 text-center font-bold text-white">{quantity}x</span>
            {onAdd && (
              <button onClick={() => onAdd(card)} className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-green-600 transition-colors flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}
        {onAdd && quantity === undefined && (
          <button onClick={() => onAdd(card)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add to Deck
          </button>
        )}
      </div>
    </div>
  );
}
