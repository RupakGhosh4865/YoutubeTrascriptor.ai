from main import run_rag_pipeline
import unittest
from unittest.mock import patch, MagicMock

class TestPayloadTruncation(unittest.TestCase):
    @patch('main.get_youtube_transcript')
    @patch('main._call_groq')
    def test_truncation(self, mock_call_groq, mock_get_transcript):
        # Create a transcript with 20,000 characters
        large_transcript = "word " * 4000 
        mock_get_transcript.return_value = large_transcript
        mock_call_groq.return_value = "Mocked Response"

        video_id = "test_video_id"
        question = "What is this about?"
        
        run_rag_pipeline(video_id, question)

        # Verify that the prompt sent to Groq contains the truncated transcript
        # The prompt is constructed with the transcript.
        # We need to check the call to _call_groq
        args, _ = mock_call_groq.call_args
        prompt = args[0]
        
        # Transcript starts after "Transcript context:\n"
        context_start = prompt.find("Transcript context:\n") + len("Transcript context:\n")
        context_end = prompt.find("\n\nQuestion:")
        sent_transcript = prompt[context_start:context_end]

        # max_chars set to 15000 in main.py
        self.assertLessEqual(len(sent_transcript), 15000 + 3) # +3 for "..."
        self.assertTrue(sent_transcript.endswith("..."))
        print(f"✅ Success: Transcript truncated from {len(large_transcript)} to {len(sent_transcript)}")

if __name__ == "__main__":
    unittest.main()
