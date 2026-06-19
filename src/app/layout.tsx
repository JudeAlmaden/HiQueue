import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hi-queue.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "HiQueue - Queue Management System for Walk-In Businesses",
    template: "%s | HiQueue",
  },
  description:
    "HiQueue helps businesses manage walk-in queues, issue numbered tickets, and call customers in order. Free queue management for clinics, banks, government offices, and service desks.",
  keywords: [
    "queue management system",
    "queuing system",
    "ticket system",
    "walk-in queue",
    "customer queue",
    "queue display",
    "service desk queue",
    "digital queue",
    "queue number system",
    "waiting list management",
  ],
  authors: [{ name: "HiQueue" }],
  creator: "HiQueue",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "HiQueue",
    title: "HiQueue - Queue Management System for Walk-In Businesses",
    description:
      "Manage walk-in queues, issue numbered tickets, and call customers in order. Free and simple queue management.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HiQueue - Queue Management System",
    description:
      "Manage walk-in queues, issue tickets, and call customers. Free queue management for any business.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google56d604de296f455d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Toaster>{children}</Toaster>
        <Sonner />
        <SpeedInsights />
      </body>
    </html>
  );
}
