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
| `src/lib/ua-cards.ts` | **~4k-line** array `UA_CARDS: Card[]` — Union Arena database (4,050 cards) |
| `src/lib/yugioh-cards.ts` | **~large** array `YUGIOH_CARDS: Card[]` — Yu-Gi-Oh! database (12,568 unique cards, deduplicated by name) |
| `src/lib/mtg-cards.ts` | **~large, split into 9 chunk files** `MTG_CARDS: Card[]` — MTG database (24,783 unique cards, deduplicated by oracle_id) |
| `src/lib/riftbound-cards.ts` | `RIFTBOUND_CARDS: Card[]` — Riftbound database (350 cards, OGS set) |
| `src/lib/deck-store.ts` | Zustand store (persisted to `localStorage` as `"tcg-deck-builder"`) — source of truth for all decks and selected game |
| `src/lib/synergy-engine.ts` | Pure functions: `calculateCardSynergy`, `analyzeDeck` — no I/O |
| `src/lib/ai-analysis.ts` | `"use server"` — calls Claude (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk` for AI deck insights |
| `src/lib/card-images.ts` | Derives CDN image URLs from card IDs for each game — no external I/O |
| `src/lib/card-prices.ts` | Fetches live prices: YGOPRODeck API (YGO) + Scryfall collection API (MTG, up to 75/batch) + pokemontcg.io (Pokémon, up to 20/batch). In-memory cache keyed by card ID; unmatched cards cached as 0 to prevent re-fetching. `PRICING_SUPPORTED_GAMES`, `fetchDeckPrices`, `getDeckTotalPrice` |
| `src/lib/deck-io.ts` | `exportDeckText` / `importDeckText` (parses `4x`/`4 `/`x4` formats); `encodeDeckToUrl` / `decodeDeckFromUrl` (unicode-safe btoa via `encodeURIComponent`) |
| `src/lib/deck-legality.ts` | `checkDeckLegality(deck): LegalityIssue[]` — validates deck size, banned cards, limited/semi-limited copy counts, and per-game max copies |
| `src/lib/draw-probability.ts` | Hypergeometric distribution for draw odds. `calculateDrawOdds(entries, deckSize, openingHandSize)` returns opening-hand and by-turn-3 probabilities |
| `src/lib/card-roles.ts` | Keyword-based role detection: `detectCardRole(card)` scans description/effect/tags and returns one of 11 `CardRole` strings. `groupCardsByRole(deckCards)` used by the Analysis tab |
| `src/components/ServiceWorkerRegistration.tsx` | `"use client"` null component — registers `/sw.js` on mount for PWA offline support |

### Component tree

```
page.tsx (view state machine)
├── GameSelector        — horizontal scroll of TCG icons
├── DeckList            — folder/tag organizer; DeckMetaPopover for per-deck color tags + folder assignment
├── DeckBuilder         — 5-tab editor: Search | Deck | Analysis | Odds | Play
│   ├── CardSearch      — calls searchCards(), renders CardItem list; grid/list toggle; rarity + max-cost filters
│   ├── CardItem        — single card row with add/remove; tapping the card face opens CardDetailModal
│   ├── CardDetailModal — bottom-sheet with full card image, stats, description, add/remove actions
│   ├── LeaderPickerModal — bottom-sheet for picking a Leader card (One Piece + SWU only)
│   ├── DeckAnalysisPanel — AI insights (server action) + Roles tab (card-roles.ts)
│   ├── DrawCalcPanel   — hypergeometric draw probability calculator (draw-probability.ts)
│   ├── PlaytestPanel   — Fisher-Yates shuffle simulator with draw/mulligan/reset
│   └── DeckIOModal     — Export (text/share URL/image) + Import (text parse) bottom sheet
│       └── DecklistExportImage — html2canvas PNG export of styled decklist card
└── MetaDashboard       — static meta tier list per game
```

### Design system

The app uses a **dark glassmorphism** aesthetic. All surface classes are defined in `globals.css`:

| Class | Usage |
|---|---|
| `.glass` | Default card/panel surface — `rgba(255,255,255,0.04)`, `blur(16px)`, `border rgba(255,255,255,0.08)` |
| `.glass-md` | Modal/elevated surfaces — `rgba(255,255,255,0.06)`, `blur(24px)` |
| `.glass-nav` | Header/tab-bar — `rgba(7,9,15,0.75)`, `blur(32px)` |
| `.glow-dot` | Animated indicator dot on active nav items |

Game-specific colors: `game.color` hex is used as an inline `boxShadow` glow on selected GameSelector buttons. Game-specific gradients (`game.gradient`) appear on banners, active deck cards, and buttons — never hard-coded per-game Tailwind classes.

Text opacity scale: primary `text-white`, secondary `text-white/50`, muted `text-white/30`, ghost `text-white/20`. Borders: `border-white/[0.07]` (default), `border-white/15` (hover/active). Never use `bg-gray-*` or `border-gray-*` — use `bg-white/[x]` instead.

### Card databases

Ten games have full real card databases in dedicated files; DBS and DBS Fusion World have small representative stubs inline in `card-database.ts`.

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

#### Union Arena (`ua-cards.ts`)

Data source: [TMacaroni/Union-Arena-TCGA](https://github.com/TMacaroni/Union-Arena-TCGA) — `CardList.json`. Currently **18 main sets + EX01–EX06 (4,050 cards)**.

**Card ID format:** `"ua-{setCode}_{num}"` e.g. `"ua-ue01bt_001"` (lowercase, 3-digit zero-padded).

**Card types:** Character, Event, Final Memory (mapped from "Site"). Colors: Red, Blue, Green, Yellow, Purple. Deck size: 50 cards. Max 4 copies per card. **Filtering:** AP resource cards and alt-art variants excluded.

**Franchises covered:** Bleach, Jujutsu Kaisen, Hunter x Hunter, Evangelion, Demon Slayer, Code Geass, Attack on Titan, Black Clover, Rurouni Kenshin, One Punch Man, Fullmetal Alchemist, Yu Yu Hakusho, Tokyo Ghoul, Solo Leveling, Sword Art Online, Kagurabachi, Kaiju No. 8, NIKKE.

#### Yu-Gi-Oh! (`yugioh-cards.ts`)

Deduplicated by card name (one entry per unique card, ignoring reprints). Banlist status is stored directly on `Card`: `banned?: boolean`, `limited?: boolean`, `semiLimited?: boolean`. The deck-store enforces 0/1/2/3 copies respectively for each status.

**Card ID format:** `"ygo-{password}"` e.g. `"ygo-89631139"`. Main deck: 40–60 cards. Extra deck: up to 15 (Fusion/Synchro/Xyz/Link). Max 3 copies (unless banlist restricts).

#### Riftbound (`riftbound-cards.ts`)

Riot Games' card game. Currently **OGS (350 cards)**.

**Card ID format:** `"riftbound-{setCode}_{num}"` e.g. `"riftbound-ogs_001"`.

**Card types:** Unit (subtypes: Champion, Follower), Spell, Equipment. Colors: Red, Blue, Green, Yellow, Purple, White. `rarity`: Common, Uncommon, Rare, Epic, Legendary.

#### Magic: The Gathering (`mtg-cards.ts`)

Deduplicated by Scryfall `oracle_id` (one entry per unique card face). Split into 9 chunk arrays and concatenated — do not edit the chunks directly; regenerate from source if updating. Deck size: 60 cards. Max 4 copies (except basic lands).

**Card ID format:** `"mtg-{oracleId}"` using Scryfall oracle ID. `manaCost` and `cmc` fields populated from Scryfall data.

### State management

Zustand store (`useDeckStore`) is persisted via `localStorage`. It holds the full deck list, the active deck ID, and the selected game. The `addCard` action enforces:
- **YGO:** 0 copies if `card.banned`, 1 if `card.limited`, 2 if `card.semiLimited`, 3 otherwise
- **4-copy limit:** pokemon, mtg, lorcana, digimon, unionarena
- **3-copy limit:** all other games

One Piece and SWU decks use a `leader` field on `Deck` (separate from `cards`), set via `setDeckLeader`. Decks support `folder?: string`, `colorTag?: string`, and `notes?: string` for organization and annotation (stored in Zustand, persisted to localStorage). `setDeckNotes` auto-saves notes on blur.

### Deck features

| Feature | Entry point | Notes |
|---|---|---|
| Legality check | `checkDeckLegality` → `DeckBuilder` Deck tab | Red ring on illegal card rows; issues panel above card list |
| Price lookup | `fetchDeckPrices` → price button in DeckBuilder | YGO, MTG, Pokémon; in-memory cache; unmatched cards cached as 0 |
| Deck notes | `setDeckNotes` → DeckBuilder notes toggle | Inline textarea, amber indicator when notes exist, saves on blur |
| Draw calculator | `DrawCalcPanel` (Odds tab) | Hypergeometric; `openingHandSize` per game in `games.ts` |
| Playtest | `PlaytestPanel` (Play tab) | Fisher-Yates shuffle; draw/mulligan/reset; card thumbnails via `card-images.ts` |
| Import/Export | `DeckIOModal` (ArrowLeftRight button) | Text export, share URL (unicode-safe btoa), PNG via html2canvas |
| Folder/tags | `DeckList` + `DeckMetaPopover` | Color dots + collapsible folder groups |
| Role analysis | `DeckAnalysisPanel` Roles tab | `ROLE_PATTERNS` ordered most-specific first (Board Wipe before Removal) |

### Card images (`card-images.ts`)

Game-specific CDN URL derivation — no external I/O, pure function. Supports: YGO (ygoprodeck), MTG (Scryfall), Pokémon (pokemontcg.io), Lorcana (lorcast CDN), One Piece (limitlesstcg), Digimon (apitcg; strips leading zero from set number: `bt01` → `BT1`), Gundam (apitcg), SWU (swu-db CDN). Images shown in search when `cards.length <= 200`; always shown in deck/playtest view.

### PWA / offline

`public/sw.js` is a custom service worker (not Serwist — Serwist requires webpack and Next.js uses Turbopack). Strategy: cache-first for `/_next/static/*`, network-first for navigation, stale-while-revalidate for other same-origin requests. Cross-origin requests are not intercepted. Cache key is `"tcg-builder-v1"`. `next.config.ts` sets `no-cache` headers on `/sw.js` so browsers always fetch the latest. `ServiceWorkerRegistration` is rendered in `src/app/layout.tsx` body to trigger registration on load.

### AI analysis

`getAIAnalysis` in `ai-analysis.ts` is a Next.js Server Action. It runs `analyzeDeck` (local synergy engine) first, then sends results to Claude for enhanced insights. The Anthropic API key must be available as `ANTHROPIC_API_KEY` in the environment.
