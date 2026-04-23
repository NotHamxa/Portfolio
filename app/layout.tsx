import type React from "react"
import type { Metadata } from "next"
import {Instrument_Serif, Geist_Mono} from "next/font/google"
import "./globals.css"
import ThemeWrapper from "@/components/theme-provider";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
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
          <body className={`${geistMono.className} ${geistMono.variable} ${instrumentSerif.variable}`}>
                <Analytics/>
                <SpeedInsights/>
                <ThemeWrapper>{children}</ThemeWrapper>
          </body>
      </html>
  )
}
