import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TalentXO – Top Product, Tech, Data & Design Jobs',
  description: 'Find the best product, engineering, data, design, and marketing jobs at India\'s leading tech companies.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50 antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
