import os
import time
from typing import List
import requests
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()

# Simple in-memory cache to avoid re-processing same video+question
_cache: dict[str, str] = {}


def get_youtube_transcript(video_id: str, preferred_languages: List[str] | None = None) -> str:
    """
    Fetch transcript for a YouTube video with robust fallback mechanisms.
    Tries multiple languages and falls back to any available transcript.
    """
    preferred_languages = preferred_languages or ["en", "hi", "hi-IN"]

    # The version you have (1.2.4) uses an *instance* API:
    #   api = YouTubeTranscriptApi()
    #   transcript_list = api.list(video_id)
    api = YouTubeTranscriptApi()

    try:
        # List all available transcripts for this video
        transcript_list = api.list(video_id)

        segments: List[dict] | None = None

        # 1) Try preferred languages first (any type of transcript)
        for lang in preferred_languages:
            try:
                transcript = transcript_list.find_transcript([lang])
                segments = transcript.fetch()
                break
            except Exception:
                continue

        # 2) Fallback: first available transcript, translated to English if possible
        if not segments:
            try:
                first = next(iter(transcript_list))
                if getattr(first, "is_translatable", False) and first.language_code != "en":
                    first = first.translate("en")
                segments = first.fetch()
            except Exception:
                return ""

    except Exception as e:
        # Log error but don't crash
        print(f"Error fetching transcript: {e}")
        return ""

    # Process transcript segments into text
    # In youtube-transcript-api 1.2.4, each item is a FetchedTranscriptSnippet
    # with a .text attribute (not a dict).
    parts = [getattr(item, "text", "").replace("\n", " ").strip() for item in segments]
    parts = [p for p in parts if p]
    return " ".join(parts)


def _build_prompt(context: str, question: str) -> str:
    """Build prompt for Gemini API"""
    return (
        "You are an assistant that answers questions about a YouTube video transcript.\n"
        "Use ONLY the information from the provided transcript context. If the context "
        "does not contain enough information to answer accurately, reply exactly with "
        "\"I don't have enough information to answer this question.\"\n\n"
        f"Transcript context:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer:"
    )


def _build_summary_prompt(context: str) -> str:
    """Build prompt for summarization"""
    return (
        "Please provide a concise but comprehensive strategic summary of this YouTube video based on its transcript.\n"
        "Your summary should include:\n"
        "1. A high-level overview of the video's purpose.\n"
        "2. Key insights and main points discussed.\n"
        "3. A final concluding thought on the overall message.\n\n"
        "Format the output using markdown with clear headings and bullet points. Keep it professional and high-impact.\n\n"
        f"Transcript context:\n{context}\n\n"
        "Strategic Summary:"
    )


def _call_groq(prompt: str, max_retries: int = 3) -> str:
    """
    Call Groq API with retry logic and exponential backoff for rate limits.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in environment")

    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    body = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that answers questions based on video transcripts."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 1024
    }

    # Retry logic with exponential backoff
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait_time = 2 ** attempt
                print(f"⏳ Retrying after {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
            
            print(f"🤖 Calling Groq API ({model_name})... (attempt {attempt + 1}/{max_retries})")
            resp = requests.post(url, headers=headers, json=body, timeout=60)
            
            if resp.status_code == 429:
                print("⚠️ Rate limited by Groq.")
                continue
                
            resp.raise_for_status()
            
            data = resp.json()
            answer = data["choices"][0]["message"]["content"]
            print("✅ Got answer from Groq")
            return answer
                
        except Exception as e:
            print(f"❌ Groq API error: {e}")
            if attempt < max_retries - 1:
                continue
            return f"Error while calling Groq: {e}"
    
    return "Failed to get response from Groq after multiple attempts."


def run_rag_pipeline(video_id: str, question: str) -> str:
    """
    Simple RAG pipeline:
    1. Download transcript
    2. Send to Gemini with question
    3. Uses caching to avoid re-processing same questions
    """
    if not video_id:
        raise ValueError("video_id is required")
    if not question:
        raise ValueError("question is required")

    # Check cache first
    cache_key = f"{video_id}:{question.strip().lower()}"
    if cache_key in _cache:
        print("💾 Using cached answer")
        return _cache[cache_key]

    print(f"\n{'='*60}")
    print(f"🎬 Processing video: {video_id}")
    print(f"❓ Question: {question}")
    print(f"{'='*60}\n")

    transcript = get_youtube_transcript(video_id)
    
    if not transcript:
        return "❌ I couldn't retrieve a transcript for this video. Please ensure the video has captions enabled."

    # Truncate transcript if too long (Groq/Gemini have token limits)
    # Reducing to 15,000 to avoid 413 Client Error: Payload Too Large
    max_chars = 15000  # ~4000 tokens
    if len(transcript) > max_chars:
        print(f"⚠️ Transcript too long ({len(transcript)} chars), truncating to {max_chars}")
        # Try to find the last full sentence/space before truncation
        last_space = transcript.rfind(' ', 0, max_chars)
        if last_space != -1:
            transcript = transcript[:last_space] + "..."
        else:
            transcript = transcript[:max_chars] + "..."

    prompt = _build_prompt(transcript, question)

    # Add a small delay to avoid hitting rate limits too quickly
    # This helps space out requests
    time.sleep(0.5)

    try:
        answer = _call_groq(prompt)
    except Exception as exc:
        print(f"❌ Groq API error: {exc}")
        return f"Error while calling Groq: {exc}"

    if not answer:
        return "I couldn't generate an answer."

    answer = answer.strip()
    
    # Cache the answer (limit cache size to avoid memory issues)
    if len(_cache) > 100:
        # Remove oldest entry (simple FIFO)
        _cache.pop(next(iter(_cache)))
    _cache[cache_key] = answer
    
    return answer


def summarize_video(video_id: str) -> str:
    """
    Generate a strategic summary for a video.
    """
    if not video_id:
        raise ValueError("video_id is required")

    # Check cache first (using a specific summary key)
    cache_key = f"{video_id}:summary"
    if cache_key in _cache:
        print("💾 Using cached summary")
        return _cache[cache_key]

    print(f"\n{'='*60}")
    print(f"🎬 Summarizing video: {video_id}")
    print(f"{'='*60}\n")

    transcript = get_youtube_transcript(video_id)
    
    if not transcript:
        return "❌ I couldn't retrieve a transcript for this video. Summarization unavailable."

    # Truncate to avoid payload limits
    max_chars = 15000
    if len(transcript) > max_chars:
        last_space = transcript.rfind(' ', 0, max_chars)
        transcript = transcript[:last_space] + "..." if last_space != -1 else transcript[:max_chars] + "..."

    prompt = _build_summary_prompt(transcript)

    time.sleep(0.5)

    try:
        summary = _call_groq(prompt)
    except Exception as exc:
        print(f"❌ Groq API error during summary: {exc}")
        return f"Error while calling Groq: {exc}"

    if not summary:
        return "I couldn't generate a summary."

    summary = summary.strip()
    
    # Cache the summary
    if len(_cache) > 100:
        _cache.pop(next(iter(_cache)))
    _cache[cache_key] = summary
    
    return summary


# For direct testing
if __name__ == "__main__":
    test_video_id = "O1z_-O6IXIc"
    print(f"Testing with video: {test_video_id}\n")
    
    transcript = get_youtube_transcript(test_video_id)
    
    if transcript:
        print(f"\n{'='*60}")
        print(f"SUCCESS! Transcript length: {len(transcript)} characters")
        print(f"{'='*60}")
        print(f"\nFirst 500 characters:\n{transcript[:500]}...")
    else:
        print("\n❌ FAILED - No transcript found")