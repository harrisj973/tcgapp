"use client";

import { useRef, useState } from "react";
import { Deck } from "@/types";
import { getGame } from "@/lib/games";
import { Download, X } from "lucide-react";

interface DecklistExportImageProps {
  deck: Deck;
  onClose: () => void;
}

export function DecklistExportImage({ deck, onClose }: DecklistExportImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const game = getGame(deck.game);
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  // Group by type for the text decklist
  const groups = new Map<string, Array<{ name: string; qty: number }>>();
  for (const { card, quantity } of deck.cards) {
    if (!groups.has(card.type)) groups.set(card.type, []);
    groups.get(card.type)!.push({ name: card.name, qty: quantity });
  }

  const handleSave = async () => {
    if (!ref.current) return;
    setSaving(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(ref.current!, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0a1a",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${deck.name.replace(/[^a-z0-9]/gi, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-md rounded-t-2xl border-t border-white/[0.08] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-sm font-bold text-white">Export as Image</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-xs font-semibold text-blue-300 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save PNG"}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exportable decklist card */}
        <div className="flex-1 overflow-y-auto p-4">
          <div
            ref={ref}
            className="rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d0d1f 0%, #0a0a1a 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Banner */}
            <div className={`bg-gradient-to-r ${game.gradient} px-4 py-3 flex items-center gap-3`}>
              <span className="text-2xl">{game.icon}</span>
              <div>
                <p className="text-white font-black text-base leading-tight">{deck.name}</p>
                <p className="text-white/70 text-xs">{game.name} · {total} cards</p>
              </div>
            </div>

            {/* Card list */}
            <div className="p-4 space-y-3">
              {deck.leader && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Leader</p>
                  <p className="text-xs text-white font-medium">1× {deck.leader.name}</p>
                </div>
              )}
              {Array.from(groups.entries()).map(([type, cards]) => {
                const typeTotal = cards.reduce((s, c) => s + c.qty, 0);
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">{type}</p>
                      <p className="text-[10px] text-white/20">({typeTotal})</p>
                    </div>
                    <div className="space-y-0.5">
                      {cards
                        .sort((a, b) => b.qty - a.qty)
                        .map(({ name, qty }) => (
                          <div key={name} className="flex items-center gap-2">
                            <span className="text-xs text-white/40 w-4 text-right shrink-0">{qty}×</span>
                            <span className="text-xs text-white/80">{name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 pb-3">
              <p className="text-[9px] text-white/15 text-right">Built with TCG Builder</p>
            </div>
          </div>

          <p className="text-[10px] text-white/20 text-center mt-3">
            Screenshot the card above, or tap Save PNG if your browser supports it.
          </p>
        </div>
      </div>
    </div>
  );
}
