"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Dashboard } from "@/components/dashboard/dashboard-view"
import { useConnect, useAccount } from "wagmi"
import { ensureUserSetup } from "@/app/actions/groups" // Importing new action

type Step = "welcome" | "success" | "dashboard"

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome")
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()

  const [isInitializing, setIsInitializing] = useState(false)

  const handleCreateWallet = () => {
    const coinbaseConnector = connectors.find((connector) => connector.id === "coinbaseWalletSDK")
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector })
    }
  }

  const handleContinue = () => {
    setStep("dashboard")
  }

  useEffect(() => {
    if (isConnected && address && step === "welcome") {
      const initUser = async () => {
        setIsInitializing(true)
        try {
          await ensureUserSetup(address)
          setStep("success")
        } catch (error) {
          console.error("Failed to setup user:", error)
        } finally {
          setIsInitializing(false)
        }
      }
      initUser()
    }
  }, [isConnected, address, step])

  if (step === "dashboard") {
    return <Dashboard walletAddress={address || "Loading..."} />
  }

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Split expenses on
                <span className="block text-primary">the blockchain</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                No seed phrases. No headaches. Just instant, transparent settlements with your friends.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleCreateWallet}
                className="h-12 px-8 text-lg font-medium w-full sm:w-auto"
                disabled={isPending || isInitializing} // Disable while initializing
              >
                {isPending || isInitializing ? "Connecting..." : "Create Smart Wallet"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">Powered by Coinbase Embedded Wallet</p>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <Card className="border-secondary/20 shadow-2xl shadow-secondary/10 bg-card/50 backdrop-blur-xl">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4 ring-1 ring-secondary/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <CardTitle className="text-2xl text-secondary">Wallet Created!</CardTitle>
                <CardDescription>Your Web3 identity is ready.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-4 bg-muted rounded-xl border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Address</p>
                  <p className="font-mono font-medium text-foreground break-all">{address || "Generating..."}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleContinue}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11"
                >
                  Start Splitting
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
