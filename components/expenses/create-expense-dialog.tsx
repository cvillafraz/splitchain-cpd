"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Split } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import { storeTransaction } from "@/lib/storage"
import { useAccount } from "wagmi"
import { getFriends } from "@/app/actions/friends"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExpenseCreated?: () => void
}

export function CreateExpenseDialog({ open, onOpenChange, onExpenseCreated }: CreateExpenseDialogProps) {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0])
  const [friends, setFriends] = useState<Array<{ id: string; wallet_address: string; display_name: string }>>([])
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set())
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [amount, setAmount] = useState<string>("")
  const [paidBy, setPaidBy] = useState<string>("")

  useEffect(() => {
    const loadFriends = async () => {
      if (!address || !open) return

      setLoadingFriends(true)
      try {
        const friendsList = await getFriends(address)
        setFriends(friendsList)
      } catch (error) {
        console.error("[v0] Failed to load friends:", error)
      } finally {
        setLoadingFriends(false)
      }
    }

    loadFriends()
  }, [address, open])

  useEffect(() => {
    if (!open) {
      setSelectedFriends(new Set())
      setAmount("")
      setPaidBy("")
    } else if (address && !paidBy) {
      setPaidBy(address)
    }
  }, [open, address, paidBy])

  const toggleFriend = (walletAddress: string) => {
    const newSelected = new Set(selectedFriends)
    if (newSelected.has(walletAddress)) {
      newSelected.delete(walletAddress)
    } else {
      newSelected.add(walletAddress)
    }
    setSelectedFriends(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!address) return

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const description = formData.get("description") as string
    const totalAmount = Number.parseFloat(amount)

    try {
      const participants = [address, ...Array.from(selectedFriends)]
      const shareAmount = totalAmount / participants.length
      const shares: Record<string, number> = {}

      participants.forEach((participant) => {
        shares[participant.toLowerCase()] = shareAmount
      })

      const transaction = {
        description,
        amount: totalAmount,
        currency: selectedChain.nativeCurrency,
        chain: selectedChain.name,
        date: new Date(),
        type: "owed" as const,
        participants: participants.map((p) => p.toLowerCase()),
        paidBy: (paidBy || address).toLowerCase(),
        shares,
      }

      await storeTransaction(transaction)

      onExpenseCreated?.()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Failed to store transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 gap-0 bg-card border-border flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
          <DialogHeader className="p-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Create a new expense to split equally with your friends.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 p-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Dinner, Uber, etc."
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chain" className="text-right">
                  Chain
                </Label>
                <Select
                  value={selectedChain.name}
                  onValueChange={(name) => {
                    const chain = SUPPORTED_CHAINS.find((c) => c.name === name)
                    if (chain) setSelectedChain(chain)
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.map((chain) => (
                      <SelectItem key={chain.name} value={chain.name}>
                        <div className="flex items-center gap-2">
                          <span>{chain.logo}</span>
                          <span>{chain.name}</span>
                          <span className="text-muted-foreground text-xs">({chain.nativeCurrency})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">ETH</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-16"
                    min="0.0001"
                    step="0.0001"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paidBy" className="text-right">
                  Paid By
                </Label>
                <Select value={paidBy} onValueChange={setPaidBy}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={address || ""}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          ME
                        </div>
                        <span>You</span>
                      </div>
                    </SelectItem>
                    {friends.map((friend) => (
                      <SelectItem key={friend.id} value={friend.wallet_address}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {friend.display_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{friend.display_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">With</Label>
                <div className="col-span-3 space-y-2">
                  {loadingFriends ? (
                    <div className="text-sm text-muted-foreground">Loading friends...</div>
                  ) : friends.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No friends added yet. Add friends from the Friends tab to split expenses.
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-2 p-2 rounded-md border border-input bg-background/50"
                      >
                        <Checkbox
                          checked={selectedFriends.has(friend.wallet_address)}
                          onCheckedChange={() => toggleFriend(friend.wallet_address)}
                        />
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {friend.display_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm flex-1 truncate">{friend.display_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 flex-shrink-0 border-t bg-background/95 backdrop-blur">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !amount || Number.parseFloat(amount) <= 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Split className="mr-2 h-4 w-4" /> Split Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
