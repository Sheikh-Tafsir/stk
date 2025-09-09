import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Moods } from "./moods";
import { INVERSE_DATE_FORMAT } from "@/utils/utils";

export function CalendarView({ selectedDate, onDateSelect, moodEntries }) {
    const getDateKey = (date) => format(date, INVERSE_DATE_FORMAT);

    const getMoodType = (date) => {
        const dateKey = getDateKey(date);
        const entry = moodEntries.find((item) => item.date === dateKey);
        return entry?.mood || null;
    };

    const modifiers = Object.fromEntries(
        Moods.map((mood) => [
            mood.type,
            (date) => getMoodType(date) === mood.type,
        ])
    );

    const moodClass = Object.fromEntries(
        Moods.map((mood) => [mood.type, `bg-${mood.colorTw}`])
    );

    return (
        <div className="calendar-container">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                className="rounded-md border-none w-full"
                modifiers={modifiers}
                modifiersClassNames={moodClass}
            />
        </div>
    );
}
