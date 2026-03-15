'use client'

import { motion } from 'framer-motion'
import { Video, Brain, Zap } from 'lucide-react'

const features = [
  {
    icon: Video,
    title: 'Instant Extraction',
    description: 'Extract transcripts from any YouTube video with captions',
  },
  {
    icon: Brain,
    title: 'AI-Powered Answers',
    description: 'Get accurate answers using Gemini LLM and semantic search',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Vector-based retrieval for instant, relevant responses',
  },
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <section className="py-32 sm:py-48 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-indigo-50/30 rounded-full blur-[160px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-32"
        >
          <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black text-foreground tracking-tighter mb-8 leading-[0.9]">
            Advanced <br />
            <span className="gradient-text animate-gradient">Capabilities</span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Propelled by Groq Llama 3 & RAG technology for cinematic insight extraction.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isGroq = feature.description.includes('Gemini')
            const description = isGroq ? feature.description.replace('Gemini', 'Groq Llama 3') : feature.description
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="glass-card p-12 rounded-[3.5rem] border-white/40 transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-3 h-full flex flex-col items-center text-center bg-white/40 group">
                  <div className="mb-10 inline-flex p-6 rounded-[2rem] premium-gradient text-white shadow-2xl shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-6 tracking-tighter">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg font-bold">
                    {description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

