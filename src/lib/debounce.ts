import React from "react"

/**
 * Creates a debounced version of a function that delays execution
 * until after the specified wait time has elapsed without new calls
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeoutId = null
      func(...args)
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(later, wait)
  }
}

/**
 * Hook version of debounce that automatically cleans up on unmount
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [])

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
      timeoutId.current = setTimeout(() => {
        func(...args)
      }, wait)
    },
    [func, wait]
  )
}
