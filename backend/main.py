import os
import time
from typing import List
import requests
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

load_dotenv()

# Simple in-memory cache to avoid re-indexing same video
_vector_store_cache: dict[str, FAISS] = {}


def get_youtube_transcript(video_id: str, preferred_languages: List[str] | None = None) -> str:
    """
    Fetch transcript for a YouTube video. 
    Uses the instance-based list() and fetch() methods (v1.2.4).
    """
    preferred_languages = preferred_languages or ["en", "hi", "hi-IN"]
    
    api = YouTubeTranscriptApi()
    try:
        # List all available transcripts
        transcript_list = api.list(video_id)
        segments = None

        for lang in preferred_languages:
            try:
                transcript = transcript_list.find_transcript([lang])
                segments = transcript.fetch()
                break
            except Exception:
                continue

        if not segments:
            try:
                first = next(iter(transcript_list))
                if getattr(first, "is_translatable", False) and first.language_code != "en":
                    first = first.translate("en")
                segments = first.fetch()
            except Exception:
                return ""

        parts = [getattr(item, "text", "").replace("\n", " ").strip() for item in segments]
        return " ".join(p for p in parts if p)

    except Exception as e:
        print(f"Error fetching transcript: {e}")
        return ""


def create_vector_store(transcript: str, video_id: str) -> FAISS:
    """Create FAISS vector store from transcript with caching"""
    if video_id in _vector_store_cache:
        print("💾 Using cached vector store")
        return _vector_store_cache[video_id]

    print(f"🧠 Creating vector store for video: {video_id}")
    
    # Split text into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_text(transcript)
    docs = [Document(page_content=chunk) for chunk in chunks]
    print(f"📝 Created {len(docs)} text chunks")
    
    # Create embeddings using Hugging Face model
    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5",
        model_kwargs={"device": "cpu"}
    )
    
    # Create vector store
    vector_store = FAISS.from_documents(docs, embeddings)
    
    # Cache it
    _vector_store_cache[video_id] = vector_store
    print("✅ Vector store created successfully")
    
    return vector_store


def _build_prompt(context: str, question: str) -> str:
    """Build prompt for Groq API with retrieved context"""
    return (
        "You are a specialized assistant that answers questions based on a YouTube video transcript.\n"
        "Use ONLY the following context to answer the question. If the answer isn't in the context, "
        "say exactly \"I don't have enough information to answer this question.\"\n\n"
        f"Context:\n{context}\n\n"
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
    RAG pipeline:
    1. Fetch transcript
    2. Create FAISS vector store
    3. Retrieve relevant context
    4. Call Groq with context
    """
    if not video_id or not question:
        raise ValueError("video_id and question are required")

    print(f"\n{'='*60}")
    print(f"🎬 Processing video: {video_id}")
    print(f"❓ Question: {question}")
    print(f"{'='*60}\n")

    transcript = get_youtube_transcript(video_id)
    
    if not transcript:
        return "❌ I couldn't retrieve a transcript for this video. YouTube may be blocking automated requests. Please try the 'Provide transcript manually' option."

    # Create/retrieved vector store
    try:
        vector_store = create_vector_store(transcript, video_id)
        retriever = vector_store.as_retriever(search_kwargs={"k": 4})
        
        # Retrieve context
        retrieved_docs = retriever.get_relevant_documents(question)
        context = "\n\n".join(doc.page_content for doc in retrieved_docs)
    except Exception as e:
        print(f"❌ Error in RAG retrieval: {e}")
        return f"Error while processing context: {e}"

    prompt = _build_prompt(context, question)

    try:
        answer = _call_groq(prompt)
    except Exception as exc:
        print(f"❌ Groq API error: {exc}")
        return f"Error while calling Groq: {exc}"

    return answer.strip() if answer else "I couldn't generate an answer."


def summarize_video(video_id: str) -> str:
    """
    Generate a strategic summary for a video.
    """
    if not video_id:
        raise ValueError("video_id is required")

    print(f"\n{'='*60}")
    print(f"🎬 Summarizing video: {video_id}")
    print(f"{'='*60}\n")

    transcript = get_youtube_transcript(video_id)
    
    if not transcript:
        return "❌ I couldn't retrieve a transcript for this video. Summarization unavailable."

    # For summary, we use a truncated version of the full transcript if it's too long
    max_chars = 15000
    if len(transcript) > max_chars:
        last_space = transcript.rfind(' ', 0, max_chars)
        truncated_transcript = transcript[:last_space] + "..." if last_space != -1 else transcript[:max_chars] + "..."
    else:
        truncated_transcript = transcript

    prompt = _build_summary_prompt(truncated_transcript)

    try:
        summary = _call_groq(prompt)
    except Exception as exc:
        print(f"❌ Groq API error during summary: {exc}")
        return f"Error while calling Groq: {exc}"

    return summary.strip() if summary else "I couldn't generate a summary."


def get_video_info(video_id: str) -> dict:
    """
    Fetch basic video info using oEmbed API.
    This is generally more resilient to cloud IP blocking than the transcript API.
    """
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return {
            "title": data.get("title", "YouTube Video"),
            "thumbnail": data.get("thumbnail_url", ""),
            "duration": "N/A" # oEmbed doesn't provide duration
        }
    except Exception as e:
        print(f"Error fetching video info: {e}")
        return {"title": "YouTube Video", "thumbnail": "", "duration": "N/A"}


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