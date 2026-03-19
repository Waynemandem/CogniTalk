// progress.jsx
import { cn } from "@/lib/utils"

export function Progress({ value = 0, className }) {
  return (
    <div className={cn("w-full h-2 bg-gray-200 rounded-full", className)}>
      <div
        className="h-full bg-black rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}