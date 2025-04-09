"""Test script to check if all modules import correctly."""

print("Testing imports...")

# Test importing modules
try:
    from src.api.app import app
    print("✓ API app imported successfully")
except ImportError as e:
    print(f"✗ Failed to import API app: {e}")

try:
    from src.utils.database import SupabaseClient
    print("✓ SupabaseClient imported successfully")
except ImportError as e:
    print(f"✗ Failed to import SupabaseClient: {e}")

try:
    from src.utils.llm import LLMClient
    print("✓ LLMClient imported successfully")
except ImportError as e:
    print(f"✗ Failed to import LLMClient: {e}")

try:
    from src.agents.question_generator import QuestionGeneratorAgent
    print("✓ QuestionGeneratorAgent imported successfully")
except ImportError as e:
    print(f"✗ Failed to import QuestionGeneratorAgent: {e}")

try:
    from src.agents.response_analyzer import ResponseAnalyzer
    print("✓ ResponseAnalyzer imported successfully")
except ImportError as e:
    print(f"✗ Failed to import ResponseAnalyzer: {e}")

try:
    from src.agents.resume_analyzer import ResumeAnalyzer
    print("✓ ResumeAnalyzer imported successfully")
except ImportError as e:
    print(f"✗ Failed to import ResumeAnalyzer: {e}")

try:
    from src.services.speech_processor import ElevenLabsSpeechProcessor
    print("✓ ElevenLabsSpeechProcessor imported successfully")
except ImportError as e:
    print(f"✗ Failed to import ElevenLabsSpeechProcessor: {e}")

try:
    from src.services.interview_manager import InterviewManager
    print("✓ InterviewManager imported successfully")
except ImportError as e:
    print(f"✗ Failed to import InterviewManager: {e}")

print("\nImport test completed.") 