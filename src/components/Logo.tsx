import { ReactNode } from "react"

interface LogoProps {
  variant?: "icon-only" | "with-name" | "text-only"
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: { image: 32, text: "text-base" },
  md: { image: 40, text: "text-xl" },
  lg: { image: 48, text: "text-2xl" },
}

function LogoMask({ size }: { size: number }) {
  return (
    <div
      className="bg-primary"
      style={{
        width: size,
        height: size,

        WebkitMaskImage: "url(/Logo.png)",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "center",

        maskImage: "url(/Logo.png)",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "center",
      }}
    />
  )
}

export function Logo({
  variant = "with-name",
  size = "md",
  className = "",
}: LogoProps) {
  const sizes = sizeMap[size]

  const icon = <LogoMask size={sizes.image} />

  if (variant === "icon-only") {
    return <div className={className}>{icon}</div>
  }

  if (variant === "text-only") {
    return (
      <span className={`${sizes.text} font-bold tracking-tight ${className}`}>
        HiQueue
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="shrink-0">{icon}</div>
      <span className={`${sizes.text} font-bold tracking-tight`}>
        HiQueue
      </span>
    </div>
  )
}