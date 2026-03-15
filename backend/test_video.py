from main import get_youtube_transcript

# Test the video you mentioned
video_id = "O1z_-O6IXIc"
print(f"Testing video: {video_id}\n")

transcript = get_youtube_transcript(video_id)

if transcript:
    print(f"\n{'='*60}")
    print(f"✅ SUCCESS!")
    print(f"{'='*60}")
    print(f"Transcript length: {len(transcript)} characters")
    print(f"\nFirst 500 characters:")
    print(transcript[:500])
else:
    print("\n❌ FAILED - No transcript found")