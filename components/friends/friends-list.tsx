"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useAccount } from "wagmi"
import { useToast } from "@/hooks/use-toast"
import { getFriends, removeFriend } from "@/app/actions/friends"

interface Friend {
  id: string
  wallet_address: string
  display_name: string
}

interface FriendsListProps {
  refreshTrigger: number
}

export function FriendsList({ refreshTrigger }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { address } = useAccount()
  const { toast } = useToast()

  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    const loadFriends = async () => {
      setIsLoading(true) // Ensure loading state is reset on refresh
      try {
        const profiles = await getFriends(address)
        setFriends(profiles)
      } catch (error) {
        console.error("[v0] Failed to load friends:", error)
        toast({
          title: "Error",
          description: "Failed to load friends list",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFriends()
  }, [address, refreshTrigger, toast])

  const handleRemoveFriend = async (friendWallet: string) => {
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
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">Loading friends...</CardContent>
      </Card>
    )
  }

  if (friends.length === 0) {
    return null
  }

  return (
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
            <Button variant="ghost" size="icon" onClick={() => handleRemoveFriend(friend.wallet_address)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
