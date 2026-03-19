// dialog.jsx
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Dialog({ trigger, children }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className={cn("bg-white rounded-lg p-6 w-[90%] max-w-md")}>
            {children}
            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-sm text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}