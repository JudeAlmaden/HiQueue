import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Layers, ArrowRight, CheckCircle, Clock, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-zinc-100 dark:to-indigo-400 bg-clip-text text-transparent">
              HiQueue
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/10 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-550/10 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-250 dark:border-indigo-500/20">
              ⚡ Intelligent Queue Flow
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Optimize customer flow with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                real-time queuing
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              HiQueue is a modern SaaS platform designed to eliminate queues, streamline service desks, and improve operational transparency for both agents and visitors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/register"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/10 transition-all"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center text-base font-semibold px-6 py-3 rounded-lg border border-slate-250 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all"
              >
                Agent Portal
              </Link>
            </div>
          </div>

          {/* Graphical Mockup / Feature Showcase */}
          <div className="lg:col-span-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Real-time Wait Tracking</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Live SMS & web alerts for visitors.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Multi-Desk Support</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Call, transfer, or complete tokens instantly.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Role-Based Authentication</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Secure agent access via NextAuth & SQLite.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 transition-colors text-center text-xs text-slate-400 dark:text-zinc-500">
        <p>© 2026 HiQueue. All rights reserved.</p>
      </footer>
    </div>
  )
}
