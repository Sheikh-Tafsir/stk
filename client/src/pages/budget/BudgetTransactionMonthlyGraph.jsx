import React from "react"
import colors from "tailwindcss/colors"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"

const BudgetTransactionMonthlyGraph = ({ transactions }) => {
    const totalIncome = transactions
        .filter((t) => !t.typeExpense)
        .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions
        .filter((t) => t.typeExpense)
        .reduce((sum, t) => sum + t.amount, 0)

    const savings = totalIncome - totalExpenses

    // Prepare chart data
    const incomeVsExpensesData = [
        { name: "Income", amount: totalIncome, fill: colors.green[600] },
        { name: "Expenses", amount: totalExpenses, fill: colors.red[600] },
    ]

    // Group expenses by category
    const expenseBreakdownData = transactions
        .filter((t) => t.typeExpense)
        .reduce((acc, t) => {
            const existing = acc.find((item) => item.name === t.typeName)
            if (existing) {
                existing.value += t.amount
            } else {
                acc.push({ name: t.typeName, value: t.amount })
            }
            return acc
        }, [])

    // Color palette for categories
    const COLORS = [
        colors.red[600],
        colors.blue[600],
        colors.green[600],
        colors.purple[600],
        colors.amber[600],
    ]

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">BDT {totalIncome.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">BDT {totalExpenses.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+5% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Savings</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">BDT {savings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{((savings / totalIncome) * 100).toFixed(1)}% of income</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Target className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{transactions.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Income vs Expenses Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs Expenses</CardTitle>
                        <CardDescription>
                            Monthly comparison of income and expenses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                income: {
                                    label: "Income",
                                    color: colors.green[600],
                                },
                                expenses: {
                                    label: "Expenses",
                                    color: colors.red[600],
                                },
                            }}
                            className="h-[300px]"
                        >
                                <BarChart data={incomeVsExpensesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="amount" radius={4}>
                                        {incomeVsExpensesData.map((entry, index) => (
                                            <Cell key={index} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Expense Breakdown Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Breakdown</CardTitle>
                        <CardDescription>
                            Distribution of expenses by category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                breakdown: {
                                    label: "Expense Breakdown",
                                    color: colors.red[600],
                                },
                            }}
                            className="h-[300px]"
                        >
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdownData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {expenseBreakdownData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default BudgetTransactionMonthlyGraph
