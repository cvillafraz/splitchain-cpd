"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAccount } from "wagmi"
import { useToast } from "@/hooks/use-toast"

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
  const supabase = createClient()

  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    const loadFriends = async () => {
      try {
        // Get all friendships where current user is involved
        const { data: friendships, error: friendshipsError } = await supabase
          .from("friends")
          .select("*")
          .or(`user_wallet.eq.${address.toLowerCase()},friend_wallet.eq.${address.toLowerCase()}`)
          .eq("status", "accepted")

        if (friendshipsError) throw friendshipsError

        // Extract friend wallet addresses
        const friendWallets =
          friendships?.map((f) =>
            f.user_wallet.toLowerCase() === address.toLowerCase() ? f.friend_wallet : f.user_wallet,
          ) || []

        if (friendWallets.length === 0) {
          setFriends([])
          setIsLoading(false)
          return
        }

        // Get friend profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("wallet_address", friendWallets)

        if (profilesError) throw profilesError

        setFriends(profiles || [])
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
  }, [address, refreshTrigger, supabase, toast])

  const handleRemoveFriend = async (friendWallet: string) => {
    if (!address) return

    try {
      const { error } = await supabase
        .from("friends")
        .delete()
        .or(
          `and(user_wallet.eq.${address.toLowerCase()},friend_wallet.eq.${friendWallet}),and(user_wallet.eq.${friendWallet},friend_wallet.eq.${address.toLowerCase()})`,
        )

      if (error) throw error

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
