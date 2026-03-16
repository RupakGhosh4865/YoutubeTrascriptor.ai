import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Play, AlertCircle, FileText, Upload, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { extractVideoId } from '@/lib/api'

interface VideoInputProps {
  onSubmit: (videoId: string, manualTranscript?: string) => void
  isLoading: boolean
  error?: string
  onToast?: (message: string, type: 'success' | 'error') => void
}

export function VideoInput({ onSubmit, isLoading, error, onToast }: VideoInputProps) {
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState('')
  const [showFallback, setShowFallback] = useState(false)
  const [manualTranscript, setManualTranscript] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    const videoId = extractVideoId(input)
    if (!videoId) {
      setValidationError('Invalid YouTube URL. Please check the link.')
      return
    }

    onSubmit(videoId, manualTranscript)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    if (reader.result) {
      const content = reader.result as string
      setManualTranscript(content)
      onToast?.('Transcript file loaded! 📄', 'success')
    }
    reader.readAsText(file)
  }

  // Note: toast is imported from sonner in page.tsx, assuming it's available or we can use a simpler notification
  // For simplicity here, I'll just set the state.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto w-full"
    >
      <div className="glass-card scan-line glow-border rounded-[2.5rem] p-10 sm:p-14 border-white/40 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 premium-gradient opacity-50"></div>
        
        <div className="relative z-10 text-center space-y-10">
          <div className="inline-flex items-center justify-center p-6 rounded-[2rem] bg-indigo-50/50 text-indigo-600 mb-2 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner">
            <Play className="w-10 h-10 fill-current" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tighter leading-tight">
              Ingest <span className="gradient-text animate-gradient">Stream Metadata</span>
            </h2>
            <p className="text-muted-foreground font-bold tracking-tight text-lg">
              Input the transmission link to begin neural decomposition.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-muted-foreground group-focus-within/input:text-primary transition-colors">
                <span className="text-xs font-black tracking-widest uppercase opacity-40 mr-3">ID:</span>
              </div>
              <Input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pl-14 h-20 rounded-3xl bg-white/60 border-2 border-indigo-50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-bold tracking-tight placeholder:text-slate-300 placeholder:font-medium shadow-inner"
              />
              <div className="absolute inset-y-0 right-4 flex items-center">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>

            <AnimatePresence>
              {(error || showFallback) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Alert variant="destructive" className="rounded-2xl border-2 border-red-100 bg-red-50/50 backdrop-blur-md">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="font-bold tracking-tight text-slate-800 text-left">
                      {error || "We couldn't find a transcript. You can provide one manually below."}
                      {!showFallback && (
                        <button 
                          type="button" 
                          onClick={() => setShowFallback(true)}
                          className="block mt-2 underline text-indigo-600 hover:text-indigo-800"
                        >
                          Provide transcript manually?
                        </button>
                      )}
                    </AlertDescription>
                  </Alert>

                  {showFallback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 p-6 rounded-3xl bg-indigo-50/30 border-2 border-indigo-100/50 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Manual Content Analysis
                        </label>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowFallback(false)
                            setManualTranscript('')
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <Textarea 
                        placeholder="Paste the transcript text here..."
                        value={manualTranscript}
                        onChange={(e) => setManualTranscript(e.target.value)}
                        className="min-h-[150px] rounded-2xl bg-white/80 border-indigo-50 focus:border-indigo-200 transition-all font-medium text-sm leading-relaxed"
                      />

                      <div className="flex gap-4">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept=".txt,.json" 
                          className="hidden" 
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 h-12 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs uppercase tracking-widest"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {validationError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive" className="rounded-2xl border-2 border-red-100 bg-red-50/50 backdrop-blur-md">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="font-bold tracking-tight text-slate-800">
                    {validationError}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !input}
              className="w-full h-20 rounded-3xl premium-gradient text-white text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Synthesizing...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Initialize Analysis
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </span>
              )}
            </Button>
          </form>

          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] pt-4">
             Transmission encrypted via TLS 1.3
          </p>
        </div>
      </div>
    </motion.div>
  )
}
