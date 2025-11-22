"use client"

import { useState } from "react"
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
import { useAccount } from "wagmi"
import { useToast } from "@/hooks/use-toast"
import { addFriend } from "@/app/actions/friends"

interface AddFriendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFriendAdded: () => void
}

export function AddFriendDialog({ open, onOpenChange, onFriendAdded }: AddFriendDialogProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()
  const { toast } = useToast()

  const handleAddFriend = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Please enter a wallet address",
        variant: "destructive",
      })
      return
    }

    if (walletAddress.toLowerCase() === address.toLowerCase()) {
      toast({
        title: "Error",
        description: "You cannot add yourself as a friend",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await addFriend(address, walletAddress, displayName)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Friend added successfully!",
      })

      setWalletAddress("")
      setDisplayName("")
      onOpenChange(false)
      onFriendAdded()
    } catch (error) {
      console.error("[v0] Failed to add friend:", error)
      toast({
        title: "Error",
        description: "Failed to add friend. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>Add a friend by their wallet address to start splitting expenses.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display Name (Optional)</Label>
            <Input
              id="display-name"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddFriend} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Friend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
