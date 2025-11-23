"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpRight, ArrowDownLeft, CreditCard, Calendar, Users } from "lucide-react"
import { useAccount } from "wagmi"

interface TransactionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: any
}

export function TransactionDetailDialog({ open, onOpenChange, expense }: TransactionDetailDialogProps) {
  const { address } = useAccount()

  if (!expense) return null

  const userAddress = address?.toLowerCase().trim() || ""
  const paidByAddress = (expense.paidBy || "").toLowerCase().trim()
  const isPayer = paidByAddress === userAddress
  const shares = expense.shares || {}

  // Calculate amounts
  let myShare = 0
  Object.entries(shares).forEach(([participant, share]) => {
    if (participant.toLowerCase().trim() === userAddress) {
      myShare = Number(share)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div
            className={`p-4 rounded-full ${isPayer ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"}`}
          >
            {isPayer ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownLeft className="h-8 w-8" />}
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold">
              {expense.amount.toFixed(4)} {expense.currency}
            </h2>
            <p className="text-muted-foreground mt-1">{expense.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Paid by
              </span>
              <span className="font-medium truncate max-w-[120px]">{isPayer ? "You" : "Friend"}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </span>
              <span className="font-medium">{formatDistanceToNow(new Date(expense.date), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Split Breakdown</span>
          </div>

          <div className="bg-muted/30 rounded-lg p-1 space-y-1">
            {Object.entries(shares).map(([participant, share]: [string, any]) => {
              const participantLower = participant.toLowerCase().trim()
              const isMe = participantLower === userAddress
              const isPayerParticipant = participantLower === paidByAddress

              return (
                <div
                  key={participant}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {isMe ? "You" : `${participant.slice(0, 6)}...${participant.slice(-4)}`}
                      {isPayerParticipant && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Payer</span>
                      )}
                    </span>
                  </div>
                  <span className="text-sm font-mono">
                    {Number(share).toFixed(4)} {expense.currency}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="text-center text-sm text-muted-foreground pt-2 border-t">
            {isPayer
              ? `You paid ${expense.amount.toFixed(4)} ${expense.currency} and are owed ${(expense.amount - myShare).toFixed(4)} ${expense.currency}`
              : `You owe ${myShare.toFixed(4)} ${expense.currency} to the payer`}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
