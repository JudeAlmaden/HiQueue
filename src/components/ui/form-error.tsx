import React from "react"
import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  message?: string | null
  className?: string
}

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg text-xs bg-error-container text-on-error-container border border-error/10 animate-fade-in ${className}`}
    >
      <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
      <span className="leading-relaxed font-medium">{message}</span>
    </div>
  )
}
export default FormError
