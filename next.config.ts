import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.rgpub.io" },
      { protocol: "https", hostname: "images.ygoprodeck.com" },
      { protocol: "https", hostname: "images.pokemontcg.io" },
      { protocol: "https", hostname: "en.onepiece-cardgame.com" },
      { protocol: "https", hostname: "world.digimoncard.com" },
      { protocol: "https", hostname: "www.gundam-gcg.com" },
      { protocol: "https", hostname: "cdn.swu-db.com" },
    ],
  },
};

export default nextConfig;
