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
import { processVideo, askQuestion, getVideoInfo, summarizeVideo } from '@/lib/api'
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

  const handleVideoSubmit = async (videoId: string, manualTranscript?: string) => {
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

      const response = await processVideo(videoId, manualTranscript)
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

  const handleSummarize = async () => {
    if (!currentVideoId) return

    try {
      setError(undefined)
      setIsLoading(true)

      const response = await summarizeVideo(currentVideoId)

      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'answer',
        content: `### Strategic Summary\n\n${response.summary}`,
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, summaryMessage])

      toast.success('Summary generated! 📄')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get summary'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
    <main className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
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
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            ref={appRef}
            className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col items-center justify-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] premium-gradient opacity-[0.03] blur-[160px] pointer-events-none"></div>
            
            <div className="max-w-6xl w-full mx-auto space-y-20 relative z-10">
              {state === 'input' && (
                <VideoInput
                  onSubmit={handleVideoSubmit}
                  isLoading={isLoading}
                  error={error}
                  onToast={(msg, type) => type === 'success' ? toast.success(msg) : toast.error(msg)}
                />
              )}

              {state === 'processing' && (
                <ProcessingState
                  progress={processingProgress}
                  stage="Neural Extraction"
                />
              )}

              {state === 'qa' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-16"
                >
                  <div className="flex justify-center md:justify-start">
                    <button
                      onClick={handleNewVideo}
                      className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass-card border-indigo-100/50 text-indigo-700 hover:bg-white hover:border-indigo-400 hover:shadow-2xl transition-all font-black text-xs uppercase tracking-widest"
                    >
                      <span className="group-hover:-translate-x-2 transition-transform">←</span>
                      New Investigation
                    </button>
                  </div>

                  <QuestionInterface
                    videoInfo={videoInfo}
                    onAsk={handleAskQuestion}
                    onClear={handleClearChat}
                    onSummarize={handleSummarize}
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

      {/* Premium Footer */}
      <footer className="border-t border-indigo-50/50 bg-white/50 backdrop-blur-xl py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="flex items-center gap-4">
                 <div className="premium-gradient p-3 rounded-2xl text-white shadow-xl">
                   <Zap className="w-6 h-6" />
                 </div>
                 <span className="text-3xl font-black tracking-tighter text-foreground">
                   YT<span className="gradient-text animate-gradient">Intelligence</span>
                 </span>
              </div>
              <p className="text-muted-foreground font-bold text-sm max-w-sm text-center md:text-left leading-relaxed">
                The world's most advanced YouTube analysis engine. Turn hours of video into seconds of insight.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
              <div className="flex gap-8">
                {['Twitter', 'GitHub', 'Discord'].map((platform) => (
                  <span key={platform} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary cursor-pointer transition-colors">
                    {platform}
                  </span>
                ))}
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                Engineered for Excellence • © 2026
              </p>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-indigo-50/30 text-center">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-[1em] ml-[1em]">
                Hyper-Speed Infrastructure
             </span>
          </div>
        </div>
      </footer>
    </main>
  )
}

