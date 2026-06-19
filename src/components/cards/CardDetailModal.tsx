"use client";

import { Card } from "@/types";
import { getCardImageUrl } from "@/lib/card-images";
import NextImage from "next/image";
import { X, Plus, Minus } from "lucide-react";

interface CardDetailModalProps {
  card: Card;
  quantity?: number;
  onAdd?: (card: Card) => void;
  onRemove?: (card: Card) => void;
  onClose: () => void;
}

function getColorBorder(color?: string): string {
  const c = (color ?? "").toLowerCase();
  if (c.includes("red") || c.includes("fire") || c.includes("ruby") || c.includes("aggression")) return "from-red-900/60";
  if (c.includes("blue") || c.includes("water") || c.includes("sapphire") || c.includes("vigilance")) return "from-blue-900/60";
  if (c.includes("green") || c.includes("wind") || c.includes("emerald") || c.includes("command") || c.includes("grass")) return "from-green-900/60";
  if (c.includes("yellow") || c.includes("lightning") || c.includes("electric") || c.includes("cunning") || c.includes("amber")) return "from-yellow-900/60";
  if (c.includes("purple") || c.includes("amethyst") || c.includes("psychic") || c.includes("villainy")) return "from-purple-900/60";
  if (c.includes("white") || c.includes("heroism")) return "from-slate-700/60";
  if (c.includes("black") || c.includes("shadow") || c.includes("dark")) return "from-black/80";
  return "from-slate-900/60";
}

const RARITY_LABELS: Record<string, string> = {
  "Secret Rare": "SEC", "Ultra Rare": "UR", "Super Rare": "SR",
  "Mythic Rare": "M", "Rare": "R", "Uncommon": "UC", "Common": "C",
  "Leader": "LDR", "Legendary": "L", "Legend Rare": "LGD",
  "Special Illustration Rare": "SIR", "Illustration Rare": "IR",
  "Hyper Rare": "HYP", "Mega Hyper Rare": "MHR",
};

function StatPill({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 glass rounded-xl min-w-[48px]">
      <span className={`text-xs font-bold ${color ?? "text-white"}`}>{value}</span>
      <span className="text-[9px] text-white/25 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function CardDetailModal({ card, quantity, onAdd, onRemove, onClose }: CardDetailModalProps) {
  const imageUrl = getCardImageUrl(card);
  const gradientFrom = getColorBorder(card.color);
  const rarityLabel = card.rarity ? (RARITY_LABELS[card.rarity] ?? card.rarity.slice(0, 3).toUpperCase()) : null;

  const hasStat = card.cost !== undefined || card.cmc !== undefined || card.level !== undefined ||
    card.atk !== undefined || card.def !== undefined || card.power !== undefined ||
    card.hp !== undefined || card.life !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-md rounded-t-2xl border-t border-white/[0.08] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Image + gradient header */}
          <div className={`relative bg-gradient-to-b ${gradientFrom} to-transparent mx-4 mt-2 rounded-2xl overflow-hidden`}>
            {imageUrl ? (
              <div className="flex justify-center py-3">
                <div className="relative w-36 h-52 rounded-xl overflow-hidden shadow-2xl">
                  <NextImage
                    src={imageUrl}
                    alt={card.name}
                    fill
                    sizes="144px"
                    className="object-cover object-top"
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-5xl">
                {card.type.toLowerCase().includes("monster") || card.type.toLowerCase().includes("character") ||
                 card.type.toLowerCase().includes("unit") || card.type.toLowerCase().includes("digimon")
                  ? "⚔️" : "🃏"}
              </div>
            )}
          </div>

          {/* Card identity */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-start gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-white leading-tight">{card.name}</h2>
                <p className="text-xs text-white/40 mt-0.5">
                  {card.type}{card.subtype ? ` · ${card.subtype}` : ""}
                  {card.attribute ? ` · ${card.attribute}` : ""}
                  {card.color ? ` · ${card.color}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {rarityLabel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 glass rounded text-white/50">{rarityLabel}</span>
                )}
                {card.set && (
                  <span className="text-[10px] text-white/25">{card.set}</span>
                )}
              </div>
            </div>

            {/* Ban/limit status */}
            {(card.banned || card.limited || card.semiLimited) && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {card.banned && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">BANNED</span>
                )}
                {card.limited && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">LIMITED TO 1</span>
                )}
                {card.semiLimited && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">SEMI-LIMITED</span>
                )}
              </div>
            )}
          </div>

          {/* Stats row */}
          {hasStat && (
            <div className="px-4 pb-3">
              <div className="flex gap-2 flex-wrap">
                {(card.cost !== undefined) && (
                  <StatPill label="Cost" value={card.cost} color="text-blue-300" />
                )}
                {(card.cmc !== undefined && card.cost === undefined) && (
                  <StatPill label="CMC" value={card.cmc} color="text-blue-300" />
                )}
                {card.level !== undefined && (
                  <StatPill label="Level" value={card.level} color="text-yellow-300" />
                )}
                {card.hp !== undefined && (
                  <StatPill label="HP" value={card.hp} color="text-emerald-400" />
                )}
                {card.life !== undefined && (
                  <StatPill label="Life" value={card.life} color="text-pink-400" />
                )}
                {card.atk !== undefined && (
                  <StatPill label="ATK" value={card.atk.toLocaleString()} color="text-red-400" />
                )}
                {card.def !== undefined && (
                  <StatPill label="DEF" value={card.def.toLocaleString()} color="text-blue-400" />
                )}
                {card.power !== undefined && card.atk === undefined && (
                  <StatPill label="PWR" value={card.power.toLocaleString()} color="text-orange-400" />
                )}
                {card.manaCost && (
                  <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 glass rounded-xl">
                    <span className="text-xs font-bold text-purple-300 font-mono">{card.manaCost}</span>
                    <span className="text-[9px] text-white/25 uppercase tracking-wide">Mana</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description / Effect */}
          {(card.description || card.effect) && (
            <div className="mx-4 mb-3 glass rounded-xl px-3 py-3">
              {card.description && (
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{card.description}</p>
              )}
              {card.effect && card.effect !== card.description && (
                <>
                  {card.description && <div className="my-2 h-px bg-white/[0.06]" />}
                  <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{card.effect}</p>
                </>
              )}
            </div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="px-4 pb-4 flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 glass rounded-full text-white/30">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Sticky action bar */}
        {(onAdd || onRemove) && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
            {quantity !== undefined ? (
              <div className="flex items-center gap-3 flex-1">
                {onRemove && (
                  <button
                    onClick={() => onRemove(card)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 glass hover:bg-red-500/20 border border-white/[0.07] hover:border-red-500/30 rounded-xl text-sm font-semibold text-white/70 hover:text-red-400 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                    Remove
                  </button>
                )}
                <span className="text-lg font-black text-white w-8 text-center">{quantity}×</span>
                {onAdd && (
                  <button
                    onClick={() => onAdd(card)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-sm font-semibold text-blue-300 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                )}
              </div>
            ) : onAdd ? (
              <button
                onClick={() => onAdd(card)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-sm font-semibold text-blue-300 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add to Deck
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
