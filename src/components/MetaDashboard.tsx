"use client";

import { TCGGame } from "@/types";
import { getGame } from "@/lib/games";
import { Trophy, Target, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetaDeck {
  name: string;
  tier: string;
  winRate: number;
  popularity: number;
  trend?: "up" | "down" | "stable";
  keyCards?: string[];
}

const META_DATA: Record<TCGGame, {
  topDecks: MetaDeck[];
  banlistDate: string;
  recentChanges: string[];
}> = {
  onepiece: {
    topDecks: [
      { name: "Luffy/Zoro Blue-Black", tier: "S", winRate: 64, popularity: 22, trend: "up", keyCards: ["Monkey D. Luffy", "Zoro"] },
      { name: "Egghead Vegapunk", tier: "A", winRate: 58, popularity: 18, trend: "stable", keyCards: ["Vegapunk"] },
      { name: "Shanks Red-Purple", tier: "A", winRate: 57, popularity: 15, trend: "up", keyCards: ["Shanks"] },
      { name: "Law/Kidd", tier: "B", winRate: 52, popularity: 12, trend: "down", keyCards: ["Trafalgar Law"] },
    ],
    banlistDate: "March 2025",
    recentChanges: ["Sakazuki added to watchlist", "Uta limited to 2"],
  },
  yugioh: {
    topDecks: [
      { name: "Snake-Eye Fire King", tier: "S", winRate: 68, popularity: 28, trend: "stable", keyCards: ["Snake-Eye Ash", "Diabellstar"] },
      { name: "Yubel", tier: "A", winRate: 61, popularity: 20, trend: "up", keyCards: ["Yubel"] },
      { name: "Ryzeal", tier: "A", winRate: 59, popularity: 17, trend: "up", keyCards: ["Ryzeal"] },
      { name: "Sky Striker", tier: "B", winRate: 53, popularity: 11, trend: "down", keyCards: ["Raye"] },
    ],
    banlistDate: "April 2025",
    recentChanges: ["Diabellstar banned", "Snake-Eye Ash limited"],
  },
  digimon: {
    topDecks: [
      { name: "Mega Zero/Bloomlord", tier: "S", winRate: 66, popularity: 25, trend: "up", keyCards: ["Agumon"] },
      { name: "D-Reaper", tier: "A", winRate: 60, popularity: 19, trend: "stable", keyCards: ["D-Reaper"] },
      { name: "Numemon", tier: "A", winRate: 58, popularity: 14, trend: "up", keyCards: ["Numemon"] },
      { name: "Royal Knights", tier: "B", winRate: 54, popularity: 10, trend: "stable", keyCards: ["Omnimon"] },
    ],
    banlistDate: "February 2025",
    recentChanges: ["Sakuyamon: Miko Mode restricted"],
  },
  pokemon: {
    topDecks: [
      { name: "Charizard ex", tier: "S", winRate: 65, popularity: 30, trend: "stable", keyCards: ["Charizard ex", "Pidgeot ex"] },
      { name: "Gardevoir ex", tier: "A", winRate: 62, popularity: 22, trend: "up", keyCards: ["Gardevoir ex"] },
      { name: "Regidrago VSTAR", tier: "A", winRate: 58, popularity: 16, trend: "down", keyCards: ["Regidrago VSTAR"] },
      { name: "Chien-Pao ex", tier: "B", winRate: 54, popularity: 12, trend: "stable", keyCards: ["Chien-Pao ex"] },
    ],
    banlistDate: "March 2025",
    recentChanges: ["Radiant Charizard restricted to 1"],
  },
  mtg: {
    topDecks: [
      { name: "Nadu Combo", tier: "S", winRate: 72, popularity: 20, trend: "stable", keyCards: ["Nadu", "Shuko"] },
      { name: "Izzet Murktide", tier: "A", winRate: 63, popularity: 18, trend: "down", keyCards: ["Murktide Regent"] },
      { name: "Burn", tier: "A", winRate: 59, popularity: 15, trend: "stable", keyCards: ["Lightning Bolt"] },
      { name: "Rhinos", tier: "B", winRate: 55, popularity: 13, trend: "up", keyCards: ["Crashing Footfalls"] },
    ],
    banlistDate: "May 2025",
    recentChanges: ["Nadu, Winged Wisdom banned"],
  },
  dbs: {
    topDecks: [
      { name: "Vegeta/Freezer", tier: "S", winRate: 63, popularity: 24, trend: "stable", keyCards: ["Vegeta", "Frieza"] },
      { name: "Gohan Beast", tier: "A", winRate: 59, popularity: 19, trend: "up", keyCards: ["Gohan"] },
      { name: "Jiren", tier: "B", winRate: 54, popularity: 14, trend: "down", keyCards: ["Jiren"] },
      { name: "Broly", tier: "B", winRate: 52, popularity: 11, trend: "stable", keyCards: ["Broly"] },
    ],
    banlistDate: "January 2025",
    recentChanges: ["Son Goku Limit Burst restricted"],
  },
  dbsfusion: {
    topDecks: [
      { name: "Gohan/Pan", tier: "S", winRate: 66, popularity: 26, trend: "up", keyCards: ["Son Gohan", "Pan"] },
      { name: "Vegeta Blue", tier: "A", winRate: 60, popularity: 20, trend: "stable", keyCards: ["Vegeta"] },
      { name: "Broly FW", tier: "A", winRate: 57, popularity: 15, trend: "down", keyCards: ["Broly"] },
      { name: "Frieza Army", tier: "B", winRate: 51, popularity: 10, trend: "stable", keyCards: ["Frieza"] },
    ],
    banlistDate: "February 2025",
    recentChanges: ["Omega Shenron added to limited list"],
  },
  unionarena: {
    topDecks: [
      { name: "Ichigo Kurosaki", tier: "S", winRate: 64, popularity: 28, trend: "up", keyCards: ["Ichigo"] },
      { name: "Naruto Uzumaki", tier: "A", winRate: 60, popularity: 22, trend: "stable", keyCards: ["Naruto"] },
      { name: "Goku/Vegeta", tier: "A", winRate: 57, popularity: 16, trend: "down", keyCards: ["Goku"] },
      { name: "Saber", tier: "B", winRate: 52, popularity: 10, trend: "stable", keyCards: ["Saber"] },
    ],
    banlistDate: "March 2025",
    recentChanges: ["No recent changes"],
  },
  gundam: {
    topDecks: [
      { name: "RX-78 Aggro", tier: "S", winRate: 62, popularity: 30, trend: "stable", keyCards: ["Gundam RX-78-2"] },
      { name: "Zeon Control", tier: "A", winRate: 58, popularity: 22, trend: "up", keyCards: ["Char's Zaku II"] },
      { name: "Seed Strike Freedom", tier: "A", winRate: 56, popularity: 17, trend: "stable", keyCards: ["Strike Freedom"] },
      { name: "Turn A", tier: "B", winRate: 51, popularity: 12, trend: "down", keyCards: ["Turn A Gundam"] },
    ],
    banlistDate: "February 2025",
    recentChanges: ["Char's Zaku II limited to 2"],
  },
  lorcana: {
    topDecks: [
      { name: "Amber/Amethyst Control", tier: "S", winRate: 65, popularity: 28, trend: "stable", keyCards: ["Maleficent", "Elsa"] },
      { name: "Ruby/Sapphire Aggro", tier: "A", winRate: 60, popularity: 22, trend: "up", keyCards: ["Mickey Mouse"] },
      { name: "Emerald/Steel Midrange", tier: "A", winRate: 57, popularity: 18, trend: "stable", keyCards: ["Moana"] },
      { name: "Amber/Emerald Ramp", tier: "B", winRate: 53, popularity: 14, trend: "down", keyCards: ["Simba"] },
    ],
    banlistDate: "April 2026",
    recentChanges: ["No cards currently banned in Lorcana"],
  },
  swu: {
    topDecks: [
      { name: "Luke Skywalker Aggro", tier: "S", winRate: 63, popularity: 26, trend: "up", keyCards: ["Luke Skywalker"] },
      { name: "Vader Control", tier: "A", winRate: 59, popularity: 22, trend: "stable", keyCards: ["Darth Vader"] },
      { name: "Boba Fett Bounty", tier: "A", winRate: 57, popularity: 18, trend: "down", keyCards: ["Boba Fett"] },
      { name: "Han Solo Ramp", tier: "B", winRate: 52, popularity: 14, trend: "stable", keyCards: ["Han Solo"] },
    ],
    banlistDate: "May 2026",
    recentChanges: ["No cards currently banned in Star Wars: Unlimited"],
  },
};

const TIER_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; headerBg: string }> = {
  S: { label: "S Tier", bg: "bg-yellow-500/15", text: "text-yellow-300", border: "border-yellow-500/40", headerBg: "bg-yellow-500/20" },
  A: { label: "A Tier", bg: "bg-green-500/15",  text: "text-green-300",  border: "border-green-500/40",  headerBg: "bg-green-500/20"  },
  B: { label: "B Tier", bg: "bg-blue-500/15",   text: "text-blue-300",   border: "border-blue-500/40",   headerBg: "bg-blue-500/20"   },
  C: { label: "C Tier", bg: "bg-gray-500/15",   text: "text-gray-300",   border: "border-gray-500/40",   headerBg: "bg-gray-500/20"   },
};

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-400" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-gray-500" />;
}

