import type { Metadata } from "next"
import { Inter, Anuphan } from "next/font/google"
import "./globals.css"

// English font
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Thai font
const anuphan = Anuphan({ 
  subsets: ["thai", "latin"],
  variable: "--font-anuphan",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HR System - ระบบบริหารงานบุคคล",
  description: "ระบบบริหารจัดการทรัพยากรบุคคลแบบ Multi-tenant",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${inter.variable} ${anuphan.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
