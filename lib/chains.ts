import { sepolia } from "wagmi/chains"

export const SUPPORTED_CHAINS = [
  {
    chain: sepolia,
    name: "Ethereum Sepolia",
    nativeCurrency: "ETH",
    logo: "🧪",
  },
] as const

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]
