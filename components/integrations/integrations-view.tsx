"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ArrowUpRight, Database, Shield, Wallet, CreditCard, Check } from "lucide-react"

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "auth", label: "Authentication" },
  { id: "payments", label: "Payments" },
  { id: "wallets", label: "Wallets" },
  { id: "analytics", label: "Analytics" },
]

const INTEGRATIONS = [
  {
    id: "supabase",
    name: "Supabase",
    description:
      "Open source Firebase alternative. Postgres database, Authentication, instant APIs, Edge Functions, Realtime subscriptions, and Storage.",
    category: "auth",
    icon: Database,
    installed: false,
    featured: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description:
      "Financial infrastructure platform for the internet. Millions of companies of all sizes use Stripe to accept payments and send payouts.",
    category: "payments",
    icon: CreditCard,
    installed: false,
    featured: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Pay",
    description:
      "The easiest way to onramp users to crypto. Allow your users to buy or transfer crypto with their existing Coinbase accounts.",
    category: "wallets",
    icon: Wallet,
    installed: true,
    featured: false,
  },
  {
    id: "clerk",
    name: "Clerk",
    description: "Complete user management and authentication. Purpose-built for React and the Modern Web.",
    category: "auth",
    icon: Shield,
    installed: false,
    featured: false,
  },
  {
    id: "dynamic",
    name: "Dynamic",
    description: "Powerful multi-chain wallet adapter and embedded wallet infrastructure.",
    category: "wallets",
    icon: Wallet,
    installed: false,
    featured: false,
  },
]

export function IntegrationsView() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [installedState, setInstalledState] = useState<Record<string, boolean>>({
    coinbase: true,
  })

  const filteredIntegrations = INTEGRATIONS.filter((integration) => {
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleInstall = (id: string) => {
    setInstalledState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="flex min-h-[600px] w-full bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border p-6 hidden md:block">
        <div className="space-y-1">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                selectedCategory === category.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Installed
            </Button>
            <Button variant="outline" size="sm">
              Console
            </Button>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-8">
          {/* Featured Section (only show if All is selected and no search) */}
          {selectedCategory === "all" && !searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Featured Integrations</h2>
                <a href="#" className="text-sm text-primary flex items-center gap-1 hover:underline">
                  View all <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-[#1C1C1C] border-border overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Database className="h-12 w-12 text-blue-400" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">Supabase</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        The open source Firebase alternative. Postgres database, Authentication, instant APIs.
                      </p>
                      <Button
                        className="w-full"
                        variant={installedState["supabase"] ? "outline" : "default"}
                        onClick={() => toggleInstall("supabase")}
                      >
                        {installedState["supabase"] ? "Manage" : "Install"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1C1C1C] border-border overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <CreditCard className="h-12 w-12 text-violet-400" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2">Stripe</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        Financial infrastructure platform for the internet. Payments, payouts, and more.
                      </p>
                      <Button
                        className="w-full"
                        variant={installedState["stripe"] ? "outline" : "default"}
                        onClick={() => toggleInstall("stripe")}
                      >
                        {installedState["stripe"] ? "Manage" : "Install"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* List Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {selectedCategory === "all"
                ? "All Integrations"
                : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
            </h2>
            <div className="grid gap-4">
              {filteredIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                      <integration.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 hidden md:block max-w-md">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {installedState[integration.id] && (
                      <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
                        <Check className="h-3 w-3" />
                        <span>Added</span>
                      </div>
                    )}
                    <Button
                      variant={installedState[integration.id] ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleInstall(integration.id)}
                    >
                      {installedState[integration.id] ? "Manage" : "Add"}
                    </Button>
                  </div>
                </div>
              ))}
              {filteredIntegrations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No integrations found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
