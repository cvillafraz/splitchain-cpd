// USDC contract addresses for each supported chain
export const USDC_CONTRACTS: Record<number, `0x${string}`> = {
  // Base
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  // Ethereum Mainnet
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  // Arbitrum
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  // Polygon
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  // Optimism
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  // Avalanche C-Chain
  43114: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  // BNB Chain
  56: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  // Fantom
  250: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
} as const
