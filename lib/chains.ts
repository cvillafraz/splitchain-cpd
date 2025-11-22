import { base, mainnet, arbitrum, polygon, optimism, avalanche, bsc, fantom } from "wagmi/chains"

export const SUPPORTED_CHAINS = [
  {
    chain: base,
    name: "Base",
    nativeCurrency: "ETH",
    logo: "🔵",
  },
  {
    chain: mainnet,
    name: "Ethereum",
    nativeCurrency: "ETH",
    logo: "💎",
  },
  {
    chain: arbitrum,
    name: "Arbitrum",
    nativeCurrency: "ETH",
    logo: "🔷",
  },
  {
    chain: polygon,
    name: "Polygon",
    nativeCurrency: "MATIC",
    logo: "🟣",
  },
  {
    chain: optimism,
    name: "Optimism",
    nativeCurrency: "ETH",
    logo: "🔴",
  },
  {
    chain: avalanche,
    name: "Avalanche",
    nativeCurrency: "AVAX",
    logo: "🔺",
  },
  {
    chain: bsc,
    name: "BNB Chain",
    nativeCurrency: "BNB",
    logo: "🟡",
  },
  {
    chain: fantom,
    name: "Fantom",
    nativeCurrency: "FTM",
    logo: "👻",
  },
] as const

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]
