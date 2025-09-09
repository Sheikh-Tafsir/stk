import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TOAST_TYPE } from "@/utils/enums"

export function ToastAlert({ message, type }) {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (type == TOAST_TYPE.FIXED) return;

    const timer = setTimeout(() => setIsOpen(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!isOpen) return null

  const positionStyle =
    type == TOAST_TYPE.FIXED
      ? "min-w-[300px] w-[400px] top-12 right-[2%]"
      : "min-w-[250px] w-[400px] bottom-5 right-[2%]"

  const colorStyle =
    type == TOAST_TYPE.ERROR ? "bg-red-500" :
      type == TOAST_TYPE.WARNING ? "bg-red-400" :
      type ==TOAST_TYPE.SUCCESS ? "bg-green-500" : "bg-blue-500";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -5 }}
          transition={{ duration: 0.2 }}
          className={`fixed z-10 ${positionStyle}`}
        >
          <Alert
            className={`text-white flex justify-between fixed ${positionStyle} ${colorStyle} z-10`}
          >
            <div className="my-auto">
              <AlertDescription>{message}</AlertDescription>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="my-auto"
              onClick={() => setIsOpen(false)}
            >
              <X className="text-blue-600" />
            </Button>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

