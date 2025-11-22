"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Receipt, UserPlus, Activity, History, Zap, CreditCard, Settings, LayoutGrid } from "lucide-react"
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog"
import { ExpenseList } from "@/components/expenses/expense-list"
import { CoinbaseFundingDialog } from "@/components/wallet/coinbase-funding-dialog"
import { AnalyticsView } from "@/components/analytics/analytics-view"
import { IntegrationsView } from "@/components/integrations/integrations-view"
import { useAccount } from "wagmi"

interface DashboardProps {
  walletAddress: string
}

export function Dashboard({ walletAddress: propAddress }: DashboardProps) {
  const { address } = useAccount()
  const walletAddress = address || propAddress

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isFundingOpen, setIsFundingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("expenses")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleExpenseCreated = () => {
    console.log("[v0] Expense created, refreshing list")
    setRefreshTrigger((prev) => prev + 1)
  }

  // If active tab is settings/integrations, show full view
  if (activeTab === "integrations") {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6 px-4 md:px-0 pt-4">
          <Button variant="ghost" onClick={() => setActiveTab("expenses")} className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </header>
        <IntegrationsView />
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-6 p-4 md:p-0">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your shared expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setActiveTab("integrations")}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> New Expense
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed to You</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">+$120.50</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total You Owe</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">-$45.00</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">$1,234.56</div>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsFundingOpen(true)}>
                <CreditCard className="h-4 w-4" />
                <span className="sr-only">Add Funds</span>
              </Button>
            </div>
            <p className="text-xs font-mono text-muted-foreground break-all" title={walletAddress}>
              {walletAddress}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-secondary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent">
            Settle All Debts
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Request Payment
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsFundingOpen(true)}>
            Add Funds
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="mt-4">
          <ExpenseList refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsView />
        </TabsContent>
        <TabsContent value="friends" className="mt-4">
          <Card className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <UserPlus className="h-10 w-10 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No friends yet</h3>
            <p className="text-sm max-w-xs mx-auto mb-4">Add friends to start splitting expenses with them.</p>
            <Button variant="outline">Invite Friends</Button>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateExpenseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onExpenseCreated={handleExpenseCreated} />
      <CoinbaseFundingDialog open={isFundingOpen} onOpenChange={setIsFundingOpen} />
    </div>
  )
}