function WinRateBar({ rate }: { rate: number }) {
  const barColor = rate >= 60 ? "bg-green-500" : rate >= 55 ? "bg-yellow-500" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, (rate / 75) * 100)}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${rate >= 60 ? "text-green-400" : rate >= 55 ? "text-yellow-400" : "text-blue-400"}`}>
        {rate}%
      </span>
    </div>
  );
}

interface MetaDashboardProps {
  game: TCGGame;
}

export function MetaDashboard({ game }: MetaDashboardProps) {
  const gameConfig = getGame(game);
  const meta = META_DATA[game];

  // Group decks by tier
  const tiers = ["S", "A", "B", "C"];
  const grouped = tiers.map(t => ({
    tier: t,
    decks: meta.topDecks.filter(d => d.tier === t),
  })).filter(g => g.decks.length > 0);

  const topWinRate = Math.max(...meta.topDecks.map(d => d.winRate));
  const avgWinRate = Math.round(meta.topDecks.reduce((s, d) => s + d.winRate, 0) / meta.topDecks.length);

  return (
    <div className="h-full overflow-y-auto">
      {/* Game Banner */}
      <div className={`relative bg-gradient-to-br ${gameConfig.gradient} px-4 pt-5 pb-6 overflow-hidden`}>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none pointer-events-none">
          {gameConfig.icon}
        </span>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-0.5">Meta Snapshot</p>
        <h2 className="text-xl font-extrabold text-white">{gameConfig.name}</h2>
        <p className="text-xs text-white/60 mt-0.5">{meta.banlistDate} Format</p>

        {/* Quick stats row */}
        <div className="flex items-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{topWinRate}%</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Top WR</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">{avgWinRate}%</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Avg WR</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">{meta.topDecks.length}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Top Decks</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tier sections */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Tier List</h3>
          </div>

          <div className="space-y-3">
            {grouped.map(({ tier, decks }) => {
              const cfg = TIER_CONFIG[tier];
              return (
                <div key={tier} className={`rounded-xl border ${cfg.border} overflow-hidden`}>
                  {/* Tier header */}
                  <div className={`${cfg.headerBg} px-3 py-1.5 flex items-center gap-2`}>
                    <span className={`text-sm font-black ${cfg.text}`}>{tier}</span>
                    <span className="text-xs text-gray-400">{cfg.label}</span>
                  </div>

                  {/* Decks in this tier */}
                  <div className="divide-y divide-gray-700/30">
                    {decks.map((deck, i) => (
                      <div key={i} className="px-3 py-2.5 bg-gray-800/40">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-white truncate">{deck.name}</span>
                              <TrendIcon trend={deck.trend} />
                            </div>
                            {deck.keyCards && (
                              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{deck.keyCards.join(", ")}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-500">{deck.popularity}% usage</p>
                          </div>
                        </div>
                        <WinRateBar rate={deck.winRate} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Banlist Changes */}
        <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-orange-300">Banlist Changes</h3>
            <span className="ml-auto text-[10px] text-orange-400/60">{meta.banlistDate}</span>
          </div>
          <ul className="space-y-1.5">
            {meta.recentChanges.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-orange-200">
                <span className="text-orange-400 shrink-0">•</span>
                {change}
              </li>
            ))}
          </ul>
        </div>

        {/* Format Rules */}
        <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Format Rules</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Deck Size</span>
              <span className="text-white font-medium">
                {gameConfig.deckSize.min === gameConfig.deckSize.max
                  ? `${gameConfig.deckSize.min} cards`
                  : `${gameConfig.deckSize.min}–${gameConfig.deckSize.max} cards`}
              </span>
            </div>
            {gameConfig.extraDeckSize && (
              <div className="flex justify-between">
                <span className="text-gray-400">Extra Deck</span>
                <span className="text-white font-medium">Up to {gameConfig.extraDeckSize}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Max Copies</span>
              <span className="text-white font-medium">
                {game === "pokemon" || game === "mtg" || game === "lorcana" || game === "digimon" || game === "unionarena" ? "4 per card" : "3 per card"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
