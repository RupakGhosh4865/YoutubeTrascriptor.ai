'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Terminal, Cpu, Database, Network } from 'lucide-react'

interface ProcessingStateProps {
  progress: number
  stage: string
}

const AGENT_LOGS = [
  { text: "Establishing secure connection to YouTube API...", level: "info" },
  { text: "Detected video metadata: VideoID verified.", level: "success" },
  { text: "Neural Ingestion: Extracting raw transcript chunks...", level: "info" },
  { text: "Agent Alpha: Cleaning and formatting text data...", level: "success" },
  { text: "Agent Beta: Initializing embedding model...", level: "info" },
  { text: "Converting chunks into high-dimensional vectors...", level: "info" },
  { text: "Populating semantic database (FAISS/Pinecone)...", level: "success" },
  { text: "Verifying vector store integrity...", level: "info" },
  { text: "Agent Gamma: Link established between context and RAG engine.", level: "success" },
  { text: "System ready for real-time inference.", level: "success" }
]

export function ProcessingState({ progress, stage }: ProcessingStateProps) {
  const [logs, setLogs] = useState<typeof AGENT_LOGS>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIdx < AGENT_LOGS.length) {
        setLogs(prev => [...prev, AGENT_LOGS[currentIdx]].slice(-5))
        setCurrentIdx(prev => prev + 1)
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [currentIdx])

  const stages = [
    { label: 'Ingesting Transcript', icon: Cpu },
    { label: 'Synthesizing Intelligence', icon: Network },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card scan-line rounded-[3rem] p-12 sm:p-16 max-w-4xl mx-auto border-white/40 shadow-2xl relative overflow-hidden"
    >
      {/* Hyper-Visual Background */}
      <div className="absolute top-0 right-0 w-full h-full premium-gradient opacity-[0.03] pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Left Side: Neural Core */}
        <div className="w-full lg:w-1/2 space-y-10">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-left"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6">
               Neural Analyst Active
            </span>
            <h2 className="text-5xl font-black text-foreground tracking-tighter leading-[0.9] mb-4">
              Agent Handover <br />
              <span className="gradient-text animate-gradient">Processing</span>
            </h2>
            <p className="text-muted-foreground font-medium">The system is autonomously decomposing the video content for strategic analysis.</p>
          </motion.div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Global Synapse</span>
              <span className="text-2xl font-black gradient-text">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-slate-100/50 rounded-full overflow-hidden p-1 shadow-inner border border-indigo-50">
               <motion.div 
                className="h-full premium-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
               />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {stages.map((s, index) => {
               const Icon = s.icon
               return (
                <motion.div
                  key={index}
                  className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                    progress >= (index + 1) * 50
                      ? 'bg-emerald-50/30 border-emerald-100 text-emerald-800'
                      : 'bg-white/40 border-indigo-50/50 text-slate-400'
                  }`}
                >
                  <Icon className={`w-8 h-8 ${progress >= (index + 1) * 50 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span className="font-bold tracking-tight text-center text-sm">{s.label}</span>
                </motion.div>
               )
            })}
          </div>
        </div>

        {/* Right Side: Neural Logs (Terminal) */}
        <div className="w-full lg:w-1/2">
          <div className="bg-slate-950/90 rounded-[2rem] p-8 border border-white/10 shadow-2xl h-[350px] flex flex-col font-mono text-xs overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-scanlines opacity-10 pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400/70 font-bold uppercase tracking-widest">Agent_Logs_Output</span>
              <div className="ml-auto flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={i + log.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <span className="text-white/20">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className={log.level === 'success' ? 'text-emerald-400' : 'text-indigo-400'}>
                      {log.level === 'success' ? '✓' : '>'}
                    </span>
                    <span className="text-white/80 leading-relaxed">{log.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-emerald-400 inline-block ml-1"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
