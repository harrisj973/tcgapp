import { Card } from "@/types";

export function getCardImageUrl(card: Card): string | undefined {
  const id = card.id;

  // Riftbound: riftbound-ogs_001 → cdn.rgpub.io/.../OGS/cards/OGS-001/full-desktop.jpg
  if (id.startsWith("riftbound-")) {
    const code = id.slice("riftbound-".length); // "ogs_001"
    const ul = code.lastIndexOf("_");
    if (ul !== -1) {
      const set = code.slice(0, ul).toUpperCase();  // "OGS"
      const num = code.slice(ul + 1);               // "001"
      const cardId = `${set}-${num}`;               // "OGS-001"
      return `https://cdn.rgpub.io/public/live/map/riftbound/latest/${set}/cards/${cardId}/full-desktop.jpg`;
    }
  }

  // Yu-Gi-Oh: ygo-89631139 → images.ygoprodeck.com/images/cards_small/89631139.jpg
  if (id.startsWith("ygo-")) {
    const password = id.slice(4);
    if (/^\d+$/.test(password)) {
      return `https://images.ygoprodeck.com/images/cards_small/${password}.jpg`;
    }
  }

  // Pokémon: poke-sv5_001 → images.pokemontcg.io/sv5/1.png
  if (id.startsWith("poke-")) {
    const code = id.slice(5); // "sv5_001"
    const ul = code.lastIndexOf("_");
    if (ul !== -1) {
      const setId = code.slice(0, ul);              // "sv5"
      const num = parseInt(code.slice(ul + 1), 10); // 1
      if (!isNaN(num)) {
        return `https://images.pokemontcg.io/${setId}/${num}.png`;
      }
    }
  }

  // One Piece: op-op01_001 → en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png
  if (id.startsWith("op-")) {
    const code = id.slice(3); // "op01_001"
    const ul = code.lastIndexOf("_");
    if (ul !== -1) {
      const set = code.slice(0, ul).toUpperCase(); // "OP01"
      const num = code.slice(ul + 1);              // "001"
      return `https://en.onepiece-cardgame.com/images/cardlist/card/${set}-${num}.png`;
    }
  }

  // Digimon: digimon-bt01_001 → world.digimoncard.com/images/cardlist/card/BT1-001.png
  if (id.startsWith("digimon-")) {
    const code = id.slice("digimon-".length); // "bt01_001"
    const ul = code.lastIndexOf("_");
    if (ul !== -1) {
      const setRaw = code.slice(0, ul);  // "bt01"
      const num = code.slice(ul + 1);    // "001"
      const match = setRaw.match(/^([a-z]+)(\d+)$/);
      if (match) {
        const prefix = match[1].toUpperCase();          // "BT"
        const setNum = parseInt(match[2], 10).toString(); // "1" (strip leading zero)
        return `https://world.digimoncard.com/images/cardlist/card/${prefix}${setNum}-${num}.png`;
      }
    }
  }

  // Gundam: gundam-gd01_001 → www.gundam-gcg.com/en/images/cards/card/GD01-001.webp
  if (id.startsWith("gundam-")) {
    const code = id.slice("gundam-".length); // "gd01_001"
    const ul = code.lastIndexOf("_");
    if (ul !== -1) {
      const set = code.slice(0, ul).toUpperCase(); // "GD01"
      const num = code.slice(ul + 1);              // "001"
      return `https://www.gundam-gcg.com/en/images/cards/card/${set}-${num}.webp`;
    }
  }

  // Star Wars Unlimited: swu-sor_001 → cdn.swu-db.com/images/cards/SOR/001.png
  if (id.startsWith("swu-")) {
    const code = id.slice(4); // "sor_001"
    const ul = code.lastIndexOf("_");
    if (ul !== -1) {
      const set = code.slice(0, ul).toUpperCase(); // "SOR"
      const num = code.slice(ul + 1);              // "001"
      return `https://cdn.swu-db.com/images/cards/${set}/${num}.png`;
    }
  }

  return undefined;
}
