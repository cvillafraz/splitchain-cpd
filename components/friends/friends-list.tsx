"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import { useAccount } from "wagmi"
import { useToast } from "@/hooks/use-toast"
import { getGroupMembers } from "@/app/actions/groups"
import { EditFriendDialog } from "./edit-friend-dialog"

interface Friend {
  id: string
  wallet_address: string
  display_name: string
}

interface FriendsListProps {
  refreshTrigger: number
  groupId?: string // Added groupId prop
}

export function FriendsList({ refreshTrigger, groupId }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const { address } = useAccount()
  const { toast } = useToast()

  useEffect(() => {
    if (!address || !groupId) {
      // Check for groupId
      setFriends([])
      setIsLoading(false)
      return
    }

    const loadFriends = async () => {
      setIsLoading(true)
      try {
        const members = await getGroupMembers(groupId)
        const filteredMembers = members
          .filter((m: any) => m.wallet_address.toLowerCase() !== address.toLowerCase())
          .map((m: any) => ({
            id: m.wallet_address,
            wallet_address: m.wallet_address,
            display_name: m.display_name,
          }))

        setFriends(filteredMembers)
      } catch (error) {
        console.error("[v0] Failed to load members:", error)
        toast({
          title: "Error",
          description: "Failed to load group members",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFriends()
  }, [address, refreshTrigger, groupId, toast]) // Added groupId dependency

  const handleRemoveFriend = async (friendWallet: string) => {
    toast({
      title: "Info",
      description: "Removing members from groups is not yet implemented.",
    })
    /* 
    if (!address) return

    try {
      const result = await removeFriend(address, friendWallet)

      if (!result.success) {
        throw new Error(result.error)
      }

      setFriends((prev) => prev.filter((f) => f.wallet_address !== friendWallet))

      toast({
        title: "Success",
        description: "Friend removed successfully",
      })
    } catch (error) {
      console.error("[v0] Failed to remove friend:", error)
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      })
    }
    */
  }

  const handleEditFriend = (friend: Friend) => {
    setSelectedFriend(friend)
    setEditDialogOpen(true)
  }

  const handleFriendUpdated = () => {
    if (!address || !groupId) return

    const loadFriends = async () => {
      try {
        const members = await getGroupMembers(groupId)
        const filteredMembers = members
          .filter((m: any) => m.wallet_address.toLowerCase() !== address.toLowerCase())
          .map((m: any) => ({
            id: m.wallet_address,
            wallet_address: m.wallet_address,
            display_name: m.display_name,
          }))

        setFriends(filteredMembers)
      } catch (error) {
        console.error("[v0] Failed to reload members:", error)
      }
    }

    loadFriends()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">Loading members...</CardContent>
      </Card>
    )
  }

  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">No other members in this group yet.</CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {friends.map((friend) => (
          <Card key={friend.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {friend.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{friend.display_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{friend.wallet_address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditFriend(friend)}>
                  <Pencil className="h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveFriend(friend.wallet_address)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 hover:text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditFriendDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onFriendUpdated={handleFriendUpdated}
        friend={selectedFriend}
      />
    </>
  )
}
