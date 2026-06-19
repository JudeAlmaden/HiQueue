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
      <div className="relative flex-1 overflow-hidden">
        {/* Full-width background image */}
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: "url('/images/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 gap-6 max-w-3xl mx-auto w-full h-full">
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
      </div>

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

      {/* Open Source Section */}
      <section className="border-t border-border px-6 py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 text-foreground">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Open Source</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            HiQueue is fully open source. Self-host it on your own server, customize it for your business, or contribute to the project.
          </p>
          <a
            href="https://github.com/JudeAlmaden/HiQueue"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HiQueue. All rights reserved.
          </p>
          <a
            href="https://github.com/JudeAlmaden/HiQueue"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Open Source — Self-host it
          </a>
        </div>
      </footer>

    </div>
  )
}
