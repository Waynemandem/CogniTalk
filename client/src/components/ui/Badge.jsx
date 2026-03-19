// badge.jsx
import { cn } from "@/lib/utils"

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}