"use server"

import { createClient } from "@/lib/supabase/server"

export interface Group {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  memberCount?: number
}

export async function ensureUserSetup(walletAddress: string) {
  const supabase = await createClient()
  const wallet = walletAddress.toLowerCase()

  try {
    // 1. Ensure Profile Exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet_address", wallet)
      .maybeSingle()

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        wallet_address: wallet,
        display_name: wallet.slice(0, 8),
      })
    }

    // 2. Check if user belongs to any group
    const { data: memberships } = await supabase.from("group_members").select("group_id").eq("wallet_address", wallet)

    if (!memberships || memberships.length === 0) {
      // 3. Create Default Group
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: "Default Group",
          created_by: wallet,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // 4. Add user to Default Group
      await supabase.from("group_members").insert({
        group_id: newGroup.id,
        wallet_address: wallet,
        role: "admin",
      })

      return { success: true, groupId: newGroup.id, groupName: "Default Group" }
    }

    // Return the first group found as default
    return { success: true, groupId: memberships[0].group_id }
  } catch (error) {
    console.error("Error ensuring user setup:", error)
    return { success: false, error: "Failed to setup user" }
  }
}

export async function getUserGroups(walletAddress: string): Promise<Group[]> {
  const supabase = await createClient()
  const wallet = walletAddress.toLowerCase()

  try {
    const { data: memberships, error } = await supabase
      .from("group_members")
      .select(`
        group_id,
        groups (
          id,
          name,
          created_by,
          created_at
        )
      `)
      .eq("wallet_address", wallet)

    if (error) throw error

    return memberships.map((m: any) => ({
      id: m.groups.id,
      name: m.groups.name,
      createdBy: m.groups.created_by,
      createdAt: new Date(m.groups.created_at),
    }))
  } catch (error) {
    console.error("Error fetching user groups:", error)
    return []
  }
}

export async function createGroup(walletAddress: string, name: string) {
  const supabase = await createClient()
  const wallet = walletAddress.toLowerCase()

  try {
    const { data: newGroup, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        created_by: wallet,
      })
      .select()
      .single()

    if (groupError) throw groupError

    await supabase.from("group_members").insert({
      group_id: newGroup.id,
      wallet_address: wallet,
      role: "admin",
    })

    return { success: true, group: newGroup }
  } catch (error) {
    console.error("Error creating group:", error)
    return { success: false, error: "Failed to create group" }
  }
}

export async function addMemberToGroup(groupId: string, walletAddress: string, displayName?: string) {
  const supabase = await createClient()
  const wallet = walletAddress.toLowerCase()

  try {
    // Check if profile exists, if not create it
    const { data: profile } = await supabase.from("profiles").select("*").eq("wallet_address", wallet).maybeSingle()

    if (!profile) {
      const { error: createProfileError } = await supabase.from("profiles").insert({
        wallet_address: wallet,
        display_name: displayName || wallet.slice(0, 8),
      })

      if (createProfileError) {
        // If error is not a unique violation (meaning it was created concurrently), throw it
        if (createProfileError.code !== "23505") {
          console.error("Error creating profile for new member:", createProfileError)
          throw createProfileError
        }
      }
    } else if (displayName && profile.display_name === profile.wallet_address.slice(0, 8)) {
      await supabase.from("profiles").update({ display_name: displayName }).eq("wallet_address", wallet)
    }

    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      wallet_address: wallet,
      role: "member",
    })

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return { success: false, error: "User is already a member" }
      }
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding member:", error)
    return { success: false, error: "Failed to add member" }
  }
}

export async function getGroupMembers(groupId: string) {
  const supabase = await createClient()

  try {
    const { data: members, error } = await supabase
      .from("group_members")
      .select(`
        wallet_address,
        role,
        joined_at,
        profiles (
          display_name
        )
      `)
      .eq("group_id", groupId)

    if (error) throw error

    return members.map((m: any) => ({
      wallet_address: m.wallet_address,
      display_name: m.profiles?.display_name || m.wallet_address.slice(0, 8),
      role: m.role,
      joined_at: new Date(m.joined_at),
    }))
  } catch (error) {
    console.error("Error fetching group members:", error)
    return []
  }
}

export async function updateMemberDisplayName(walletAddress: string, displayName: string) {
  const supabase = await createClient()
  const wallet = walletAddress.toLowerCase()

  try {
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("wallet_address", wallet)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating member display name:", error)
    return { success: false, error: "Failed to update display name" }
  }
}
