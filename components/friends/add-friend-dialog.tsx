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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAccount } from "wagmi"
import { useToast } from "@/hooks/use-toast"
import { inviteFriendByEmail } from "@/app/actions/friends"
import { addMemberToGroup } from "@/app/actions/groups" // Imported addMemberToGroup

interface AddFriendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFriendAdded: () => void
  groupId?: string // Added groupId prop
}

export function AddFriendDialog({ open, onOpenChange, onFriendAdded, groupId }: AddFriendDialogProps) {
  const [walletAddress, setWalletAddress] = useState("")
  const [email, setEmail] = useState("")
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

    if (!groupId) {
      toast({
        title: "Error",
        description: "No group selected",
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
      const result = await addMemberToGroup(groupId, walletAddress)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Member added successfully!",
      })

      setWalletAddress("")
      setDisplayName("")
      onOpenChange(false)
      onFriendAdded()
    } catch (error: any) {
      // Added type annotation for error
      console.error("[v0] Failed to add member:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteByEmail = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await inviteFriendByEmail(address, email, displayName)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Invitation Sent!",
        description: `An invitation has been sent to ${email}`,
      })

      setEmail("")
      setDisplayName("")
      onOpenChange(false)
      onFriendAdded()
    } catch (error) {
      console.error("[v0] Failed to invite friend:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
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
          <DialogTitle>Add Member</DialogTitle> {/* Updated title */}
          <DialogDescription>Add a member to this group by their wallet address.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet">Wallet Address</TabsTrigger>
            <TabsTrigger value="email">Email Invite</TabsTrigger>
          </TabsList>
          <TabsContent value="wallet" className="space-y-4">
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
                <Label htmlFor="display-name-wallet">Display Name (Optional)</Label>
                <Input
                  id="display-name-wallet"
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
                {isLoading ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="email" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display-name-email">Display Name (Optional)</Label>
                <Input
                  id="display-name-email"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your friend will receive an email invitation to join Splitchain.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleInviteByEmail} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
