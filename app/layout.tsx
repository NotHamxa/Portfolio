import type React from "react"
import type { Metadata } from "next"
import {Inter} from "next/font/google"
import "./globals.css"
import ThemeWrapper from "@/components/theme-provider";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";

const geist = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "Hamza Ahmed",
  description: "",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en">
          <body className={geist.className}>
                <Analytics/>
                <SpeedInsights/>
                <ThemeWrapper>{children}</ThemeWrapper>
          </body>
      </html>
  )
}
