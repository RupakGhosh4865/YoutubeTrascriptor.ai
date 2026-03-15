'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import { Zap } from 'lucide-react'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { VideoInput } from '@/components/VideoInput'
import { ProcessingState } from '@/components/ProcessingState'
import { QuestionInterface } from '@/components/QuestionInterface'
import { processVideo, askQuestion, getVideoInfo } from '@/lib/api'
import { ChatMessage, VideoInfo } from '@/lib/types'

type AppState = 'hero' | 'input' | 'processing' | 'qa'

export default function Home() {
  const [state, setState] = useState<AppState>('hero')
  const [currentVideoId, setCurrentVideoId] = useState<string>('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo>()
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [processingProgress, setProcessingProgress] = useState(0)
  const appRef = useRef<HTMLDivElement>(null)

  const scrollToApp = () => {
    if (appRef.current) {
      appRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleGetStarted = () => {
    setState('input')
    scrollToApp()
  }

  const handleVideoSubmit = async (videoId: string) => {
    try {
      setError(undefined)
      setCurrentVideoId(videoId)
      setState('processing')
      setProcessingProgress(10)

      // Simulate processing stages
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev < 50) return prev + 5
          return prev
        })
      }, 300)

      const response = await processVideo(videoId)
      clearInterval(progressInterval)
      setProcessingProgress(75)

      // Debug: log the response to see what we're getting
      console.log('Process video response:', response)

      // Fetch video info
      try {
        const info = await getVideoInfo(videoId)
        setVideoInfo({
          videoId,
          title: info.title || 'Video',
          thumbnail: info.thumbnail || '',
          duration: info.duration || 'Unknown',
          transcriptLength: response.transcript_length || 0,
          transcriptPreview: response.transcript_preview || '',
          transcript: response.transcript || '',
        })
        // Debug: log what we're setting
        console.log('VideoInfo set with transcript:', !!response.transcript)
      } catch {
        console.log('Could not fetch video info')
      }

      setProcessingProgress(100)
      setTimeout(() => {
        setState('qa')
        setChatHistory([])
        toast.success('Video processed successfully! 🎉')
      }, 500)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process video'
      setError(errorMessage)
      toast.error(errorMessage)
      setState('input')
      setProcessingProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAskQuestion = async (question: string) => {
    if (!currentVideoId) return

    try {
      setError(undefined)
      setIsLoading(true)

      // Add question to chat
      const questionMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'question',
        content: question,
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, questionMessage])

      // Get answer
      const response = await askQuestion(currentVideoId, question)

      const answerMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: response.answer || 'No answer available',
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, answerMessage])

      toast.success('Answer received! ✨')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get answer'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    setChatHistory([])
    toast.success('Chat cleared')
  }

  const handleNewVideo = () => {
    setCurrentVideoId('')
    setVideoInfo(undefined)
    setChatHistory([])
    setError(undefined)
    setProcessingProgress(0)
    setState('input')
    scrollToApp()
  }

  return (
    <main className="min-h-screen bg-background selection:bg-primary/20">
      <Toaster position="top-right" />

      <AnimatePresence mode="wait">
        {state === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero onGetStarted={handleGetStarted} />
            <Features />
          </motion.div>
        )}

        {(state === 'input' || state === 'processing' || state === 'qa') && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            ref={appRef}
            className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] premium-gradient opacity-5 blur-[120px] pointer-events-none"></div>
            
            <div className="max-w-5xl mx-auto space-y-12 relative z-10">
              {state === 'input' && (
                <VideoInput
                  onSubmit={handleVideoSubmit}
                  isLoading={isLoading}
                  error={error}
                />
              )}

              {state === 'processing' && (
                <ProcessingState
                  progress={processingProgress}
                  stage="Analyzing Video"
                />
              )}

              {state === 'qa' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-10"
                >
                  <button
                    onClick={handleNewVideo}
                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl glass-effect border-indigo-100 text-indigo-700 hover:bg-white hover:border-indigo-400 transition-all font-bold text-sm shadow-sm"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    Try Another Video
                  </button>

                  <QuestionInterface
                    videoInfo={videoInfo}
                    onAsk={handleAskQuestion}
                    onClear={handleClearChat}
                    chatHistory={chatHistory}
                    isLoading={isLoading}
                    error={error}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-indigo-50 bg-white py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="premium-gradient p-2 rounded-xl text-white">
               <Zap className="w-5 h-5" />
             </div>
             <span className="text-xl font-black tracking-tight text-foreground">
               YT<span className="gradient-text">Intelligence</span>
             </span>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Powered by Groq Llama 3 • <span className="text-primary">Built with Precision</span>
          </p>
        </div>
      </footer>
    </main>
  )
}
