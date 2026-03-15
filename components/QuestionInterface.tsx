'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Trash2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChatMessage, VideoInfo } from '@/lib/types'

interface QuestionInterfaceProps {
  videoInfo?: VideoInfo
  onAsk: (question: string) => void
  onClear: () => void
  chatHistory: ChatMessage[]
  isLoading: boolean
  error?: string
}

const SUGGESTED_QUESTIONS = [
  'What is the main topic?',
  'What are the key points?',
  'Can you summarize this?',
  'Who is the speaker?',
]

export function QuestionInterface({
  videoInfo,
  onAsk,
  onClear,
  chatHistory,
  isLoading,
  error,
}: QuestionInterfaceProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      onAsk(question)
      setQuestion('')
    }
  }

  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Video Info */}
      {videoInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-8 sm:p-10 border-white/50 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 premium-gradient opacity-10 blur-3xl -mr-16 -mt-16"></div>
          <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
            <div className="flex-shrink-0 group">
              {videoInfo.thumbnail && (
                <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-105">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-32 h-32 sm:w-40 sm:h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Extracted Successfully
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground line-clamp-2 mb-4 tracking-tight leading-tight">
                {videoInfo.title}
              </h3>
              <p className="text-base text-muted-foreground font-medium mb-6">
                {videoInfo.duration} • <span className="text-primary">{videoInfo.transcriptLength.toLocaleString()}</span> chars processed
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Transcript Viewer - Show if transcript exists */}
      {(videoInfo?.transcript || videoInfo?.transcriptPreview) && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="glass-effect rounded-3xl p-8 sm:p-10 border-white/50 shadow-2xl"
         >
           <div className="flex items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-50 rounded-xl">
                 <span className="text-2xl">📜</span>
               </div>
               <h3 className="text-2xl font-black text-foreground tracking-tight">
                 Transcript
               </h3>
             </div>
             {videoInfo.transcript && (
               <Button
                 type="button"
                 onClick={async () => {
                   try {
                     await navigator.clipboard.writeText(videoInfo.transcript || '')
                     alert('✅ Transcript copied!')
                   } catch (err) {
                     console.error('Failed to copy:', err)
                   }
                 }}
                 className="h-12 px-6 rounded-xl font-bold bg-white border-2 border-indigo-100 hover:border-indigo-500 text-indigo-700 transition-all hover:bg-white shadow-sm"
               >
                 Copy All Content
               </Button>
             )}
           </div>
           <div className="max-h-[500px] overflow-y-auto rounded-2xl bg-slate-50/50 p-6 sm:p-8 border border-indigo-100/50 relative">
              <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
             <p className="text-base text-slate-700 whitespace-pre-wrap leading-loose font-medium select-text">
               {videoInfo.transcript || videoInfo.transcriptPreview || 'No transcript available'}
             </p>
           </div>
         </motion.div>
      )}

      {/* Question Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-3xl p-8 sm:p-10 border-white/50 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 premium-gradient opacity-5 blur-3xl -ml-16 -mt-16"></div>
        
        <h3 className="text-2xl font-black text-foreground mb-8 tracking-tight relative z-10 flex items-center gap-3">
           <span className="p-2 bg-primary/10 rounded-lg text-lg">💡</span>
          Ask Insight
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <Input
            type="text"
            placeholder="Type your question about the video..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="h-16 px-6 text-lg rounded-2xl bg-white/50 border-white/40 focus:bg-white focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm"
          />

          {error && (
            <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="flex-1 premium-gradient hover:opacity-90 text-white border-0 h-16 text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 active:scale-95 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="tracking-wide">AI is Thinking...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                  <span className="tracking-wide">Get Answer</span>
                </div>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClear}
              variant="outline"
              className="w-16 h-16 rounded-2xl border-2 border-indigo-100 hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shrink-0"
            >
              <Trash2 className="w-6 h-6" />
            </Button>
          </div>
        </form>

        {/* Suggested Questions */}
        {chatHistory.length === 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-600 mb-3">
              📌 Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(q)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-8 sm:p-10 border-white/50 shadow-2xl bg-white/40"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              <span className="p-2 bg-indigo-100 rounded-lg text-lg">💬</span>
              Conversation
            </h3>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-indigo-100">
              {chatHistory.length} messages
            </span>
          </div>

          <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {[...chatHistory].reverse().map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.type === 'question' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${
                  msg.type === 'question' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-6 rounded-3xl shadow-sm ${
                    msg.type === 'question'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-indigo-100'
                  }`}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 px-1">
                  {msg.type === 'question' ? 'You' : 'Assistant'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
