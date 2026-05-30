"use client";

import { useState, useCallback } from "react";
import { Deck, Card } from "@/types";
import { getGame } from "@/lib/games";
import { getCardImageUrl } from "@/lib/card-images";
import NextImage from "next/image";
import { Shuffle, RotateCcw, Plus } from "lucide-react";

interface PlaytestPanelProps {
  deck: Deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDrawPile(deck: Deck): Card[] {
  const pile: Card[] = [];
  for (const { card, quantity } of deck.cards) {
    for (let i = 0; i < quantity; i++) pile.push(card);
  }
  return shuffle(pile);
}

function MiniCardFace({ card }: { card: Card }) {
  const imageUrl = getCardImageUrl(card);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 shadow-lg">
      {imageUrl && !imgFailed ? (
        <NextImage
          src={imageUrl}
          alt={card.name}
          fill
          sizes="80px"
          className="object-cover object-top"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-1 gap-1">
          <span className="text-base leading-none">
            {card.type.toLowerCase().includes("monster") || card.type.toLowerCase().includes("creature") ||
             card.type.toLowerCase().includes("digimon") || card.type.toLowerCase().includes("unit") ||
             card.type.toLowerCase().includes("character") ? "⚔️" : "🃏"}
          </span>
          <p className="text-[8px] text-white/50 text-center leading-tight line-clamp-3">{card.name}</p>
        </div>
      )}
    </div>
  );
}

function CardBack() {
  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 border border-white/10 shadow-lg flex items-center justify-center">
      <span className="text-white/20 text-2xl">🃏</span>
    </div>
  );
}

export function PlaytestPanel({ deck }: PlaytestPanelProps) {
  const game = getGame(deck.game);
  const handSize = game.openingHandSize;
  const deckSize = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  const [pile, setPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [drawn, setDrawn] = useState(0);
  const [started, setStarted] = useState(false);

  const deal = useCallback(() => {
    const newPile = buildDrawPile(deck);
    const newHand = newPile.slice(0, handSize);
    setPile(newPile.slice(handSize));
    setHand(newHand);
    setDrawn(handSize);
    setStarted(true);
  }, [deck, handSize]);

  const drawOne = () => {
    if (pile.length === 0) return;
    setHand((h) => [...h, pile[0]]);
    setPile((p) => p.slice(1));
    setDrawn((d) => d + 1);
  };

  const mulligan = () => {
    deal();
  };

  const reset = () => {
    setPile([]);
    setHand([]);
    setDrawn(0);
    setStarted(false);
  };

  if (deckSize === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Shuffle className="w-10 h-10 text-white/10 mb-3" />
        <p className="text-white/40 text-sm font-medium">Add cards to your deck first</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
        <Shuffle className="w-12 h-12 text-white/20" />
        <div>
          <p className="text-white font-bold text-base">Playtest Simulator</p>
          <p className="text-white/35 text-xs mt-1">
            Shuffle your {deckSize}-card deck and draw an opening hand of {handSize}
          </p>
        </div>
        <button
          onClick={deal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-sm font-semibold text-blue-300 transition-all"
        >
          <Shuffle className="w-4 h-4" />
          Draw Opening Hand
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="flex-1 glass rounded-xl px-3 py-2">
          <p className="text-[10px] text-white/35">Hand · {hand.length} cards</p>
          <p className="text-[10px] text-white/25">{pile.length} remain in deck</p>
        </div>
        <button
          onClick={drawOne}
          disabled={pile.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
        >
          <Plus className="w-3.5 h-3.5" />
          Draw
        </button>
        <button
          onClick={mulligan}
          className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-xs font-semibold text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Mulligan
        </button>
        <button
          onClick={reset}
          className="p-2 glass rounded-xl text-white/25 hover:text-white/60 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hand */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-4 gap-2">
          {hand.map((card, i) => (
            <MiniCardFace key={`${card.id}-${drawn}-${i}`} card={card} />
          ))}
          {/* Show deck back tiles */}
          {pile.slice(0, Math.min(4, pile.length)).map((_, i) => (
            <CardBack key={`back-${i}`} />
          ))}
        </div>

        {/* Card name list below grid for reference */}
        <div className="mt-3 space-y-1">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5">Opening Hand</p>
          {hand.map((card, i) => (
            <div key={`name-${card.id}-${i}`} className="flex items-center gap-2 px-2 py-1 glass rounded-lg">
              <span className="text-xs text-white/70 truncate flex-1">{card.name}</span>
              <span className="text-[10px] text-white/25 shrink-0">{card.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
