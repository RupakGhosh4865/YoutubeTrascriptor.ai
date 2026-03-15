import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Transcript Q&A | AI-Powered Video Insights',
  description: 'Ask questions about any YouTube video and get instant AI-powered answers from transcripts using Gemini LLM and RAG',
  generator: 'v0.app',
  openGraph: {
    title: 'YouTube Transcript Q&A',
    description: 'Turn YouTube videos into interactive knowledge',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
