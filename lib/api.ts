const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

export const extractVideoId = (input: string): string => {
  // Match YouTube URLs and extract video ID
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Just video ID
  ]

  for (const pattern of regexPatterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }

  throw new Error('Invalid YouTube URL or video ID')
}

export const processVideo = async (videoId: string) => {
  const response = await fetch(`${API_BASE_URL}/process-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to process video')
  }

  return response.json()
}

export const askQuestion = async (videoId: string, question: string) => {
  const response = await fetch(`${API_BASE_URL}/ask-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId, question }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get answer')
  }

  return response.json()
}

export const getVideoInfo = async (videoId: string) => {
  const response = await fetch(`${API_BASE_URL}/video-info?video_id=${videoId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch video info')
  }

  return response.json()
}

export const summarizeVideo = async (videoId: string) => {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id: videoId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get summary')
  }

  return response.json()
}
