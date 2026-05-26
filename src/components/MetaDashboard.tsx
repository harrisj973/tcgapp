"use client";

import { TCGGame } from "@/types";
import { getGame } from "@/lib/games";
import { TrendingUp, Trophy, Target, Zap } from "lucide-react";

const META_DATA: Record<TCGGame, {
  topDecks: Array<{ name: string; tier: string; winRate: number; popularity: number }>;
  banlistDate: string;
  recentChanges: string[];
}> = {
  onepiece: {
    topDecks: [
      { name: "Luffy/Zoro Blue-Black", tier: "S", winRate: 64, popularity: 22 },
      { name: "Egghead Vegapunk", tier: "A", winRate: 58, popularity: 18 },
      { name: "Shanks Red-Purple", tier: "A", winRate: 57, popularity: 15 },
      { name: "Law/Kidd", tier: "B", winRate: 52, popularity: 12 },
    ],
    banlistDate: "March 2025",
    recentChanges: ["Sakazuki added to watchlist", "Uta limited to 2"],
  },
  yugioh: {
    topDecks: [
      { name: "Snake-Eye Fire King", tier: "S", winRate: 68, popularity: 28 },
      { name: "Yubel", tier: "A", winRate: 61, popularity: 20 },
      { name: "Ryzeal", tier: "A", winRate: 59, popularity: 17 },
      { name: "Sky Striker", tier: "B", winRate: 53, popularity: 11 },
    ],
    banlistDate: "April 2025",
    recentChanges: ["Diabellstar banned", "Snake-Eye Ash limited"],
  },
  digimon: {
    topDecks: [
      { name: "Mega Zero/Bloomlord", tier: "S", winRate: 66, popularity: 25 },
      { name: "D-Reaper", tier: "A", winRate: 60, popularity: 19 },
      { name: "Numemon", tier: "A", winRate: 58, popularity: 14 },
      { name: "Royal Knights", tier: "B", winRate: 54, popularity: 10 },
    ],
    banlistDate: "February 2025",
    recentChanges: ["Sakuyamon: Miko Mode restricted"],
  },
  pokemon: {
    topDecks: [
      { name: "Charizard ex", tier: "S", winRate: 65, popularity: 30 },
      { name: "Gardevoir ex", tier: "A", winRate: 62, popularity: 22 },
      { name: "Regidrago VSTAR", tier: "A", winRate: 58, popularity: 16 },
      { name: "Chien-Pao ex", tier: "B", winRate: 54, popularity: 12 },
    ],
    banlistDate: "March 2025",
    recentChanges: ["Radiant Charizard restricted to 1"],
  },
  mtg: {
    topDecks: [
      { name: "Nadu Combo", tier: "S", winRate: 72, popularity: 20 },
      { name: "Izzet Murktide", tier: "A", winRate: 63, popularity: 18 },
      { name: "Burn", tier: "A", winRate: 59, popularity: 15 },
      { name: "Rhinos", tier: "B", winRate: 55, popularity: 13 },
    ],
    banlistDate: "May 2025",
    recentChanges: ["Nadu, Winged Wisdom banned"],
  },
  dbs: {
    topDecks: [
      { name: "Vegeta/Freezer", tier: "S", winRate: 63, popularity: 24 },
      { name: "Gohan Beast", tier: "A", winRate: 59, popularity: 19 },
      { name: "Jiren", tier: "B", winRate: 54, popularity: 14 },
      { name: "Broly", tier: "B", winRate: 52, popularity: 11 },
    ],
    banlistDate: "January 2025",
    recentChanges: ["Son Goku Limit Burst restricted"],
  },
  dbsfusion: {
    topDecks: [
      { name: "Gohan/Pan", tier: "S", winRate: 66, popularity: 26 },
      { name: "Vegeta Blue", tier: "A", winRate: 60, popularity: 20 },
      { name: "Broly FW", tier: "A", winRate: 57, popularity: 15 },
      { name: "Frieza Army", tier: "B", winRate: 51, popularity: 10 },
    ],
    banlistDate: "February 2025",
    recentChanges: ["Omega Shenron added to limited list"],
  },
  unionarena: {
    topDecks: [
      { name: "Ichigo Kurosaki", tier: "S", winRate: 64, popularity: 28 },
      { name: "Naruto Uzumaki", tier: "A", winRate: 60, popularity: 22 },
      { name: "Goku/Vegeta", tier: "A", winRate: 57, popularity: 16 },
      { name: "Saber", tier: "B", winRate: 52, popularity: 10 },
    ],
    banlistDate: "March 2025",
    recentChanges: ["No recent changes"],
  },
  gundam: {
    topDecks: [
      { name: "RX-78 Aggro", tier: "S", winRate: 62, popularity: 30 },
      { name: "Zeon Control", tier: "A", winRate: 58, popularity: 22 },
      { name: "Seed Strike Freedom", tier: "A", winRate: 56, popularity: 17 },
      { name: "Turn A", tier: "B", winRate: 51, popularity: 12 },
    ],
    banlistDate: "February 2025",
    recentChanges: ["Char's Zaku II limited to 2"],
  },
  lorcana: {
    topDecks: [
      { name: "Amber/Amethyst Control", tier: "S", winRate: 65, popularity: 28 },
      { name: "Ruby/Sapphire Aggro", tier: "A", winRate: 60, popularity: 22 },
      { name: "Emerald/Steel Midrange", tier: "A", winRate: 57, popularity: 18 },
      { name: "Amber/Emerald Ramp", tier: "B", winRate: 53, popularity: 14 },
    ],
    banlistDate: "April 2026",
    recentChanges: ["No cards currently banned in Lorcana"],
  },
  swu: {
    topDecks: [
      { name: "Luke Skywalker Aggro", tier: "S", winRate: 63, popularity: 26 },
      { name: "Vader Control", tier: "A", winRate: 59, popularity: 22 },
      { name: "Boba Fett Bounty", tier: "A", winRate: 57, popularity: 18 },
      { name: "Han Solo Ramp", tier: "B", winRate: 52, popularity: 14 },
    ],
    banlistDate: "May 2026",
    recentChanges: ["No cards currently banned in Star Wars: Unlimited"],
  },
};

