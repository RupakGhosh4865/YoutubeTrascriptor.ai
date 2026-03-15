'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface HeroProps {
  onGetStarted: () => void
}

export function Hero({ onGetStarted }: HeroProps) {
  const [mounted, setMounted] = useState(false)
  const [nodes, setNodes] = useState<{ top: string; left: string }[]>([])

  useEffect(() => {
    setMounted(true)
    const newNodes = [...Array(6)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }))
    setNodes(newNodes)
  }, [])

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-background px-4 sm:px-6 lg:px-8 pt-20 pb-20">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] premium-gradient rounded-full blur-[160px] opacity-10 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] premium-gradient rounded-full blur-[160px] opacity-10 animate-pulse delay-700"></div>

      {/* Futuristic Floating Nodes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {mounted && nodes.map((node, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full premium-gradient floating-node opacity-40 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            style={{
              top: node.top,
              left: node.left,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-5xl"
      >
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-card border border-white/40 shadow-xl transition-all hover:scale-105 hover:bg-white/60 cursor-default group">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-ping"></span>
            <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Next-Gen Video Intelligence
            </span>
            <span className="text-indigo-300 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl sm:text-9xl font-black text-foreground tracking-tighter mb-8 leading-[0.8]">
            <span className="gradient-text animate-gradient">YouTube</span> <br />
            <span className="relative">
              Q&A
              <span className="absolute -bottom-2 left-0 w-full h-3 premium-gradient rounded-full opacity-50 blur-[2px]"></span>
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Turn any YouTube video into an interactive brain. <br className="hidden sm:block" />
            Extract insights, summarize content, and chat with videos in real-time.
          </p>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="premium-gradient hover:opacity-90 text-white shadow-2xl transition-all duration-500 px-14 h-18 text-xl font-black rounded-2xl hover:scale-105 active:scale-95 border-0 group"
          >
            Start Analyzing
            <Zap className="ml-2 w-5 h-5 group-hover:scale-125 transition-transform" />
          </Button>
          
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl border-2 border-indigo-100/50 text-indigo-600 font-bold text-sm tracking-tight glass-card">
              <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
              Live on Groq Llama 3
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 opacity-30"
      >
        <ArrowDown className="w-10 h-10 text-primary" />
      </motion.div>
    </section>
  )
}

