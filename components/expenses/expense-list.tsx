"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpRight, ArrowDownLeft, Zap, RefreshCw } from "lucide-react"
import { SettlementDialog } from "@/components/payments/settlement-dialog"
import { getTransactions } from "@/lib/filecoin-storage"

export function ExpenseList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null)
  const [isSettlementOpen, setIsSettlementOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadExpenses = async () => {
    setIsLoading(true)
    console.log("[v0] Loading expenses from Filecoin storage")
    try {
      const transactions = await getTransactions()
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
  }, [refreshTrigger])

  const handleSettleUp = (expense: any) => {
    setSelectedExpense(expense)
    setIsSettlementOpen(true)
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
          {expenses.map((expense) => (
            <Card key={expense.id} className="p-4 bg-card/50 hover:bg-card/80 transition-colors border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-2 rounded-full ${
                      expense.type === "owed"
                        ? "bg-secondary/10 text-secondary"
                        : expense.type === "owing"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {expense.type === "owed" ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : expense.type === "owing" ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium leading-none">{expense.description}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(expense.date), { addSuffix: true })} • {expense.chain} •{" "}
                      {expense.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        expense.type === "owed"
                          ? "text-secondary"
                          : expense.type === "owing"
                            ? "text-destructive"
                            : "text-muted-foreground line-through"
                      }`}
                    >
                      {expense.type === "owed" ? "+" : "-"}
                      {expense.amount.toFixed(4)} {expense.currency}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {expense.type === "owed" ? "lent" : expense.type === "owing" ? "borrowed" : "settled"}
                    </p>
                  </div>
                  {expense.type === "owing" && (
                    <Button
                      onClick={() => handleSettleUp(expense)}
                      size="sm"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      Settle
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {selectedExpense && (
        <SettlementDialog open={isSettlementOpen} onOpenChange={setIsSettlementOpen} expense={selectedExpense} />
      )}
    </>
  )
}
