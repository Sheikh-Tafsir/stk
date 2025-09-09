import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Moods } from "./moods"


export function MoodSelector({ selectedMood, onMoodSelect }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Moods.map((mood) => (
        <motion.div
          key={mood.type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoodSelect(mood)}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all",
            selectedMood?.type === mood.type ? "ring-2 ring-offset-2 ring-[#818cf8]" : "hover:bg-gray-50",
          )}
          style={{ backgroundColor: selectedMood?.type === mood.type ? mood.color : "" }}
        >
          <span className="text-2xl mb-1">{mood.emoji}</span>
          <span className="text-xs font-medium text-gray-600">{mood.label}</span>
        </motion.div>
      ))}
    </div>
  )
}
