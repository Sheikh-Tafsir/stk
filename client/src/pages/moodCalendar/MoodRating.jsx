import { useState } from "react"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

export function MoodRating({ rating, onRatingChange }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex justify-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            size={32}
            className={`transition-colors ${
              star <= (hoverRating || rating) ? "fill-[#fcd34d] text-[#fcd34d]" : "fill-transparent text-gray-300"
            }`}
          />
        </motion.button>
      ))}
    </div>
  )
}
