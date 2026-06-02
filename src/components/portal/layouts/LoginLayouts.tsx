import type { ReactNode } from "react"

type LoginLayout = "centered" | "split" | "minimal"

interface LoginLayoutShellProps {
  layout: LoginLayout
  hero?: ReactNode
  form: ReactNode
}

export function LoginLayoutShell({ layout, hero, form }: LoginLayoutShellProps) {
  if (layout === "split") {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background/40">
        <div 
          className="w-full max-w-5xl grid gap-0 md:grid-cols-2 bg-card border border-border shadow-[0_24px_64px_-16px_rgba(44,74,62,0.1)] overflow-hidden transition-all duration-300"
          style={{ borderRadius: "var(--login-radius, 1.5rem)" }}
        >
          {/* Left Panel - Brand / Hospitality Story */}
          <div className="relative flex flex-col justify-center p-8 sm:p-12 md:p-14 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border-b md:border-b-0 md:border-r border-border overflow-hidden">
            {/* Dynamic soft background textures */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              {hero}
            </div>
          </div>
          
          {/* Right Panel - Login Form */}
          <div 
            className="flex items-center justify-center p-8 sm:p-12 md:p-14 bg-card"
            style={{
              backgroundColor: "var(--login-split-right-bg)",
            }}
          >
            <div className="w-full max-w-md">{form}</div>
          </div>
        </div>
      </div>
    )
  }

  if (layout === "minimal") {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-background">
        <div 
          className="w-full max-w-sm space-y-6 border border-border bg-card p-6 sm:p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] transition-all duration-300"
          style={{ borderRadius: "var(--login-radius, 1rem)" }}
        >
          {form}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background/50">
      <div 
        className="w-full max-w-md space-y-8 border border-border bg-card p-8 sm:p-10 shadow-[0_16px_48px_-10px_rgba(44,74,62,0.08)] transition-all duration-300 hover:shadow-[0_20px_56px_-8px_rgba(44,74,62,0.12)]"
        style={{ borderRadius: "var(--login-radius, 1.5rem)" }}
      >
        {form}
      </div>
    </div>
  )
}
