import React, { useState, useMemo, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, CheckCircle2, Circle, Pen, Plus } from "lucide-react"
import { API } from "@/middleware/Api"
import PageLoadingOverlay from "@/mycomponents/pageLoadingOverlay/PageLoadingOverlay"
import { Button } from "@/components/ui/button"
import { initialToastState } from "@/utils/utils"
import { ToastAlert } from "@/mycomponents/ToastAlert"
import { getPriorityKey, TOAST_TYPE } from "@/utils/enums"

export default function GoalList() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all")
  const [goals, setGoals] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toastData, setToastData] = useState(initialToastState);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await API.get('/goals');
        //console.log(response.data.data);
        setGoals(response.data.data || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const getGoalStatus = (deadline, completed) => {
    if (completed) return "current"

    const today = new Date()
    const taskDeadline = new Date(deadline)
    const diffTime = taskDeadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "past"
    if (diffDays <= 7) return "current"
    return "upcoming"
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return "bg-red-100 border-red-300 text-red-800"
      case 2:
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case 3:
        return "bg-green-100 border-green-300 text-green-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  const getStatusColor = (status, completed) => {
    if (completed) return "border-l-green-500 bg-green-50"

    switch (status) {
      case "past":
        return "border-l-red-500 bg-red-50"
      case "current":
        return "border-l-blue-500 bg-blue-50"
      case "upcoming":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-300 bg-white"
    }
  }

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (filter === "completed") return goal.completed
      if (filter === "pending") return !goal.completed
      return true
    })
  }, [filter, goals])

  const handleCheck = async (goalId) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed }
      }
      return goal
    })
    setGoals(updatedGoals)

    try {
      await API.put(`/goals/${goalId}/check`);

      showToast("Successfully checked", TOAST_TYPE.SUCCESS);
    } catch (error) {
      console.error('Error updating goal status:', error)
    }
  }

  const showToast = (message, type) => {
    setToastData({ message, type, id: Date.now() }) // ensure uniqueness
  }

  return (
    <>
      {isPageLoading && <PageLoadingOverlay />}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Goals Today</h1>
            <p className="text-gray-600">Track and manage your personal goals</p>
          </div>

          <Link to="/goals/create">
            <Button className="mb-6 bg-blue-600">
              <Plus className="h-4 w-4" />
              Create New Goals
            </Button>
          </Link>
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Completed
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredGoals.map((goal) => {
                const status = getGoalStatus(goal.deadline, goal.completed)
                const priorityColor = getPriorityColor(goal.priority)
                const statusColor = getStatusColor(status, goal.completed)

                return (
                  <Card key={goal.id} className={`border-l-4 ${statusColor} transition-all hover:shadow-md`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {goal.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 cursor-pointer" onClick={() => handleCheck(goal.id)} />
                          )}
                          <CardTitle className={`text-lg ${goal.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {goal.name}
                          </CardTitle>
                        </div>
                        <Badge className={`${priorityColor} border`}>{getPriorityKey(goal.priority)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {goal.description && (
                        <p className={`text-sm mb-4 ${goal.completed ? "text-gray-400" : "text-gray-600"}`}>
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>Due: {goal.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">{status}</span>
                        </div>

                        <Link to={`/goals/${goal.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto flex items-center gap-1"
                          >
                            <Pen className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredGoals.length === 0 && (
              <div className="text-center py-12">
                <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500">No tasks match your current filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastData.message && (
        <ToastAlert
          key={toastData.id}
          message={toastData.message}
          type={toastData.type}
        />
      )}
    </>
  )
}
