import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BudgetTransactionMonthlyComponent } from "./BudgetTransactionMonthlyComponent"
import { MONTHS } from "@/utils/enums"
import { API } from "@/middleware/Api"
import PageLoadingOverlay from "@/mycomponents/pageLoadingOverlay/PageLoadingOverlay"
import BudgetTransactionMonthlyGraph from "./BudgetTransactionMonthlyGraph"

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - i)
const currentMonth = new Date().getMonth() + 1

const BudgetTransactionMonthly = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParams = Object.fromEntries(searchParams.entries());

    const month = queryParams.month || currentMonth
    const year = queryParams.year || currentYear;

    const [transactions, setTransactions] = useState([])
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!isPageLoading) setIsPageLoading(true);

            try {
                const response = await API.get('/budget/transaction', {
                    params: {
                        month,
                        year,
                    }
                });
                // console.log(response.data.data);
                setTransactions(response.data.data || []);
            } catch (error) {
                console.error(error);
                setErrors(error.response?.data || { message: error.message });
            } finally {
                setIsPageLoading(false);
            }
        }

        if (month && year) {
            fetchTransactions();
        }
    }, [month, year]);

    const handleQueryParamsChange = (newValues) => {
        // Merge existing params with new values
        const params = Object.fromEntries(searchParams.entries());
        const updated = { ...params, ...newValues };

        setSearchParams(updated, { replace: true });
    };

    //onChange={(e) => updateFilters({ month: e.target.value })}
    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className="container pt-4 pb-8 min-h-[90vh]">
                <div className="bg-white mb-6 p-8 rounded-lg shadow-sm">
                    <h1>Filter Transactions</h1>
                    <p className="text-sm mb-6">Select month, year, and category to filter your transactions</p>

                    <div className="flex justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Month</label>
                                    {/* <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}> */}
                                    <Select value={month.toString()} onValueChange={(value) => handleQueryParamsChange({ month: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((month) => (
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Year</label>
                                    {/* <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}> */}
                                    <Select value={year.toString()} onValueChange={(value) => handleQueryParamsChange({ year: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            <Link to="/budget/transaction/create" className="my-0">
                                <Button className="bg-blue-600 text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4" />
                                    Add Transaction
                                </Button>
                            </Link>
                        </div>

                    </div>
                </div>

                <BudgetTransactionMonthlyGraph transactions={transactions} />
                <BudgetTransactionMonthlyComponent transactions={transactions} />
            </div>
        </>
    )
}

export default BudgetTransactionMonthly
