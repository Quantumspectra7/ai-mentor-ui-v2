import React from "react"
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Manrope } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-context'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display'
})

const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body'
})

export const metadata: Metadata = {
  title: 'AI Mentor - Your 90-Day Guide',
  description: 'Your personal AI mentor guiding you through your first 90 days on campus',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const themeScript = `(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    if (body) {
      body.setAttribute('data-theme', theme);
      body.classList.toggle('dark', theme === 'dark');
      body.classList.toggle('light', theme === 'light');
    }
  } catch (e) {
    // Ignore theme bootstrap failures.
  }
})();`;

  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <ThemeWrapper>
            {children}
            <Toaster position="bottom-center" />
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
