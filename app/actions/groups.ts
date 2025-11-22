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
