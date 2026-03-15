from flask import Flask, request, jsonify
from flask_cors import CORS
from main import get_youtube_transcript, run_rag_pipeline
import re

app = Flask(__name__)
CORS(app)


def extract_video_id(url_or_id: str) -> str:
    """Extract video ID from various YouTube URL formats"""
    url_or_id = url_or_id.strip()
    
    # Already a video ID (11 characters)
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        return url_or_id
    
    # Standard: youtube.com/watch?v=VIDEO_ID
    match = re.search(r'(?:v=|/)([a-zA-Z0-9_-]{11})', url_or_id)
    if match:
        return match.group(1)
    
    # Short URL: youtu.be/VIDEO_ID
    match = re.search(r'youtu\.be/([a-zA-Z0-9_-]{11})', url_or_id)
    if match:
        return match.group(1)
    
    return url_or_id


@app.route('/api/process-video', methods=['POST', 'OPTIONS'])
def process_video():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        url_or_id = data.get('video_id', '')
        
        if not url_or_id:
            return jsonify({'error': 'video_id is required'}), 400
        
        # Extract video ID
        video_id = extract_video_id(url_or_id)
        print(f"\n🎬 Processing video ID: {video_id}")
        
        # Fetch transcript
        transcript = get_youtube_transcript(video_id)

        if not transcript:
            return jsonify({
                'success': False,
                'error': 'No transcript available. Please ensure the video has captions enabled.'
            }), 404

        # Keep response size reasonable but still useful for the UI.
        # The full transcript is returned, plus a shorter preview for display.
        preview_chars = 700
        transcript_preview = transcript[:preview_chars]

        return jsonify({
            'success': True,
            'video_id': video_id,
            'transcript_length': len(transcript),
            'transcript': transcript,
            'transcript_preview': transcript_preview,
            'message': 'Transcript extracted successfully'
        })
    
    except Exception as e:
        print(f"❌ Error in process_video: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ask-question', methods=['POST', 'OPTIONS'])
def ask_question():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        video_id = extract_video_id(data.get('video_id', ''))
        question = data.get('question', '')
        
        if not video_id or not question:
            return jsonify({'error': 'video_id and question are required'}), 400
        
        print(f"\n💬 Question for {video_id}: {question}")
        
        # Run RAG pipeline
        answer = run_rag_pipeline(video_id, question)
        
        return jsonify({
            'success': True,
            'answer': answer
        })
    
    except Exception as e:
        print(f"❌ Error in ask_question: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/summarize', methods=['POST', 'OPTIONS'])
def summarize():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        from main import summarize_video
        data = request.json
        video_id = extract_video_id(data.get('video_id', ''))
        
        if not video_id:
            return jsonify({'error': 'video_id is required'}), 400
        
        print(f"\n📝 Summarizing video ID: {video_id}")
        
        # Generate summary
        summary = summarize_video(video_id)
        
        return jsonify({
            'success': True,
            'summary': summary
        })
    
    except Exception as e:
        print(f"❌ Error in summarize: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'YouTube Q&A API is running'})


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Starting YouTube Q&A Backend Server")
    print("="*60 + "\n")
    app.run(debug=True, port=8000, host='0.0.0.0')