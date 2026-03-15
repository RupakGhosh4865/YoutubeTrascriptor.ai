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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl sm:text-6xl font-black text-foreground tracking-tight mb-6">
            Everything you need <br />
            <span className="gradient-text">for deep analysis</span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Propel your research with state-of-the-art AI technology.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-10"
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
                <div className="glass-effect p-10 rounded-[2.5rem] border-white/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col items-center text-center bg-white/40">
                  <div className="mb-8 inline-flex p-5 rounded-2xl premium-gradient text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg font-medium">
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
