# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build (also used to type-check)
npm run lint       # run ESLint
npx tsc --noEmit   # type-check only (faster than build)
```

There are no tests. Use `npx tsc --noEmit && npm run build` to verify correctness before committing.

## Architecture

**Mobile-first PWA** built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Zustand. Targets a `max-w-md` phone viewport. The entire app is a single route (`src/app/page.tsx`) that renders one of three views: `home` (deck list), `builder` (deck editor), or `meta` (meta dashboard).

### Key files

| File | Purpose |
|---|---|
| `src/types/index.ts` | All shared types — `Card`, `Deck`, `DeckCard`, `TCGGame`, etc. |
| `src/lib/games.ts` | `GAMES` config array + `getGame(id)` — one entry per supported TCG |
| `src/lib/card-database.ts` | Aggregates all game card arrays into `ALL_CARDS`; exports `searchCards`, `getCardById`, `getCardsForGame` |
| `src/lib/opcg-cards.ts` | **~34k-line** array `ONEPIECE_CARDS: Card[]` — One Piece card database (~2,313 cards) |
| `src/lib/gundam-cards.ts` | **~7.6k-line** array `GUNDAM_CARDS: Card[]` — Gundam Card Game database (487 cards) |
| `src/lib/pokemon-cards.ts` | **~29k-line** array `POKEMON_CARDS: Card[]` — Pokémon TCG standard-legal cards (2,079 cards) |
| `src/lib/lorcana-cards.ts` | **~39k-line** array `LORCANA_CARDS: Card[]` — Disney Lorcana database (2,542 cards) |
| `src/lib/swu-cards.ts` | **~18k-line** array `SWU_CARDS: Card[]` — Star Wars Unlimited database (1,018 cards) |
| `src/lib/digimon-cards.ts` | **~3.3k-line** array `DIGIMON_CARDS: Card[]` — Digimon Card Game database (3,304 cards) |
| `src/lib/deck-store.ts` | Zustand store (persisted to `localStorage` as `"tcg-deck-builder"`) — source of truth for all decks and selected game |
| `src/lib/synergy-engine.ts` | Pure functions: `calculateCardSynergy`, `analyzeDeck` — no I/O |
| `src/lib/ai-analysis.ts` | `"use server"` — calls Claude (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk` for AI deck insights |

### Component tree

```
page.tsx (view state machine)
├── GameSelector        — horizontal scroll of TCG icons
├── DeckList            — list of saved decks for current game
├── DeckBuilder         — 3-tab editor: Search | Cards | Analysis
│   ├── CardSearch      — calls searchCards(), renders CardItem list
│   ├── CardItem        — single card row/card with add/remove
│   └── DeckAnalysisPanel — calls getAIAnalysis() server action
└── MetaDashboard       — static meta tier list per game
```

### Card databases

Six games have full real card databases in dedicated files; the rest (Yu-Gi-Oh, MTG, DBS, Union Arena) have small representative stubs inline in `card-database.ts`.

#### One Piece (`opcg-cards.ts`)

