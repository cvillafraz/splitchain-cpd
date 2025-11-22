"use client"

import type React from "react"
import { useState } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base, mainnet, arbitrum, polygon, optimism, avalanche, bsc, fantom, sepolia } from "wagmi/chains"
import { WagmiProvider, createConfig, http } from "wagmi"
import { coinbaseWallet } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const wagmiConfig = createConfig({
  chains: [sepolia, base, mainnet, arbitrum, polygon, optimism, avalanche, bsc, fantom],
  connectors: [
    coinbaseWallet({
      appName: "Splitchain",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [fantom.id]: http(),
  },
})

interface ProvidersProps {
  children: React.ReactNode
  apiKey?: string
  projectId?: string
}

export function Providers({ children, apiKey, projectId }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={apiKey} chain={sepolia} projectId={projectId} analytics={{ enabled: false }}>
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
