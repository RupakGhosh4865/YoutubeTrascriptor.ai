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
  onSummarize: () => void
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
  onSummarize,
  chatHistory,
  isLoading,
  error,
}: QuestionInterfaceProps) {
  const [question, setQuestion] = useState('')
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)

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
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Video Info Header */}
      {videoInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[2.5rem] p-10 sm:p-12 border-white/40 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-80 h-80 premium-gradient opacity-5 blur-[120px] -mr-40 -mt-40"></div>
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
            <div className="flex-shrink-0 relative">
              {videoInfo.thumbnail && (
                <div className="relative overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-white/50 transition-transform duration-700 group-hover:scale-105">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-full mb-6 uppercase tracking-[0.2em] shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Extracted Intelligence
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground line-clamp-2 mb-6 tracking-tighter leading-tight text-glow">
                {videoInfo.title}
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-muted-foreground font-bold">
                <span className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100/50">
                   ⌚ {videoInfo.duration}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50/50 text-indigo-600">
                   📄 {videoInfo.transcriptLength.toLocaleString()} tokens
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transcript & QA Layout */}
      <div className="grid grid-cols-1 gap-12">
        {/* Transcript Viewer */}
        {(videoInfo?.transcript || videoInfo?.transcriptPreview) && (
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass-card rounded-[2.5rem] p-10 sm:p-12 border-white/40 shadow-2xl"
           >
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-100/50 rounded-2xl text-2xl shadow-inner">
                   📜
                 </div>
                 <h3 className="text-3xl font-black text-foreground tracking-tighter">
                   Full Transcript
                 </h3>
               </div>
               <div className="flex gap-4 w-full sm:w-auto">
                 <Button
                   type="button"
                   onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                   className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-black bg-white/50 border-2 border-indigo-100 hover:border-indigo-400 text-indigo-700 transition-all tracking-wider uppercase text-xs"
                 >
                   {isTranscriptExpanded ? 'Collapse' : 'Expand View'}
                 </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSummarize}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-black bg-white/50 border-2 border-primary/20 hover:border-primary text-primary transition-all tracking-wider uppercase text-xs flex items-center gap-2"
                  >
                    <span>Strategic Summary</span>
                    <span className="text-lg">📄</span>
                  </Button>
                  {videoInfo.transcript && (
                   <Button
                     type="button"
                     onClick={async () => {
                       try {
                         await navigator.clipboard.writeText(videoInfo.transcript || '')
                         alert('✅ Copied to clipboard!')
                       } catch (err) {
                         console.error('Failed to copy:', err)
                       }
                     }}
                     className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-black premium-gradient text-white transition-all shadow-lg hover:shadow-indigo-500/20 tracking-wider uppercase text-xs border-0"
                   >
                     Copy All
                   </Button>
                 )}
               </div>
             </div>
             
             <div 
              className={`relative rounded-[2rem] bg-slate-50/80 p-8 sm:p-10 border-2 border-indigo-50/50 transition-all duration-700 ${
                isTranscriptExpanded ? 'max-h-[1000px]' : 'max-h-[400px]'
              } overflow-y-auto custom-scrollbar`}
             >
               <p className="text-lg text-slate-700 whitespace-pre-wrap leading-[1.8] font-medium select-text">
                 {videoInfo.transcript || videoInfo.transcriptPreview || 'No transcript available'}
               </p>
               {!isTranscriptExpanded && (
                 <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-50/100 to-transparent pointer-events-none rounded-b-[2rem]"></div>
               )}
             </div>
           </motion.div>
        )}

        {/* Question Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2.5rem] p-10 sm:p-12 border-white/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 premium-gradient opacity-5 blur-[100px] -ml-32 -mt-32"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-4">
               <span className="p-3 bg-primary/10 rounded-2xl text-2xl shadow-inner">💡</span>
               Ask AI Insights
            </h3>
            <Button
                type="button"
                onClick={onClear}
                variant="outline"
                className="h-14 px-5 rounded-2xl border-2 border-red-50 hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-500 group"
              >
                <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="relative">
              <div className="absolute -inset-1 premium-gradient rounded-3xl opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity"></div>
              <Input
                type="text"
                placeholder="Ex: What are the three main takeaways from this video?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isLoading}
                className="h-20 px-8 text-xl rounded-2xl bg-white/60 border-indigo-100/50 focus:bg-white focus:ring-8 focus:ring-primary/10 transition-all duration-500 shadow-inner border-2 font-medium"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5 py-6">
                <AlertCircle className="h-6 w-6" />
                <AlertDescription className="font-bold text-base ml-2">{error}</AlertDescription>
              </Alert>
            )}

            <Button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="w-full premium-gradient hover:opacity-100 text-white border-0 h-20 text-xl font-black rounded-2xl transition-all duration-500 shadow-2xl shadow-indigo-500/20 active:scale-[0.98] group relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-widest uppercase">Consulting Llama 3...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group-hover:scale-105 transition-transform duration-500">
                    <Send className="w-6 h-6" />
                    <span className="tracking-widest uppercase">Generate Answer</span>
                  </div>
                )}
            </Button>
          </form>

          {/* Suggested Questions */}
          {chatHistory.length === 0 && (
            <div className="mt-10 pt-10 border-t border-indigo-50/50">
              <p className="text-xs font-black text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                Recommended Prompts
              </p>
              <div className="flex flex-wrap gap-4">
                {SUGGESTED_QUESTIONS.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(q)}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-2xl bg-white/40 border-2 border-indigo-100/70 text-indigo-700 hover:bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 disabled:opacity-50 text-sm font-black uppercase tracking-wider"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Conversation Stream */}
        {chatHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2.5rem] p-10 sm:p-12 border-white/40 shadow-2xl bg-white/20"
          >
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-4">
                <span className="p-3 bg-indigo-100 rounded-2xl text-2xl shadow-inner">💬</span>
                Live Intelligence Stream
              </h3>
              <div className="px-5 py-2 rounded-2xl bg-white border-2 border-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {chatHistory.length} Exchanges
              </div>
            </div>

            <div className="space-y-12 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
              {[...chatHistory].reverse().map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.type === 'question' ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex flex-col ${
                    msg.type === 'question' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl ${
                      msg.type === 'question'
                        ? 'premium-gradient text-white rounded-tr-none shadow-indigo-500/20'
                        : 'bg-white text-slate-800 rounded-tl-none border-2 border-indigo-50 shadow-slate-200/50'
                    }`}
                  >
                    <p className="text-lg sm:text-xl leading-relaxed whitespace-pre-wrap font-bold tracking-tight">
                      {msg.content}
                    </p>
                  </div>
                  <div className={`mt-4 flex items-center gap-3 px-4 ${msg.type === 'question' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                        msg.type === 'question' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                        {msg.type === 'question' ? 'ME' : 'AI'}
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                      {msg.type === 'question' ? 'You' : 'Intelligence'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

