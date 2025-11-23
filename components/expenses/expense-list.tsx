"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpRight, ArrowDownLeft, Zap, RefreshCw, Trash2 } from "lucide-react"
import { SettlementDialog } from "@/components/payments/settlement-dialog"
import { TransactionDetailDialog } from "@/components/expenses/transaction-detail-dialog"
import { getTransactions, deleteTransaction } from "@/lib/storage"
import { useAccount } from "wagmi"
import { useToast } from "@/hooks/use-toast"

export function ExpenseList({ refreshTrigger, groupId }: { refreshTrigger?: number; groupId?: string }) {
  const { address } = useAccount()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<any[]>([])
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null)
  const [isSettlementOpen, setIsSettlementOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const loadExpenses = async () => {
    setIsLoading(true)
    console.log("[v0] Loading expenses from Supabase storage", groupId ? `for group ${groupId}` : "all")
    try {
      const transactions = await getTransactions(groupId)
      console.log("[v0] Loaded transactions:", transactions.length)
      setExpenses(transactions)
    } catch (error) {
      console.error("[v0] Failed to load expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [refreshTrigger, groupId]) // Added groupId dependency

  const handleSettleUp = (e: React.MouseEvent, expense: any) => {
    e.stopPropagation()
    setSelectedExpense(expense)
    setIsSettlementOpen(true)
  }

  const handleViewDetail = (expense: any) => {
    setSelectedExpense(expense)
    setIsDetailOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this expense?")) return

    setIsDeleting(id)
    try {
      await deleteTransaction(id)
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully removed.",
      })
      loadExpenses()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const calculateUserAmount = (expense: any) => {
    if (!address) return { amount: 0, type: "settled" }

    const userAddress = address.toLowerCase()
    const paidByAddress = expense.paidBy?.toLowerCase() || ""
    const shares = expense.shares || {}

    let myShare = 0
    let isInvolved = false
    Object.entries(shares).forEach(([participant, share]) => {
      if (participant.toLowerCase() === userAddress) {
        myShare = Number(share)
        isInvolved = true
      }
    })

    const iPaid = paidByAddress === userAddress

    // If user is neither the payer nor in shares, they're not involved
    if (!iPaid && !isInvolved) {
      return { amount: 0, type: "not_involved" }
    }

    // Check if transaction is already marked as settled
    if (expense.type === "settled") {
      return { amount: 0, type: "settled" }
    }

    if (iPaid) {
      let othersOweMe = 0
      Object.entries(shares).forEach(([participant, share]) => {
        if (participant.toLowerCase() !== userAddress) {
          othersOweMe += Number(share)
        }
      })
      return { amount: othersOweMe, type: othersOweMe > 0 ? "owed" : "settled" }
    } else {
      return { amount: myShare, type: myShare > 0 ? "owing" : "settled" }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <ArrowDownLeft className="h-10 w-10 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">No expenses yet</h3>
        <p className="text-sm max-w-xs mx-auto mb-4">Create your first expense to get started with splitting costs.</p>
        <Button variant="outline" onClick={loadExpenses}>
          Refresh
        </Button>
      </Card>
    )
  }

  return (
    <>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {expenses.map((expense) => {
            const { amount: userAmount, type: userType } = calculateUserAmount(expense)

            return (
              <Card
                key={expense.id}
                className="p-4 bg-card/50 hover:bg-card/80 transition-colors border-border/40 group cursor-pointer"
                onClick={() => handleViewDetail(expense)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        userType === "owed"
                          ? "bg-secondary/10 text-secondary"
                          : userType === "owing"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {userType === "owed" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : userType === "owing" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium leading-none">{expense.description}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(expense.date), { addSuffix: true })} • {expense.chain} •{" "}
                        {expense.currency} • Paid by{" "}
                        {expense.paidBy.toLowerCase() === address?.toLowerCase() ? "You" : "Friend"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {userType !== "not_involved" && (
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            userType === "owed"
                              ? "text-secondary"
                              : userType === "owing"
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        >
                          {userType === "owed" ? "+" : userType === "owing" ? "-" : ""}
                          {userAmount.toFixed(4)} {expense.currency}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {userType === "owed" ? "you're owed" : userType === "owing" ? "you owe" : "settled"}
                        </p>
                      </div>
                    )}
                    {userType === "owing" && (
                      <Button
                        onClick={(e) => handleSettleUp(e, expense)}
                        size="sm"
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1"
                      >
                        <Zap className="h-3 w-3" />
                        Settle
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, expense.id)}
                      disabled={isDeleting === expense.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </ScrollArea>

      {selectedExpense && (
        <>
          <SettlementDialog open={isSettlementOpen} onOpenChange={setIsSettlementOpen} expense={selectedExpense} />
          <TransactionDetailDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} expense={selectedExpense} />
        </>
      )}
    </>
  )
}
