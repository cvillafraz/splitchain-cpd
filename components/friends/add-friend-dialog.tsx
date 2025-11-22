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
import { createClient } from "@/lib/supabase/client"
import { useAccount } from "wagmi"
import { useToast } from "@/hooks/use-toast"

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
  const supabase = createClient()

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
      // First, ensure the current user has a profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", address.toLowerCase())
        .single()

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          wallet_address: address.toLowerCase(),
          display_name: address.slice(0, 8),
        })
      }

      // Check if friend profile exists, if not create it
      const { data: friendProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single()

      if (!friendProfile) {
        await supabase.from("profiles").insert({
          wallet_address: walletAddress.toLowerCase(),
          display_name: displayName || walletAddress.slice(0, 8),
        })
      } else if (displayName && friendProfile.display_name !== displayName) {
        // Update display name if provided and different
        await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("wallet_address", walletAddress.toLowerCase())
      }

      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_wallet.eq.${address.toLowerCase()},friend_wallet.eq.${walletAddress.toLowerCase()}),and(user_wallet.eq.${walletAddress.toLowerCase()},friend_wallet.eq.${address.toLowerCase()})`,
        )
        .single()

      if (existingFriendship) {
        toast({
          title: "Already friends",
          description: "This user is already in your friends list",
        })
        setIsLoading(false)
        return
      }

      // Add friend
      const { error: friendError } = await supabase.from("friends").insert({
        user_wallet: address.toLowerCase(),
        friend_wallet: walletAddress.toLowerCase(),
        status: "accepted",
      })

      if (friendError) throw friendError

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
