"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Receipt, UserPlus, History, Zap, CreditCard, LayoutGrid } from "lucide-react"
import { CreateExpenseDialog } from "@/components/expenses/create-expense-dialog"
import { ExpenseList } from "@/components/expenses/expense-list"
import { CoinbaseFundingDialog } from "@/components/wallet/coinbase-funding-dialog"
import { WalletManagerDialog } from "@/components/wallet/wallet-manager-dialog" // Import new dialog
import { IntegrationsView } from "@/components/integrations/integrations-view"
import { AddFriendDialog } from "@/components/friends/add-friend-dialog"
import { FriendsList } from "@/components/friends/friends-list"
import { useAccount, useBalance, useChainId } from "wagmi"
import { sepolia } from "wagmi/chains"
import { formatUnits } from "viem"
import { getTransactions } from "@/lib/storage"
import { SettleAllDialog } from "@/components/payments/settle-all-dialog"
import { getUserGroups, type Group } from "@/app/actions/groups"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardProps {
  walletAddress: string
}

export function Dashboard({ walletAddress: propAddress }: DashboardProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const walletAddress = address || propAddress

  const { data: ethBalance, isLoading: isLoadingBalance } = useBalance({
    address: address as `0x${string}`,
    chainId: sepolia.id,
    query: {
      enabled: !!address,
    },
  })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isFundingOpen, setIsFundingOpen] = useState(false)
  const [isWalletManagerOpen, setIsWalletManagerOpen] = useState(false) // Add state for wallet manager
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false)
  const [friendsRefreshTrigger, setFriendsRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("expenses")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [totalOwed, setTotalOwed] = useState(0)
  const [totalYouOwe, setTotalYouOwe] = useState(0)
  const [isSettleAllOpen, setIsSettleAllOpen] = useState(false)
  const [outstandingDebts, setOutstandingDebts] = useState<{ address: string; amount: number }[]>([])
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")

  useEffect(() => {
    const loadGroups = async () => {
      if (!address) return
      try {
        const groups = await getUserGroups(address)
        setUserGroups(groups)
        if (groups.length > 0 && !selectedGroupId) {
          setSelectedGroupId(groups[0].id)
        }
      } catch (error) {
        console.error("Failed to load groups:", error)
      }
    }
    loadGroups()
  }, [address])

  useEffect(() => {
    const calculateTotals = async () => {
      if (!address) return

      try {
        const transactions = await getTransactions(selectedGroupId)

        let owed = 0
        let owing = 0
        const userAddress = address.toLowerCase().trim()
        const debtsByCreditor: Record<string, number> = {}

        console.log("[v0] Calculating totals for:", userAddress)

        transactions.forEach((transaction) => {
          const shares = transaction.shares || {}
          const paidByAddress = (transaction.paidBy || "").toLowerCase().trim()
          const iPaid = paidByAddress === userAddress

          let myShare = 0
          Object.entries(shares).forEach(([participant, share]) => {
            if (participant.toLowerCase().trim() === userAddress) {
              myShare = Number(share)
            }
          })

          const isSettled = transaction.type === "settled"
          if (isSettled) return

          if (iPaid) {
            owed += transaction.amount - myShare
          } else {
            if (myShare > 0) {
              const amountToPay = Number(myShare)
              owing += amountToPay
              if (!debtsByCreditor[paidByAddress]) {
                debtsByCreditor[paidByAddress] = 0
              }
              debtsByCreditor[paidByAddress] += amountToPay
            }
          }
        })

        console.log("[v0] Calculated totals - Owed:", owed, "Owing:", owing)
        setTotalOwed(owed)
        setTotalYouOwe(owing)

        const debtsArray = Object.entries(debtsByCreditor)
          .map(([addr, amt]) => ({
            address: addr,
            amount: amt,
          }))
          .filter((d) => d.amount > 0)

        setOutstandingDebts(debtsArray)
      } catch (error) {
        console.error("[v0] Failed to calculate totals:", error)
      }
    }

    calculateTotals()
  }, [refreshTrigger, address, selectedGroupId])

  const handleExpenseCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSettled = () => {
    setRefreshTrigger((prev) => prev + 1)
    setIsSettleAllOpen(false)
  }

  const handleFriendAdded = () => {
    setFriendsRefreshTrigger((prev) => prev + 1)
  }

  const formattedBalance = ethBalance
    ? `${Number.parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4)} ETH`
    : "0.0000 ETH"

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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Manage your shared expenses</p>
            {userGroups.length > 0 && (
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="h-8 w-[180px] ml-2">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> New Expense
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed to You</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+${totalOwed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From active expenses</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total You Owe</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">-${totalYouOwe.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pending settlements</p>
          </CardContent>
        </Card>
        <Card
          className="bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => setIsWalletManagerOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance (ETH)</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {isLoadingBalance ? <span className="text-muted-foreground">Loading...</span> : formattedBalance}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFundingOpen(true)
                }}
              >
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
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => setIsSettleAllOpen(true)}
            disabled={totalYouOwe <= 0}
          >
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
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="mt-4">
          <ExpenseList refreshTrigger={refreshTrigger} groupId={selectedGroupId} />
        </TabsContent>
        <TabsContent value="friends" className="mt-4">
          <div className="space-y-4">
            <FriendsList refreshTrigger={friendsRefreshTrigger} groupId={selectedGroupId} />
            <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <UserPlus className="h-10 w-10 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Add Members</h3>
              <p className="text-sm max-w-xs mx-auto mb-4">
                Add members to <strong>{userGroups.find((g) => g.id === selectedGroupId)?.name || "group"}</strong> to
                start splitting expenses.
              </p>
              <Button onClick={() => setIsAddFriendOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <CreateExpenseDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onExpenseCreated={handleExpenseCreated}
        groupId={selectedGroupId}
      />
      <CoinbaseFundingDialog open={isFundingOpen} onOpenChange={setIsFundingOpen} />
      <WalletManagerDialog
        open={isWalletManagerOpen}
        onOpenChange={setIsWalletManagerOpen}
        address={walletAddress}
        balance={formattedBalance}
        onFundClick={() => setIsFundingOpen(true)}
      />
      <AddFriendDialog
        open={isAddFriendOpen}
        onOpenChange={setIsAddFriendOpen}
        onFriendAdded={handleFriendAdded}
        groupId={selectedGroupId}
      />
      <SettleAllDialog
        open={isSettleAllOpen}
        onOpenChange={setIsSettleAllOpen}
        debts={outstandingDebts}
        onSettled={handleSettled}
      />
    </div>
  )
}
