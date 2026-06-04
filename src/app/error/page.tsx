import Link from "next/link"

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { message?: string; type?: string }
}) {
  const errorType = searchParams.type || "unknown"
  const errorMessage = searchParams.message || "An unexpected error occurred"

  const getErrorDetails = () => {
    switch (errorType) {
      case "database":
        return {
          title: "Database Connection Error",
          description: "Unable to connect to the database. Please try again later.",
          action: "Contact support if this issue persists.",
        }
      case "unauthorized":
        return {
          title: "Access Denied",
          description: "Your account may have been deactivated or removed from the organization.",
          action: "Please contact your organization administrator.",
        }
      case "session":
        return {
          title: "Session Expired",
          description: "Your session has expired or is no longer valid.",
          action: "Please log in again to continue.",
        }
      default:
        return {
          title: "Something Went Wrong",
          description: errorMessage,
          action: "Please try again or contact support.",
        }
    }
  }

  const details = getErrorDetails()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">{details.title}</h1>
          <p className="text-lg text-muted-foreground">{details.description}</p>
          <p className="text-sm text-muted-foreground">{details.action}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Go to Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && errorMessage && (
          <div className="mt-8 p-4 bg-muted rounded-md text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
