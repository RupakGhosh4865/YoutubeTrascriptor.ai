'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'

interface ProcessingStateProps {
  progress: number
  stage: string
}

export function ProcessingState({ progress, stage }: ProcessingStateProps) {
  const stages = [
    { label: 'Extracting transcript...', icon: '📝' },
    { label: 'Building vector store...', icon: '🧮' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-effect rounded-2xl p-8 sm:p-10 max-w-2xl mx-auto"
    >
      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl font-bold text-slate-900 mb-8 text-center"
      >
        ⏳ Processing Video...
      </motion.h2>

      {/* Progress bar */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Overall Progress</span>
          <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-200" />
      </div>

      {/* Stage indicators */}
      <div className="space-y-3">
        {stages.map((s, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
              progress >= (index + 1) * 50
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span className="text-xl">{s.icon}</span>
            <span className="font-medium">{s.label}</span>
            {progress >= (index + 1) * 50 && (
              <span className="ml-auto text-emerald-600">✓</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Loading animation */}
      <div className="mt-8 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              repeat: Infinity,
            }}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
          />
        ))}
      </div>
    </motion.div>
  )
}
