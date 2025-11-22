"use server"

import { createClient } from "@supabase/supabase-js"

// Use the service role key to bypass RLS for this prototype
// In a real app, you'd validate the user's session/signature here
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function addFriend(userWallet: string, friendWallet: string, displayName?: string) {
  try {
    // 1. Ensure current user has a profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet_address", userWallet.toLowerCase())
      .single()

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        wallet_address: userWallet.toLowerCase(),
        display_name: userWallet.slice(0, 8),
      })
    }

    // 2. Ensure friend has a profile
    const { data: friendProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet_address", friendWallet.toLowerCase())
      .single()

    if (!friendProfile) {
      await supabase.from("profiles").insert({
        wallet_address: friendWallet.toLowerCase(),
        display_name: displayName || friendWallet.slice(0, 8),
      })
    } else if (displayName && friendProfile.display_name !== displayName) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("wallet_address", friendWallet.toLowerCase())
    }

    // 3. Check for existing friendship
    const { data: existingFriendship } = await supabase
      .from("friends")
      .select("*")
      .or(
        `and(user_wallet.eq.${userWallet.toLowerCase()},friend_wallet.eq.${friendWallet.toLowerCase()}),and(user_wallet.eq.${friendWallet.toLowerCase()},friend_wallet.eq.${userWallet.toLowerCase()})`,
      )
      .single()

    if (existingFriendship) {
      return { success: false, error: "Already friends" }
    }

    // 4. Add friendship
    const { error } = await supabase.from("friends").insert({
      user_wallet: userWallet.toLowerCase(),
      friend_wallet: friendWallet.toLowerCase(),
      status: "accepted",
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error adding friend:", error)
    return { success: false, error: "Failed to add friend" }
  }
}

export async function getFriends(userWallet: string) {
  try {
    // Get all friendships where current user is involved
    const { data: friendships, error: friendshipsError } = await supabase
      .from("friends")
      .select("*")
      .or(`user_wallet.eq.${userWallet.toLowerCase()},friend_wallet.eq.${userWallet.toLowerCase()}`)
      .eq("status", "accepted")

    if (friendshipsError) throw friendshipsError

    // Extract friend wallet addresses
    const friendWallets =
      friendships?.map((f) =>
        f.user_wallet.toLowerCase() === userWallet.toLowerCase() ? f.friend_wallet : f.user_wallet,
      ) || []

    const mockFriends = [
      {
        id: "mock-1",
        wallet_address: "0x1234567890123456789012345678901234567890",
        display_name: "Alice (Demo)",
        created_at: new Date().toISOString(),
      },
      {
        id: "mock-2",
        wallet_address: "0x0987654321098765432109876543210987654321",
        display_name: "Bob (Demo)",
        created_at: new Date().toISOString(),
      },
    ]

    if (friendWallets.length === 0) {
      return mockFriends
    }

    // Get friend profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("wallet_address", friendWallets)

    if (profilesError) throw profilesError

    return [...mockFriends, ...(profiles || [])]
  } catch (error) {
    console.error("Error fetching friends:", error)
    return [
      {
        id: "mock-1",
        wallet_address: "0x1234567890123456789012345678901234567890",
        display_name: "Alice (Demo)",
      },
      {
        id: "mock-2",
        wallet_address: "0x0987654321098765432109876543210987654321",
        display_name: "Bob (Demo)",
      },
    ]
  }
}

export async function removeFriend(userWallet: string, friendWallet: string) {
  if (friendWallet.startsWith("0x123") || friendWallet.startsWith("0x098")) {
    return { success: true }
  }

  try {
    const { error } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_wallet.eq.${userWallet.toLowerCase()},friend_wallet.eq.${friendWallet.toLowerCase()}),and(user_wallet.eq.${friendWallet.toLowerCase()},friend_wallet.eq.${userWallet.toLowerCase()})`,
      )

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error removing friend:", error)
    return { success: false, error: "Failed to remove friend" }
  }
}
