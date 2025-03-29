import os
import requests
import json
import tempfile
from typing import Dict, Any, BinaryIO, Tuple
from dotenv import load_dotenv

load_dotenv()

class ElevenLabsSpeechProcessor:
    """Service for handling speech-to-text processing using Eleven Labs API."""
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.base_url = "https://api.elevenlabs.io/v1"
    
    def transcribe_audio(self, audio_data: BinaryIO) -> Dict[str, Any]:
        """
        Transcribe audio using Eleven Labs API.
        
        Args:
            audio_data: Binary audio data to transcribe
            
        Returns:
            Dictionary with transcription and metadata about speech patterns
        """
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY environment variable not set")
        
        # Create a temporary file to store the audio data
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            temp_file.write(audio_data.read())
            temp_path = temp_file.name
        
        try:
            headers = {
                "xi-api-key": self.api_key
            }
            
            files = {
                'audio': open(temp_path, 'rb')
            }
            
            response = requests.post(
                f"{self.base_url}/speech-to-text",
                headers=headers,
                files=files
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract text and metadata about speech patterns
                return {
                    "text": result.get("text", ""),
                    "metadata": result.get("metadata", {})
                }
            else:
                raise Exception(f"Error in transcription: {response.text}")
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    def analyze_speech_patterns(self, transcription: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze speech patterns from transcription metadata.
        
        Args:
            transcription: Dict with text and metadata from transcription
            
        Returns:
            Dictionary with analysis of speech patterns
        """
        metadata = transcription.get("metadata", {})
        text = transcription.get("text", "")
        
        # Count filler words
        filler_words = ["um", "uh", "like", "you know", "so", "actually", "basically"]
        filler_count = sum(text.lower().count(word) for word in filler_words)
        
        # Analyze speech rate (if available in metadata)
        speech_rate = metadata.get("speech_rate", {})
        words_per_minute = speech_rate.get("words_per_minute", 0)
        
        # Analyze pauses (if available in metadata)
        pauses = metadata.get("pauses", [])
        total_pause_duration = sum(pause.get("duration", 0) for pause in pauses)
        pause_frequency = len(pauses) / (len(text.split()) / 100) if text else 0
        
        return {
            "filler_words": {
                "count": filler_count,
                "per_100_words": filler_count / (len(text.split()) / 100) if text else 0
            },
            "speech_rate": {
                "words_per_minute": words_per_minute,
                "assessment": self._assess_speech_rate(words_per_minute)
            },
            "pauses": {
                "count": len(pauses),
                "total_duration": total_pause_duration,
                "frequency_per_100_words": pause_frequency
            }
        }
    
    def _assess_speech_rate(self, wpm: float) -> str:
        """Assess the speech rate based on words per minute."""
        if wpm < 120:
            return "slow"
        elif wpm < 160:
            return "moderate"
        else:
            return "fast" 