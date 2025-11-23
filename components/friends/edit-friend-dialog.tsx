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
import { useToast } from "@/hooks/use-toast"
import { updateMemberDisplayName } from "@/app/actions/groups"

interface EditFriendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFriendUpdated: () => void
  friend: {
    wallet_address: string
    display_name: string
  } | null
}

export function EditFriendDialog({ open, onOpenChange, onFriendUpdated, friend }: EditFriendDialogProps) {
  const [displayName, setDisplayName] = useState(friend?.display_name || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    if (!friend) return

    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a display name",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await updateMemberDisplayName(friend.wallet_address, displayName)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Display name updated successfully!",
      })

      onOpenChange(false)
      onFriendUpdated()
    } catch (error: any) {
      console.error("[v0] Failed to update display name:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update display name",
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
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>Update the display name for this member.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet">Wallet Address</Label>
            <Input id="wallet" value={friend?.wallet_address || ""} disabled className="font-mono text-sm" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              placeholder="Enter display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
