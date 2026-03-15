export interface ChatMessage {
  id: string
  type: 'question' | 'answer'
  content: string
  timestamp: Date
}

export interface VideoInfo {
  videoId: string
  title: string
  thumbnail: string
  duration: string
  transcriptLength: number
  // Short snippet of the transcript for display in the UI
  transcriptPreview?: string
  // Full transcript text
  transcript?: string
}

export interface ProcessingStatus {
  stage: 'extracting' | 'building' | 'complete'
  progress: number
  message: string
}
