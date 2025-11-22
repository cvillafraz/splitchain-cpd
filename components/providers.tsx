"use client"

import type React from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { base, mainnet, arbitrum, polygon, optimism, avalanche, bsc, fantom } from "wagmi/chains"
import { WagmiProvider, createConfig, http } from "wagmi"
import { coinbaseWallet } from "wagmi/connectors"

const wagmiConfig = createConfig({
  chains: [base, mainnet, arbitrum, polygon, optimism, avalanche, bsc, fantom],
  connectors: [
    coinbaseWallet({
      appName: "Splitchain",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
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

const queryClient = new QueryClient()

interface ProvidersProps {
  children: React.ReactNode
  apiKey?: string
  projectId?: string
}

export function Providers({ children, apiKey, projectId }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider apiKey={apiKey} chain={base} projectId={projectId}>
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
