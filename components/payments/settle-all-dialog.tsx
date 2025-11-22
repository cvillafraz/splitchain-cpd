"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Wallet, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount, useSendTransaction, useBalance } from "wagmi"
import { sepolia } from "wagmi/chains"
import { parseEther } from "viem"

interface SettleAllDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debts: { address: string; amount: number }[]
  onSettled: () => void
}

type SettlementStep = "review" | "processing" | "success" | "error"

export function SettleAllDialog({ open, onOpenChange, debts, onSettled }: SettleAllDialogProps) {
  const [step, setStep] = useState<SettlementStep>("review")
  const [currentDebtIndex, setCurrentDebtIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const { address } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  const { data: balance } = useBalance({ address, chainId: sepolia.id })

  const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0)
  const currentDebt = debts[currentDebtIndex]

  const hasInsufficientFunds = balance ? balance.value < parseEther(totalAmount.toString()) : false

  const handlePayAll = async () => {
    setStep("processing")
    setCurrentDebtIndex(0)
    setErrorMessage("")

    try {
      // Process debts sequentially
      for (let i = 0; i < debts.length; i++) {
        setCurrentDebtIndex(i)
        const debt = debts[i]

        console.log(`[v0] Sending ${debt.amount} ETH to ${debt.address}`)

        await sendTransactionAsync({
          to: debt.address as `0x${string}`,
          value: parseEther(debt.amount.toString()),
        })

        // In a real app, we would wait for the receipt here before moving to the next
        // await waitForTransaction({ hash })
      }

      setStep("success")
      onSettled()
    } catch (error: any) {
      console.error("[v0] Payment failed:", error)
      setStep("error")
      setErrorMessage(error.message || "Transaction rejected or failed")
    }
  }

  const handleClose = () => {
    setStep("review")
    setCurrentDebtIndex(0)
    onOpenChange(false)
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

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
                <DialogTitle>Settle All Debts</DialogTitle>
                <DialogDescription>Review total payments before settling.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="p-6 bg-muted rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Total to Pay</span>
                    <div className="text-3xl font-bold">{totalAmount.toFixed(4)} ETH</div>
                  </div>
                  {hasInsufficientFunds && (
                    <div className="flex items-center gap-2 mb-4 text-destructive text-sm bg-destructive/10 p-2 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      <span>Insufficient funds for this transaction</span>
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between font-semibold text-muted-foreground mb-2">
                      <span>Recipient</span>
                      <span>Amount</span>
                    </div>
                    {debts.map((debt, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3 w-3 text-muted-foreground" />
                          <span>{formatAddress(debt.address)}</span>
                        </div>
                        <span className="font-medium">{debt.amount.toFixed(4)} ETH</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayAll}
                    disabled={debts.length === 0 || hasInsufficientFunds}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Pay All ({debts.length})
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
                <h3 className="text-2xl font-bold">
                  Processing Payment {currentDebtIndex + 1}/{debts.length}
                </h3>
                <p className="text-muted-foreground">
                  Sending {currentDebt?.amount.toFixed(4)} ETH to {formatAddress(currentDebt?.address || "")}
                </p>
                <p className="text-xs text-muted-foreground">Please confirm transaction in your wallet</p>
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
                  <h3 className="text-2xl font-bold text-secondary mb-1">All Settled!</h3>
                  <p className="text-muted-foreground">All {debts.length} payments have been sent.</p>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-6"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive ring-1 ring-destructive/20">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-destructive mb-1">Payment Failed</h3>
                  <p className="text-muted-foreground text-sm max-w-[280px] mx-auto break-words">
                    {errorMessage || "There was an error processing your payments."}
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep("review")} variant="outline" className="w-full">
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
