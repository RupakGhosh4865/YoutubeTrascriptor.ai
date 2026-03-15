import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'YTIntelligence | Next-Gen Video Intelligence',
  description: 'Turn any YouTube video into an interactive brain. Extract insights, summarize content, and chat with videos in real-time powered by Groq Llama 3.',
  generator: 'v0.app',
  openGraph: {
    title: 'YTIntelligence',
    description: 'Transform YouTube videos into interactive knowledge',
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
       <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}

