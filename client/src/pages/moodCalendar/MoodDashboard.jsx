import { useEffect, useState, useMemo } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { format } from "date-fns"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Calendar, TrendingUp, Smile } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moods } from "./moods"
import { TOAST_TYPE } from "@/utils/enums"
import { API } from "@/middleware/Api"
import { ToastAlert } from "@/mycomponents/ToastAlert"
import { INVERSE_DATE_FORMAT } from "@/utils/utils"

// Helper function to get mood object by type
function getMood(moodType) {
    return Moods.find((m) => m.type === moodType)
}

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        const mood = getMood(data.mood)
        return (
            <div className="rounded-lg border bg-background p-3 shadow-md">
                <p className="text-sm font-medium">{`Date: ${label}`}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span>{mood?.emoji}</span>
                    <span className="text-sm">{`${mood?.label} (Rating: ${data.rating}/5)`}</span>
                </div>
            </div>
        )
    }
    return null
}

export default function MoodDashboard() {
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [selectedView, setSelectedView] = useState("rating")
    const [moodData, setMoodData] = useState([])
    const [toastData, setToastData] = useState({ message: "", type: "", id: 0 })

    useEffect(() => {
        fetchMoodForMonth()
    }, [])

    const fetchMoodForMonth = async () => {
        if (!isPageLoading) setIsPageLoading(true)
        try {
            const formattedDate = format(new Date(), INVERSE_DATE_FORMAT)
            const response = await API.get(`/moods?date=${formattedDate}`)
            setMoodData(response.data.data || []);
        } catch (error) {
            showToast("Failed to load mood data", TOAST_TYPE.INFO)
            setMoodData([])
        } finally {
            setIsPageLoading(false)
        }
    }

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() })
    }

    const stats = useMemo(() => {
        if (!moodData || moodData.length === 0) return {}

        const moodCounts = moodData.reduce((acc, entry) => {
            const key = entry.mood.toLowerCase()
            acc[key] = (acc[key] || 0) + 1
            return acc
        }, {})

        const sortedMoodEntries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])
        const mostCommonMoodType = sortedMoodEntries.length > 0 ? sortedMoodEntries[0][0] : null
        const mostCommonMood = mostCommonMoodType ? getMood(mostCommonMoodType) : null

        const averageRating = (
            moodData.reduce((sum, entry) => sum + entry.rating, 0) / moodData.length
        ).toFixed(1)

        const highestRating = Math.max(...moodData.map((entry) => entry.rating))
        const lowestRating = Math.min(...moodData.map((entry) => entry.rating))

        return {
            moodCounts,
            mostCommonMood,
            mostCommonMoodType,
            averageRating,
            highestRating,
            lowestRating,
        }
    }, [moodData])

    return (
        <div className="min-h-screen bg-background p-6 pt-24 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Mood Dashboard</h1>
                    <p className="text-muted-foreground">Track your daily mood types and ratings over time</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.averageRating || "0.0"}/5</div>
                            <p className="text-xs text-muted-foreground">Overall mood rating</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
                            <Smile className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <span>{stats.mostCommonMood?.emoji}</span>
                                <span>{stats.mostCommonMood?.label || "N/A"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.moodCounts?.[stats.mostCommonMoodType] || 0} days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Highest Rating</CardTitle>
                            <Smile className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.highestRating || "0"}/5</div>
                            <p className="text-xs text-muted-foreground">Best mood days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{moodData.length}</div>
                            <p className="text-xs text-muted-foreground">Days tracked</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Mood Trends</CardTitle>
                                <CardDescription>Your mood ratings over time</CardDescription>
                            </div>
                            <Tabs defaultValue="rating" value={selectedView} onValueChange={setSelectedView}>
                                <TabsList>
                                    <TabsTrigger value="rating">Rating View</TabsTrigger>
                                    <TabsTrigger value="type">Mood Type View</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {selectedView === "rating" ? (
                                    <LineChart data={moodData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="label"
                                            angle={-30}
                                            textAnchor="end"
                                            height={50}
                                            minTickGap={10}
                                        />
                                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="rating"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={({ cx, cy, payload }) => {
                                                const mood = getMood(payload.mood)
                                                return (
                                                    <svg x={cx - 10} y={cy - 10} width={20} height={20}>
                                                        <circle cx="10" cy="10" r="8" fill={mood.color} stroke="#3b82f6" strokeWidth="1" />
                                                        <text x="10" y="14" textAnchor="middle" fontSize="12">
                                                            {mood.emoji}
                                                        </text>
                                                    </svg>
                                                )
                                            }}
                                        />
                                    </LineChart>
                                ) : (
                                    <LineChart data={moodData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="label"
                                            angle={-30}
                                            textAnchor="end"
                                            height={50}
                                            minTickGap={10}
                                        />
                                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        {Moods.map((mood) => {
                                            const moodLineData = moodData.map((entry) => ({
                                                ...entry,
                                                [mood.type]: entry.mood == mood.type ? entry.rating : null,
                                            }))
                                            return (
                                                <Line
                                                    key={mood.type}
                                                    type="monotone"
                                                    data={moodLineData}
                                                    dataKey={mood.type}
                                                    name={mood.label}
                                                    stroke={mood.color}
                                                    strokeWidth={2}
                                                    connectNulls
                                                    dot={(props) => {
                                                        if (props.payload[mood.type] === null) return null
                                                        return (
                                                            <svg x={props.cx - 8} y={props.cy - 8} width={16} height={16}>
                                                                <text x="8" y="12" textAnchor="middle" fontSize="10">
                                                                    {mood.emoji}
                                                                </text>
                                                            </svg>
                                                        )
                                                    }}
                                                />
                                            )
                                        })}
                                        <Legend />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Mood Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mood Types</CardTitle>
                        <CardDescription>All available mood types with their ratings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                            {Moods.map((mood) => (
                                <div key={mood.type} className="text-center p-3 rounded-lg border" style={{ backgroundColor: mood.color }}>
                                    <div className="text-2xl mb-1">{mood.emoji}</div>
                                    <div className="font-semibold">{mood.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {stats.moodCounts?.[mood.type] || 0} entries
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Rating Scale */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Scale</CardTitle>
                        <CardDescription>Understanding the 1–5 rating scale</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-4">
                            {[
                                { rating: 1, label: "Very Low", color: "bg-red-100" },
                                { rating: 2, label: "Low", color: "bg-orange-100" },
                                { rating: 3, label: "Medium", color: "bg-yellow-100" },
                                { rating: 4, label: "High", color: "bg-blue-100" },
                                { rating: 5, label: "Very High", color: "bg-green-100" },
                            ].map((item) => (
                                <div key={item.rating} className={`text-center p-3 rounded-lg border ${item.color}`}>
                                    <div className="text-2xl font-bold mb-1">{item.rating}</div>
                                    <div className="text-sm">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            {toastData.message && (
                <ToastAlert
                    key={toastData.id}
                    message={toastData.message}
                    type={toastData.type}
                />
            )}
        </div>
    )
}
