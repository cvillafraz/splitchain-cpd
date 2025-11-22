"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { BarChart3, TrendingUp } from "lucide-react" // Importing the missing components

const data = [
  {
    name: "Mon",
    total: 145,
  },
  {
    name: "Tue",
    total: 89,
  },
  {
    name: "Wed",
    total: 230,
  },
  {
    name: "Thu",
    total: 110,
  },
  {
    name: "Fri",
    total: 290,
  },
  {
    name: "Sat",
    total: 180,
  },
  {
    name: "Sun",
    total: 95,
  },
]

const categoryData = [
  { category: "Food", amount: 450, color: "var(--primary)" },
  { category: "Transport", amount: 120, color: "var(--secondary)" },
  { category: "Utilities", amount: 300, color: "var(--accent)" },
  { category: "Entertainment", amount: 200, color: "var(--muted-foreground)" },
]

export function AnalyticsView() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Spending</CardTitle>
            <CardDescription>Your expense activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Where your money is going this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(item.amount / 1070) * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">${item.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Smart analysis of your spending habits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 flex gap-4 items-start">
            <div className="p-2 bg-primary/20 rounded-full text-primary mt-1">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-primary">Spending is up 15%</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You've spent $145 more on dining out compared to last week. Consider cooking at home to save ~30 USDC.
              </p>
            </div>
          </div>
          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 flex gap-4 items-start">
            <div className="p-2 bg-secondary/20 rounded-full text-secondary mt-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-secondary">You're a lending pro!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You've settled 95% of expenses within 24 hours. Your trust score is increasing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
