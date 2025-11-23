"use server"

import { createClient } from "@/lib/supabase/server"

export interface ExpenseTransaction {
  id: string
  description: string
  amount: number
  currency: string
  chain: string
  date: Date
  type: "owed" | "owing" | "settled"
  participants: string[]
  paidBy: string
  shares: Record<string, number>
  groupId?: string // Added optional groupId
}

export async function storeTransaction(transaction: Omit<ExpenseTransaction, "id">): Promise<ExpenseTransaction> {
  const supabase = await createClient()

  // Ensure date is a valid ISO string
  const dateStr =
    transaction.date instanceof Date ? transaction.date.toISOString() : new Date(transaction.date).toISOString()

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency,
      chain: transaction.chain,
      date: dateStr,
      type: transaction.type,
      paid_by: transaction.paidBy,
      participants: transaction.participants,
      shares: transaction.shares,
      group_id: transaction.groupId, // passing group_id
    })
    .select()
    .single()

  if (error) {
    console.error("Error storing transaction:", error)
    throw new Error("Failed to store transaction")
  }

  return {
    id: data.id,
    description: data.description,
    amount: Number(data.amount),
    currency: data.currency,
    chain: data.chain,
    date: new Date(data.date),
    type: data.type as "owed" | "owing" | "settled",
    participants: data.participants,
    paidBy: data.paid_by,
    shares: data.shares,
    groupId: data.group_id, // returning group_id
  }
}

export async function getTransactions(groupId?: string): Promise<ExpenseTransaction[]> {
  // added optional groupId filter
  const supabase = await createClient()

  let query = supabase.from("transactions").select("*").order("date", { ascending: false })

  if (groupId) {
    query = query.eq("group_id", groupId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data.map((t) => ({
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    currency: t.currency,
    chain: t.chain,
    date: new Date(t.date),
    type: t.type as "owed" | "owing" | "settled",
    participants: t.participants,
    paidBy: t.paid_by,
    shares: t.shares,
    groupId: t.group_id, // mapping group_id
  }))
}

export async function getTransactionById(id: string): Promise<ExpenseTransaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("transactions").select("*").eq("id", id).single()

  if (error) {
    return null
  }

  return {
    id: data.id,
    description: data.description,
    amount: Number(data.amount),
    currency: data.currency,
    chain: data.chain,
    date: new Date(data.date),
    type: data.type as "owed" | "owing" | "settled",
    participants: data.participants,
    paidBy: data.paid_by,
    shares: data.shares,
    groupId: data.group_id, // returning group_id
  }
}

// Added function to delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting transaction:", error)
    throw new Error("Failed to delete transaction")
  }
}

export async function markTransactionsAsSettled(transactionIds: string[]): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("transactions").update({ type: "settled" }).in("id", transactionIds)

  if (error) {
    console.error("Error marking transactions as settled:", error)
    throw new Error("Failed to mark transactions as settled")
  }
}

export async function markTransactionAsSettled(transactionId: string): Promise<void> {
  await markTransactionsAsSettled([transactionId])
}
