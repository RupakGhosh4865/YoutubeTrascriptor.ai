'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Play, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { extractVideoId } from '@/lib/api'

interface VideoInputProps {
  onSubmit: (videoId: string) => void
  isLoading: boolean
  error?: string
}

const SAMPLE_VIDEOS = [
  { id: 'Gfr50f6ZBvo', label: 'Deep Learning Basics' },
  { id: 'dQw4w9WgXcQ', label: 'Popular Video' },
]

export function VideoInput({ onSubmit, isLoading, error }: VideoInputProps) {
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    try {
      const videoId = extractVideoId(input)
      onSubmit(videoId)
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Invalid YouTube URL'
      )
    }
  }

  const handleSampleClick = (videoId: string) => {
    setValidationError('')
    setInput(videoId)
    onSubmit(videoId)
  }

  return (
    <div className="glass-effect rounded-[2rem] p-8 sm:p-12 max-w-3xl mx-auto border-white/50 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 premium-gradient opacity-10 blur-3xl -mr-16 -mt-16"></div>
      
      <div className="mb-10 text-center sm:text-left relative z-10">
        <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight">
          Analyze Video <span className="gradient-text">Instantly</span>
        </h2>
        <p className="text-muted-foreground text-lg sm:text-xl font-medium">
          Paste a YouTube link below to start extraction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        <div className="relative group">
          <Input
            type="text"
            placeholder="Paste YouTube URL or Video ID..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setValidationError('')
            }}
            disabled={isLoading}
            className="h-16 px-6 text-lg rounded-2xl bg-white/50 border-white/40 focus:bg-white focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm"
          />
        </div>

        {(validationError || error) && (
          <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">
              {validationError || error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="lg"
          className="w-full premium-gradient hover:opacity-90 text-white border-0 h-16 text-lg font-bold rounded-2xl transition-all duration-500 shadow-lg hover:shadow-indigo-500/25 active:scale-95 group overflow-hidden relative"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="tracking-wide">Analyzing Content...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current" />
              <span className="tracking-wide">Process Now</span>
            </div>
          )}
        </Button>
      </form>

      {/* Sample Videos */}
      <div className="mt-12 pt-10 border-t border-indigo-100/50 relative z-10">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">
          Need a quick test?
        </p>
        <div className="flex flex-wrap gap-4">
          {SAMPLE_VIDEOS.map((video) => (
            <button
              key={video.id}
              onClick={() => handleSampleClick(video.id)}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
            >
              {video.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
