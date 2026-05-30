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

  return undefined;
}