Data source: [punk-records](https://github.com/buhbbl/punk-records) — `english/data/{packId}.json`. Pack IDs: OP01=569101…OP15=569115; ST01=569001…ST29=569029; EB01=569201…EB03=569203. Currently **OP01–OP15 + ST01–ST29 + EB01–EB03 (~2,313 cards)**.

**Card ID format:** `"op-{setCode}_{num}"` e.g. `"op-op08_042"` (lowercase, underscore, 3-digit zero-padded).

**Card shape rules:**
- Leaders: `life: 5` (mono-color) or `life: 4` (dual-color); no `cost` field
- Omit `power` entirely for Events, Stages, and Characters with no printed power stat
- `rarity`: `"Common"` | `"Uncommon"` | `"Rare"` | `"Super Rare"` | `"Secret Rare"` | `"Leader"`
- Skip `TreasureRare` cards (alternate art) and reprints from other sets
- No `trigger` field on `Card` type — merge trigger text into `description` (append `" [Trigger] ..."`)

**Ban list** applied in `card-database.ts` via `OPCG_BANNED_IDS`. Currently banned: `op-op03_040`, `op-op06_116`, `op-op06_086`, `op-op06_047`, `op-st10_001`.

#### Gundam Card Game (`gundam-cards.ts`)

Data source: [apitcg/gundam-tcg-data](https://github.com/apitcg/gundam-tcg-data) — `cards/en/{set}.json`. Currently **GD01, GD02, ST01–ST06 (487 cards)**.

**Card ID format:** `"gundam-{setCode}_{num}"` e.g. `"gundam-gd01_001"`.

**Card types:** `UNIT`, `PILOT`, `COMMAND`, `BASE` only — skip `UNIT TOKEN`, `RESOURCE`, `EX BASE`, `EX RESOURCE`. Deck size: 50 cards. Colors: Blue, Green, Red, White, Purple.

#### Pokémon TCG (`pokemon-cards.ts`)

Data source: [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data) — `cards/en/{setId}.json`. Currently **H-on standard rotation: TEF, TWM, SFA, SCR, SSP, PRE, JTG, DRI, BLK, WHF, MEV, PFL, ASH, POR, CHA (2,079 cards)**.

**Card ID format:** `"poke-{setId}_{num}"` e.g. `"poke-sv5_001"`.

**Filtering rules:** Only cards with `legalities.standard === "Legal"`. Exclude alt-art duplicates: `Illustration Rare`, `Special Illustration Rare`, `Hyper Rare`, `Mega Hyper Rare`. Set IDs follow `sv5`…`sv10`, `zsv10pt5` (Black Bolt), `rsv10pt5` (White Flare), `me1`…`me4` (Mega Evolution era).

#### Disney Lorcana (`lorcana-cards.ts`)

Data source: [bertcafecito/disney-lorcana-datahub](https://github.com/bertcafecito/disney-lorcana-datahub) — Lorcast API snapshots. Currently **TFC, ROF, ITI, UR, SS, AZS, ARI, ROJ, FAB, WIW, WSP, WUK (2,542 cards)**.

**Card ID format:** `"lorcana-{setCode}_{num}"` e.g. `"lorcana-tfc_001"` (lowercase, 3-digit zero-padded).

**Card types:** Character, Action, Item, Location, Song. Ink colors: Amber, Amethyst, Emerald, Ruby, Sapphire, Steel. Deck size: 60 cards. Max 4 copies per card. **Filtering:** Enchanted rarity (alternate art) excluded.

#### Star Wars Unlimited (`swu-cards.ts`)

Data source: [erlloyd/star-wars-unlimited-json](https://github.com/erlloyd/star-wars-unlimited-json) — Normal variant cards only. Currently **SOR, SHD, TWI, JTL (1,018 cards)**.

**Card ID format:** `"swu-{setCode}_{num}"` e.g. `"swu-sor_001"` (lowercase, 3-digit zero-padded).

**Card types:** Leader, Base, Unit, Event, Upgrade. Units have arena subtype: Ground or Space. Aspects (colors): Vigilance, Command, Aggression, Cunning, Heroism, Villainy. Deck size: 50 cards + 1 Leader + 1 Base. Max 3 copies per card.

#### Digimon Card Game (`digimon-cards.ts`)

Data source: [apitcg/digimon-tcg-data](https://github.com/apitcg/digimon-tcg-data) — same provider as the Gundam database. Currently **BT01–BT21, EX01–EX09, ST01–ST21, RB01, LM (3,304 cards)**.

**Card ID format:** `"digimon-{setCode}_{num}"` e.g. `"digimon-bt01_001"` (lowercase, 3-digit zero-padded).

**Card types:** Digimon, Tamer, Option, Digi-Egg. Colors: Red, Blue, Yellow, Green, Black, Purple, White. Deck size: 50 cards + up to 5 Digi-Egg cards (separate zone). Max 4 copies per card. **Filtering:** Alt-art (`-p1`/`-p2` suffix), promo (`P-` prefix), and exact-duplicate IDs excluded.

**Key Digimon stats:** `level` (2–7), `power` (DP battle power), `cost` (play cost), `attribute` (Vaccine/Data/Virus/Free/Variable/Unknown), `subtype` (Digimon stage e.g. Rookie/Champion/Mega).

### State management

Zustand store (`useDeckStore`) is persisted via `localStorage`. It holds the full deck list, the active deck ID, and the selected game. The `addCard` action enforces a max of 4 copies per card for Pokémon/MTG/Lorcana/Digimon and 3 for all other games. One Piece decks use a `leader` field on `Deck` (separate from `cards`).

### AI analysis

`getAIAnalysis` in `ai-analysis.ts` is a Next.js Server Action. It runs `analyzeDeck` (local synergy engine) first, then sends results to Claude for enhanced insights. The Anthropic API key must be available as `ANTHROPIC_API_KEY` in the environment.
