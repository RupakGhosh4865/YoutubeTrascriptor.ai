'use client'

import { ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface HeroProps {
  onGetStarted: () => void
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background px-4 sm:px-6 lg:px-8 pt-20 pb-20">
      {/* Dynamic background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] premium-gradient rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center max-w-5xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-effect border border-white/40 shadow-sm transition-all hover:scale-105 cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">
              Powered by Groq Llama 3 & RAG
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
        >
          YouTube <br />
          <span className="gradient-text gradient-animate">Intelligence</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl sm:text-2xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed"
        >
          Transform any YouTube video into an interactive conversation. Get deep insights in seconds.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="premium-gradient hover:opacity-90 text-white shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)] transition-all duration-500 px-12 h-16 text-xl font-bold rounded-2xl hover:scale-105 active:scale-95 border-0"
          >
            Get Started Now
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 opacity-50"
      >
        <ArrowDown className="w-8 h-8 text-primary" />
      </motion.div>
    </section>
  )
}
