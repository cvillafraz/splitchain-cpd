"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CoinbaseFundingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FundingStep = "amount" | "coinbase-login" | "confirm" | "success"

export function CoinbaseFundingDialog({ open, onOpenChange }: CoinbaseFundingDialogProps) {
  const [step, setStep] = useState<FundingStep>("amount")
  const [amount, setAmount] = useState("")

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("coinbase-login")
    // Simulate login delay
    setTimeout(() => setStep("confirm"), 1500)
  }

  const handleConfirm = () => {
    setStep("success")
    // Close after showing success
    setTimeout(() => {
      onOpenChange(false)
      setStep("amount")
      setAmount("")
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <AnimatePresence mode="wait">
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="p-2 bg-[#0052FF]/10 rounded-full text-[#0052FF]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  Fund Wallet
                </DialogTitle>
                <DialogDescription>Add USDC to your wallet instantly using Coinbase Pay.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAmountSubmit} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-lg">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-7 text-lg"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Min $1.00 • Max $1,000.00</p>
                </div>
                <Button type="submit" className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white h-11 font-medium">
                  Continue with Coinbase Pay
                </Button>
              </form>
            </motion.div>
          )}

          {step === "coinbase-login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 space-y-6 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#0052FF]/20 blur-xl animate-pulse" />
                <Loader2 className="w-16 h-16 text-[#0052FF] animate-spin relative z-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Connecting to Coinbase</h3>
                <p className="text-muted-foreground">Securely authenticating...</p>
              </div>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle>Confirm Purchase</DialogTitle>
                <DialogDescription>Review your transaction details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="p-4 bg-muted rounded-xl border border-border/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">You Pay</span>
                    <span className="text-xl font-bold">${amount} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">You Get</span>
                    <span className="text-xl font-bold text-primary">{amount} USDC</span>
                  </div>
                  <div className="h-px bg-border/50 my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Visa ending 4242</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="font-medium text-secondary">Free</span>
                  </div>
                </div>
                <Button onClick={handleConfirm} className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white h-11">
                  Buy {amount} USDC Now
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary ring-1 ring-secondary/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-secondary">Purchase Successful!</h3>
                <p className="text-muted-foreground">{amount} USDC has been added to your wallet.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
