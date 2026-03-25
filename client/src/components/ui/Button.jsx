import * as React from "react"
import { cn } from "../../lib/utils"

export function Button({ className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button;  