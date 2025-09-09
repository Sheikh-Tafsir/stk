import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function BudgetTransactionMonthlyComponent({ transactions }) {
  const [dailyTransactions, setDailyTransactions] = useState([])

  useEffect(() => {
    // Normalize API data → convert into a common format
    const normalized = transactions.map((item) => {
      const date = new Date(item.year, item.month - 1, item.day) // month is 0-based in JS
      return {
        id: item.id,
        name: item.name,
        description: item.description || "",
        amount: item.amount,
        type: item.typeExpense ? "expense" : "income", // map from typeExpense
        category: item.typeName, // use typeName
        category_color: item.category_color || "#999", // fallback if no color
        transaction_date: date, // YYYY-MM-DD
      }
    })

    // Group by date
    const grouped = normalized.reduce((acc, transaction) => {
      const date = transaction.transaction_date
      if (!acc[date]) acc[date] = []
      acc[date].push(transaction)
      return acc
    }, {})

    // Build daily transactions
    const daily = Object.entries(grouped)
      .map(([date, transactions]) => ({
        date,
        transactions,
        dailyTotal: transactions.reduce(
          (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
          0,
        ),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    setDailyTransactions(daily)
  }, [transactions])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(amount)

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <div className="space-y-6">
      {/* Daily Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily Transactions</CardTitle>
            <CardDescription>All transactions organized by date for the selected month</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dailyTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground">No transactions found for this month.</p>
            )
              :
              dailyTransactions.map((day) => (
                <div key={day.date} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-lg font-semibold text-foreground">{formatDate(day.date)}</h3>
                    <div
                      className={`text-lg font-bold ${day.dailyTotal >= 0 ? "text-chart-1" : "text-chart-3"
                        }`}
                    >
                      {day.dailyTotal >= 0 ? "+" : ""}
                      {formatCurrency(day.dailyTotal)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {day.transactions.map((transaction) => (
                      <Link
                        to={`/budget/transaction/${transaction.id}`}
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 bg-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: transaction.category_color }}
                          />
                          <div>
                            {transaction.name && <p className="font-medium text-card-foreground">{transaction.name}</p>}
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {transaction.category}
                              </Badge>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className={`text-lg font-semibold ${transaction.type === "income" ? "text-chart-1" : "text-chart-3"
                              }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
