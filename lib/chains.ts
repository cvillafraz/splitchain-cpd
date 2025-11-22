import { base, mainnet, arbitrum, polygon, optimism, avalanche, bsc, fantom } from "wagmi/chains"

export const SUPPORTED_CHAINS = [
  {
    chain: base,
    name: "Base",
    nativeCurrency: "USDC",
    logo: "🔵",
  },
  {
    chain: mainnet,
    name: "Ethereum",
    nativeCurrency: "USDC",
    logo: "💎",
  },
  {
    chain: arbitrum,
    name: "Arbitrum",
    nativeCurrency: "USDC",
    logo: "🔷",
  },
  {
    chain: polygon,
    name: "Polygon",
    nativeCurrency: "USDC",
    logo: "🟣",
  },
  {
    chain: optimism,
    name: "Optimism",
    nativeCurrency: "USDC",
    logo: "🔴",
  },
  {
    chain: avalanche,
    name: "Avalanche",
    nativeCurrency: "USDC",
    logo: "🔺",
  },
  {
    chain: bsc,
    name: "BNB Chain",
    nativeCurrency: "USDC",
    logo: "🟡",
  },
  {
    chain: fantom,
    name: "Fantom",
    nativeCurrency: "USDC",
    logo: "👻",
  },
] as const

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]
