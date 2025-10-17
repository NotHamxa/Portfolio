import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import ThemeWrapper from "@/components/theme-provider";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "Hamza Ahmed",
  description: "HubSpot CMS Developer from Philippines with 5 years of experience.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en" className={geist.variable}>
      <body className="font-sans antialiased">
      <ThemeWrapper>{children}</ThemeWrapper>
      </body>
      </html>
  )
}
