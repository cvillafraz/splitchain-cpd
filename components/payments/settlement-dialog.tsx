"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount, useSendTransaction } from "wagmi"
import { parseEther } from "viem"
import { markTransactionAsSettled } from "@/lib/storage"

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  paidBy: string
  shares: Record<string, number>
  date: string
}

interface SettlementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense
}

type SettlementStep = "review" | "processing" | "success"

export function SettlementDialog({ open, onOpenChange, expense }: SettlementDialogProps) {
  const [step, setStep] = useState<SettlementStep>("review")
  const [txHash, setTxHash] = useState<string>("")
  const { address } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()

  const userAddress = address?.toLowerCase() || ""
  const myShare = expense?.shares?.[userAddress] || 0
  const payerAddress = expense?.paidBy?.toLowerCase() || ""
  const payerName = payerAddress === userAddress ? "You" : `${payerAddress.slice(0, 6)}...${payerAddress.slice(-4)}`

  const handlePay = async () => {
    setStep("processing")

    try {
      const hash = await sendTransactionAsync({
        to: payerAddress as `0x${string}`,
        value: parseEther(myShare.toString()),
      })

      setTxHash(hash)

      await markTransactionAsSettled(expense.id)

      setStep("success")
    } catch (error) {
      console.error("[v0] Payment failed:", error)
      setStep("review")
    }
  }

  const handleClose = () => {
    setStep("review")
    onOpenChange(false)
  }

  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <AnimatePresence mode="wait">
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle>Settle Expense</DialogTitle>
                <DialogDescription>Review the payment details before settling.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="p-6 bg-muted rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Payment Amount</span>
                    <div className="text-3xl font-bold">${myShare.toFixed(2)}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">For</span>
                      <span className="font-medium">{expense.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To</span>
                      <span className="font-medium">{payerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="font-medium text-secondary">$0.00</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePay}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-secondary/20 blur-xl animate-pulse" />
                <Loader2 className="w-16 h-16 text-secondary animate-spin relative z-10" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold">Processing Payment</h3>
                <p className="text-muted-foreground">Settling on-chain...</p>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="space-y-6 py-6"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary ring-1 ring-secondary/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-secondary mb-1">Payment Sent!</h3>
                  <p className="text-muted-foreground">Expense settled successfully</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-xl border border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold">${myShare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{payerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Hash</span>
                  <span className="font-mono text-xs text-primary">{txHash}</span>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
