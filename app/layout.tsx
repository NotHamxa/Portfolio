import type React from "react"
import type { Metadata } from "next"
import {Inter} from "next/font/google"
import "./globals.css"
import ThemeWrapper from "@/components/theme-provider";

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
                <ThemeWrapper>{children}</ThemeWrapper>
          </body>
      </html>
  )
}
