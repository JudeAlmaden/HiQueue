"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"

type ToastType = "success" | "error"

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = "success", duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9)
    const defaultDuration = type === "success" ? 5000 : 10000
    const finalDuration = duration ?? defaultDuration

    setToasts((prev) => [...prev, { id, message, type, duration: finalDuration }])

    setTimeout(() => {
      removeToast(id)
    }, finalDuration)
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => {
    toast(message, "success", duration)
  }, [toast])

  const error = useCallback((message: string, duration?: number) => {
    toast(message, "error", duration)
  }, [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in pointer-events-auto ${
              t.type === "success"
                ? "bg-primary-container/90 text-on-primary-container border-primary/20"
                : "bg-error-container/90 text-on-error-container border-error/20"
            }`}
            style={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            )}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold leading-tight mb-0.5">
                {t.type === "success" ? "Success" : "Error"}
              </p>
              <p className="text-xs opacity-90 leading-normal">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity shrink-0 -mt-1 -mr-1 p-1 hover:bg-current/10 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
