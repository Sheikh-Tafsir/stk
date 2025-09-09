import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DAYS_OF_WEEK } from "@/utils/enums"
import { useNavigate } from "react-router-dom"

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

function formatTime(time) {
  if (!time) return ""
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

function getTimeSlotPosition(startTime, endTime) {
  if (!startTime || !endTime) return { startPosition: 0, duration: 1 }

  const [startHour, startMinutes] = startTime.split(":").map(Number)
  const [endHour, endMinutes] = endTime.split(":").map(Number)

  const startPosition = startHour - 8 + startMinutes / 60
  const duration = endHour - startHour + (endMinutes - startMinutes) / 60

  return { startPosition, duration }
}

export default function ClassRoutineComponent({ classes }) {
  const navigate = useNavigate();

  return (
    <div className="container overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-sm font-medium text-muted-foreground p-2">Time</div>
          {Object.entries(DAYS_OF_WEEK).map((day) => (
            <div key={day} className="text-sm font-medium text-center p-2 bg-card rounded-lg border">
              {day[0]} {/* Display "SUNDAY", "MONDAY", etc. */}
            </div>
          ))}
        </div>

        {/* Schedule grid */}
        <div className="relative">
          <div className="grid grid-cols-8 gap-2">
            {/* Time column */}
            <div className="space-y-2">
              {TIME_SLOTS.map((time, index) => (
                <div key={time} className="h-16 flex items-start justify-end pr-2 text-xs text-muted-foreground">
                  {index < TIME_SLOTS.length - 1 && formatTime(time)}
                </div>
              ))}
            </div>

            {Object.entries(DAYS_OF_WEEK).map(([dayName, dayValue]) => (
              <div key={dayValue} className="relative space-y-2">
                {/* Time slot backgrounds */}
                {TIME_SLOTS.slice(0, -1).map((time) => (
                  <div key={time} className="h-16 bg-muted/30 rounded border border-border/50" />
                ))}

                {/* Class blocks */}
                <div className="absolute inset-0 pointer-events-none">
                  {classes
                    .filter((item) => String(item.day) === dayValue)
                    .map((item) => {
                      const { startPosition, duration } = getTimeSlotPosition(item.startTime, item.endTime)
                      return (
                        <Card
                          key={item.id}
                          className={cn(
                            "absolute left-0 right-0 p-2 bg-blue-600 text-primary-foreground shadow-sm hover:shadow-md transition-shadow pointer-events-auto cursor-pointer",
                            "border-l-4 border-l-accent",
                          )}
                          style={{
                            top: `${startPosition * 4.42}rem`,
                            height: `${duration * 4.42}rem`,
                            minHeight: "3rem",
                          }}
                          onClick={() => { navigate(`/class/${item.id}`) }}
                        >
                          <div className="h-full flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-sm leading-tight text-balance">{item.course}</h3>
                              <p className="text-xs opacity-90 mt-1">{item.teacher}</p>
                            </div>
                            <p className="text-xs opacity-80 mt-2">
                              {formatTime(item.startTime)} – {formatTime(item.endTime)}
                            </p>
                          </div>
                        </Card>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
