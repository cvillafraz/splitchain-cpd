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
import { storeTransaction } from "@/lib/filecoin-storage"
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
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const description = formData.get("description") as string
    const amount = Number.parseFloat(formData.get("amount") as string)

    console.log("[v0] Creating expense:", { description, amount, chain: selectedChain.name })

    try {
      const participants = [address!, ...Array.from(selectedFriends)]
      const shareAmount = amount / participants.length
      const shares: Record<string, number> = {}
      participants.forEach((participant) => {
        shares[participant] = shareAmount
      })

      const transaction = {
        id: `exp-${Date.now()}`,
        description,
        amount,
        currency: selectedChain.nativeCurrency,
        chain: selectedChain.name,
        date: new Date(),
        type: "owed" as const,
        participants,
        paidBy: address!,
        shares,
      }

      const { pieceCid } = await storeTransaction(transaction)
      console.log("[v0] Transaction stored with CID:", pieceCid)

      onExpenseCreated?.()
      onOpenChange(false)
      setSelectedFriends(new Set())
    } catch (error) {
      console.error("[v0] Failed to store transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>Create a new expense to split with your friends.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
              <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">
                {selectedChain.nativeCurrency}
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                className="pl-16"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="split" className="text-right">
              Split By
            </Label>
            <Select name="split" defaultValue="equal">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select split type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equally</SelectItem>
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
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {friend.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm flex-1">{friend.display_name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || selectedFriends.size === 0}>
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
