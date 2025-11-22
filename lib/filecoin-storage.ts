"use server"

// Filecoin storage integration using Synapse SDK
// Note: This is a server-side only module as Synapse SDK requires Node.js environment

interface ExpenseTransaction {
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
}

// Store transactions in memory (replace with actual Filecoin storage)
const transactionStore: ExpenseTransaction[] = []

export async function storeTransaction(transaction: ExpenseTransaction): Promise<{ pieceCid: string; size: number }> {
  console.log("[v0] Storing transaction to Filecoin:", transaction)

  // Add to local store
  transactionStore.push(transaction)

  // TODO: Integrate with Synapse SDK when ready
  // For now, return mock data
  const mockPieceCid = `bafk2bzaced${Math.random().toString(36).substring(2, 15)}`

  console.log("[v0] Transaction stored with CID:", mockPieceCid)

  return {
    pieceCid: mockPieceCid,
    size: JSON.stringify(transaction).length,
  }
}

export async function getTransactions(): Promise<ExpenseTransaction[]> {
  console.log("[v0] Fetching transactions from storage, count:", transactionStore.length)
  return transactionStore
}

export async function getTransactionById(id: string): Promise<ExpenseTransaction | null> {
  return transactionStore.find((t) => t.id === id) || null
}
