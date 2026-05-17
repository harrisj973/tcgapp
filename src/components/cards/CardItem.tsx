"use client";

import { Card, Deck } from "@/types";
import { calculateCardSynergy } from "@/lib/synergy-engine";
import { SynergyBadge } from "@/components/ui/SynergyBadge";
import { Plus, Minus, Shield, Zap, Star } from "lucide-react";

interface CardItemProps {
  card: Card;
  deck?: Deck;
  quantity?: number;
  showSynergy?: boolean;
  onAdd?: (card: Card) => void;
  onRemove?: (card: Card) => void;
  compact?: boolean;
}

const rarityColor: Record<string, string> = {
  "Secret Rare": "text-yellow-300",
  "Ultra Rare": "text-yellow-400",
  "Super Rare": "text-blue-300",
  "Rare": "text-purple-300",
  "Leader": "text-orange-300",
  "Common": "text-gray-400",
  "Radiant Rare": "text-pink-300",
  "Mythic Rare": "text-orange-400",
};

export function CardItem({ card, deck, quantity, showSynergy = true, onAdd, onRemove, compact = false }: CardItemProps) {
  const synergy = deck && showSynergy ? calculateCardSynergy(card, deck) : null;

  const rarityText = rarityColor[card.rarity || "Common"] || "text-gray-400";

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700/50 ${card.banned ? "opacity-50" : ""}`}>
        {synergy && <SynergyBadge color={synergy.color} size="sm" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white truncate">{card.name}</span>
            {card.banned && <span className="text-[10px] bg-red-500/30 text-red-400 px-1 rounded">BAN</span>}
            {card.limited && <span className="text-[10px] bg-orange-500/30 text-orange-400 px-1 rounded">LIM</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{card.type}</span>
            {card.color && <span className="text-xs text-gray-500">• {card.color}</span>}
            {card.cost !== undefined && <span className="text-xs text-blue-400">Cost: {card.cost}</span>}
          </div>
        </div>
        {quantity !== undefined && (
          <div className="flex items-center gap-1.5">
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
          <button onClick={() => onAdd(card)} className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-gray-800/60 border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all hover:shadow-lg ${card.banned ? "opacity-60 border-red-800/50" : ""}`}>
      {/* Card Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-sm leading-tight">{card.name}</h3>
              {card.banned && (
                <span className="text-[10px] bg-red-500/30 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-medium">BANNED</span>
              )}
              {card.limited && (
                <span className="text-[10px] bg-orange-500/30 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full font-medium">LIMITED</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-gray-400">{card.type}{card.subtype ? ` • ${card.subtype}` : ""}</span>
              {card.rarity && <span className={`text-xs font-medium ${rarityText}`}>{card.rarity}</span>}
            </div>
          </div>
          {synergy && <SynergyBadge color={synergy.color} score={synergy.score} showLabel size="md" />}
        </div>
      </div>

      {/* Card Stats */}
      <div className="px-4 py-2 flex flex-wrap gap-3 text-xs border-t border-gray-700/30">
        {card.color && (
          <div className="flex items-center gap-1 text-gray-300">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            {card.color}
          </div>
        )}
        {card.cost !== undefined && (
          <div className="flex items-center gap-1 text-gray-300">
            <Zap className="w-3 h-3 text-yellow-400" />
            Cost {card.cost}
          </div>
        )}
        {card.power !== undefined && (
          <div className="flex items-center gap-1 text-gray-300">
            <Shield className="w-3 h-3 text-blue-400" />
            {card.power.toLocaleString()}
          </div>
        )}
        {card.atk !== undefined && (
          <div className="flex items-center gap-1 text-gray-300">
            <Zap className="w-3 h-3 text-red-400" />
            ATK {card.atk}
          </div>
        )}
        {card.def !== undefined && (
          <div className="flex items-center gap-1 text-gray-300">
            <Shield className="w-3 h-3 text-blue-400" />
            DEF {card.def}
          </div>
        )}
        {card.level !== undefined && (
          <div className="flex items-center gap-1 text-gray-300">
            <Star className="w-3 h-3 text-yellow-400" />
            Lv.{card.level}
          </div>
        )}
        {card.hp !== undefined && (
          <div className="flex items-center gap-1 text-gray-300">
            <Shield className="w-3 h-3 text-green-400" />
            HP {card.hp}
          </div>
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
              <button
                onClick={() => onRemove(card)}
                className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
            )}
            <span className="w-8 text-center font-bold text-white">{quantity}x</span>
            {onAdd && (
              <button
                onClick={() => onAdd(card)}
                className="w-7 h-7 rounded-lg bg-gray-700 hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}
        {onAdd && quantity === undefined && (
          <button
            onClick={() => onAdd(card)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Deck
          </button>
        )}
      </div>
    </div>
  );
}
