import * as React from "react"
import { cn } from "../../lib/utils"

export function Button({ className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-semibold hover:bg-indigo-500 transition disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button;  