import { useState, useEffect } from "react"
import { format } from "date-fns";

import { CalendarView } from "./CalendarView"
import { MoodSelector } from "./MoodSelector"
import { MoodRating } from "./MoodRating"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ToastAlert } from "@/mycomponents/ToastAlert"
import { TOAST_TYPE } from "@/utils/enums"
import { API } from "@/middleware/Api"
import { ButtonLoading } from "@/mycomponents/ButtonLoading"
import PageLoadingOverlay from "@/mycomponents/pageLoadingOverlay/PageLoadingOverlay"
import { Moods } from "./moods";
import { INVERSE_DATE_FORMAT } from "@/utils/utils";

export default function MoodCalendar() {
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMood, setSelectedMood] = useState(null);
    const [moodRating, setMoodRating] = useState(0);
    const [moodData, setMoodData] = useState([]);
    const [toastData, setToastData] = useState({ message: "", type: "", id: 0 });

    const showDateSelect = (moodEntries, date) => {
        const formattedDate = format(date, INVERSE_DATE_FORMAT);
        const data = moodEntries.find(item => item.date == formattedDate);

        if (data) {
            setSelectedMood(Moods.find(m => m.type === data.mood));
            setMoodRating(data.rating);
        } else {
            setSelectedMood(null);
            setMoodRating(0);
        }
    };

    const fetchMoodForMonth = async (date) => {
        if (!isPageLoading) setIsPageLoading(true);
        try {
            const formattedDate = format(date, INVERSE_DATE_FORMAT);
            const response = await API.get(`/moods?date=${formattedDate}`);
            //console.log(response.data);
            setMoodData(response.data.data || []);
            showDateSelect(response.data.data, date);
        } catch (error) {
            showToast("Failed to load mood data", TOAST_TYPE.INFO);
            setMoodData([]);
        } finally {
            setIsPageLoading(false);
        }
    }

    useEffect(() => {
        fetchMoodForMonth(selectedDate);
    }, []);

    const handleDateSelect = (date) => {
        if (!date) return;

        const newMonth = date.getMonth();
        const newYear = date.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const selectedYear = selectedDate.getFullYear();

        setSelectedDate(date);

        if (newMonth != selectedMonth || newYear != selectedYear) {
            fetchMoodForMonth(date);
        }

        showDateSelect(moodData, date);
    }

    const handleMoodSelect = (mood) => setSelectedMood(mood);

    const handleRatingChange = (rating) => setMoodRating(rating);

    const saveMoodEntry = async () => {
        if (!selectedMood) {
            showToast("Please select a mood", TOAST_TYPE.WARNING);
            return;
        }

        if (moodRating === 0) {
            showToast("Please rate your mood", TOAST_TYPE.WARNING);
            return;
        }

        try {
            setIsButtonLoading(true);
            
            const formattedDate = format(selectedDate, INVERSE_DATE_FORMAT);
            const response = await API.post("/moods", {
                date: formattedDate,
                mood: selectedMood.type,
                rating: moodRating,
            });

            const updatedEntries = moodData.some(entry => entry.date == formattedDate) ?
                moodData.map(entry =>
                    entry.date == formattedDate
                        ? { ...entry, mood: selectedMood, rating: moodRating }
                        : entry
                )
                :
                [
                    ...moodData,
                    response.data.data
                ];

            setMoodData(updatedEntries);

            showToast(`Your mood for ${formattedDate} has been recorded.`, TOAST_TYPE.SUCCESS);
        } catch (error) {
            showToast(`Failed to save mood for ${formattedDate}`, TOAST_TYPE.ERROR);
        } finally {
            setIsButtonLoading(false);
        }
    }

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() });
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-24">
            {isPageLoading && <PageLoadingOverlay />}
            <h1 className="text-3xl font-semibold text-center mb-6 text-blue-600">Mood Calendar</h1>
            <div className="container lg:w-[60%] lg:flex justify-between">
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6 h-full">
                    <CalendarView
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        moodEntries={moodData}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 h-full">
                    <h2 className="text-xl font-semibold mb-4 text-[#6b7280]">
                        How are you feeling on {selectedDate?.toISOString().split("T")[0]}?
                    </h2>

                    <MoodSelector selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />

                    {selectedMood && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6"
                        >
                            <h3 className="text-lg font-medium mb-3 text-[#6b7280]">How intense is this feeling?</h3>
                            <MoodRating rating={moodRating} onRatingChange={handleRatingChange} />

                            {!isButtonLoading ?


                                <Button
                                    onClick={saveMoodEntry}
                                    className="bg-blue-600 hover:bg-[#818cf8] text-white w-full shadow-lg mt-4"
                                >
                                    Save
                                </Button>
                                :
                                <ButtonLoading css={"bg-blue-600 hover:bg-[#818cf8] text-white w-full shadow-lg mt-4"} />
                            }
                        </motion.div>
                    )}

                    {toastData.message && (
                        <ToastAlert
                            key={toastData.id}
                            message={toastData.message}
                            type={toastData.type}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}