const tierColors: Record<string, string> = {
  S: "text-yellow-300 bg-yellow-500/20 border border-yellow-500/40",
  A: "text-green-300 bg-green-500/20 border border-green-500/40",
  B: "text-blue-300 bg-blue-500/20 border border-blue-500/40",
  C: "text-gray-300 bg-gray-500/20 border border-gray-500/40",
};

interface MetaDashboardProps {
  game: TCGGame;
}

export function MetaDashboard({ game }: MetaDashboardProps) {
  const gameConfig = getGame(game);
  const meta = META_DATA[game];

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className={`px-4 py-5 bg-gradient-to-b ${gameConfig.gradient} from-opacity-30`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{gameConfig.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-white">{gameConfig.name}</h2>
            <p className="text-xs text-white/60">Meta Snapshot • {meta.banlistDate} Format</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Top Meta Decks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Top Meta Decks</h3>
          </div>
          <div className="space-y-2">
            {meta.topDecks.map((deck, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/50">
                <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierColors[deck.tier]}`}>
                  {deck.tier}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{deck.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-400">{deck.winRate}%</p>
                  <p className="text-[10px] text-gray-500">Win Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-400">{deck.popularity}%</p>
                  <p className="text-[10px] text-gray-500">Usage</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meta Stats */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Meta Overview</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-3 text-center">
              <div className="text-xl font-black text-yellow-300">S</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Top Tier</div>
            </div>
            <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-3 text-center">
              <div className="text-xl font-black text-white">{meta.topDecks.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Top Decks</div>
            </div>
            <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-3 text-center">
              <div className="text-xl font-black text-green-400">{Math.max(...meta.topDecks.map(d => d.winRate))}%</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Top WR</div>
            </div>
          </div>
        </div>

        {/* Recent Banlist Changes */}
        <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-medium text-orange-300">Recent Banlist Changes</h3>
          </div>
          <ul className="space-y-1.5">
            {meta.recentChanges.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-orange-200">
                <span className="text-orange-400 flex-shrink-0">•</span>
                {change}
              </li>
            ))}
          </ul>
          <p className="text-xs text-orange-400/60 mt-3">Format: {meta.banlistDate}</p>
        </div>

        {/* Deck Size Info */}
        <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Format Rules</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Deck Size</span>
              <span className="text-white">{gameConfig.deckSize.min}–{gameConfig.deckSize.max} cards</span>
            </div>
            {gameConfig.extraDeckSize && (
              <div className="flex justify-between text-gray-400">
                <span>Extra Deck</span>
                <span className="text-white">Up to {gameConfig.extraDeckSize} cards</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Max Copies</span>
              <span className="text-white">{game === "pokemon" || game === "mtg" || game === "lorcana" ? "4 per card" : "3 per card"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
