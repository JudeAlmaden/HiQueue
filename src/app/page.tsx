import Link from "next/link"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { ArrowRight, ListOrdered, Monitor, Users, LayoutDashboard } from "lucide-react"
import { auth } from "@/auth"

export default async function Home() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6 max-w-3xl mx-auto w-full">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
          ✦ Queue management, simplified
        </span>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight text-foreground" style={{ letterSpacing: "-0.03em" }}>
          Serve people better,<br />one ticket at a time.
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
          HiQueue helps businesses manage walk-in queues, issue tickets, and call customers — without the chaos.
        </p>

        <div className="flex items-center gap-3 mt-2">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-6 gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="rounded-full px-6 gap-2">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="rounded-full px-6">
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: ListOrdered,
              title: "Live Queues",
              desc: "Create queues for any service desk. Issue numbered tickets and call customers in order.",
            },
            {
              icon: Monitor,
              title: "Display Screens",
              desc: "Show the current ticket number on a TV or monitor in your waiting area.",
            },
            {
              icon: Users,
              title: "Multi-staff",
              desc: "Add staff members to your organization and assign them to specific counters.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HiQueue. All rights reserved.
      </footer>

    </div>
  )
}
