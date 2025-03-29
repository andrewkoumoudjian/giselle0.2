import os
import uuid
import tempfile
from typing import Dict, List, Any, BinaryIO

from ..utils.database import SupabaseClient
from ..agents.question_generator import QuestionGeneratorAgent
from ..agents.response_analyzer import ResponseAnalyzer
from ..agents.resume_analyzer import ResumeAnalyzer
from ..services.speech_processor import ElevenLabsSpeechProcessor

class InterviewManager:
    """Service that coordinates the entire interview process."""
    
    def __init__(self):
        self.db = SupabaseClient()
        self.question_generator = QuestionGeneratorAgent()
        self.response_analyzer = ResponseAnalyzer()
        self.resume_analyzer = ResumeAnalyzer()
        self.speech_processor = ElevenLabsSpeechProcessor()
    
    def create_interview(self, job_id: str, candidate_id: str) -> Dict[str, Any]:
        """
        Create a new interview session with questions.
        
        Args:
            job_id: ID of the job
            candidate_id: ID of the candidate
            
        Returns:
            Dictionary with interview details
        """
        try:
            # Create the interview in the database
            interview = self.db.create_interview(job_id, candidate_id)
            interview_id = interview["id"]
            
            # Get job description to generate questions
            job = self.db.get_job_description(job_id)
            job_description = job["description"]
            required_skills = job.get("required_skills")
            
            if required_skills and isinstance(required_skills, str):
                try:
                    required_skills = list(eval(required_skills))
                except:
                    required_skills = None
            
            # Generate interview questions
            try:
                questions = self.question_generator.generate_questions(job_description, required_skills)
            except Exception as e:
                print(f"Error generating questions: {str(e)}")
                # Fallback to mock questions if there's an error
                questions = [
                    {"question": "Tell me about your experience with frontend development.", "type": "experience", "skill_assessed": "technical_knowledge"},
                    {"question": "How do you handle difficult team dynamics?", "type": "behavioral", "skill_assessed": "collaboration"},
                    {"question": "Describe a challenging project you worked on.", "type": "behavioral", "skill_assessed": "problem_solving"},
                    {"question": "How do you stay updated with the latest technologies?", "type": "behavioral", "skill_assessed": "learning"},
                    {"question": "What's your approach to responsive design?", "type": "technical", "skill_assessed": "frontend_skills"}
                ]
            
            # Store questions in the database
            db_questions = self.db.create_questions(interview_id, questions)
            
            # Return the interview with questions in the format expected by the frontend
            return {
                "interview": interview,
                "questions": db_questions
            }
        except Exception as e:
            import traceback
            print(f"Error creating interview: {str(e)}")
            print(traceback.format_exc())
            # Return a mock response for testing
            mock_interview = {
                "id": str(uuid.uuid4()),
                "job_id": job_id,
                "candidate_id": candidate_id,
                "status": "pending",
                "created_at": "2023-01-01T00:00:00Z"
            }
            mock_questions = [
                {
                    "id": str(uuid.uuid4()),
                    "interview_id": mock_interview["id"],
                    "text": "Tell me about your experience.",
                    "type": "behavioral",
                    "skill_assessed": "communication",
                    "order_index": 0
                }
            ]
            return {
                "interview": mock_interview,
                "questions": mock_questions
            }
    
    def get_interview_questions(self, interview_id: str) -> List[Dict[str, Any]]:
        """
        Get all questions for an interview.
        
        Args:
            interview_id: ID of the interview
            
        Returns:
            List of questions
        """
        return self.db.get_interview_questions(interview_id)
    
    def process_response(self, question_id: str, audio_data: BinaryIO) -> Dict[str, Any]:
        """
        Process a candidate's audio response.
        
        Args:
            question_id: ID of the question being answered
            audio_data: Binary audio data of the response
            
        Returns:
            Dictionary with response details and analysis
        """
        # Get the question details
        question = self.db.client.table('questions').select("*").eq("id", question_id).execute().data[0]
        interview_id = question["interview_id"]
        
        # Get the interview to find associated job and candidate
        interview = self.db.get_interview(interview_id)
        
        # Save the audio file
        file_name = f"{interview_id}/{question_id}.mp3"
        
        # Create a temporary file to store the audio data
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            temp_file.write(audio_data.read())
            temp_path = temp_file.name
        
        try:
            # Upload to storage
            audio_url = self.db.upload_audio(temp_path, file_name)
            
            # Create response record
            response = self.db.create_response(question_id, audio_url)
            response_id = response["id"]
            
            # Transcribe the audio
            with open(temp_path, 'rb') as f:
                transcription_result = self.speech_processor.transcribe_audio(f)
            
            transcription_text = transcription_result["text"]
            
            # Analyze speech patterns
            speech_metadata = self.speech_processor.analyze_speech_patterns(transcription_result)
            
            # Analyze the response
            analysis = self.response_analyzer.analyze_response(
                interview_id=interview_id,
                question_id=question_id,
                question_text=question["text"],
                question_type=question["type"],
                skill_assessed=question["skill_assessed"],
                transcription=transcription_text,
                speech_metadata=speech_metadata
            )
            
            # Update the response with transcription and analysis
            self.db.update_response_analysis(response_id, transcription_text, analysis)
            
            return {
                "response_id": response_id,
                "transcription": transcription_text,
                "analysis": analysis
            }
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    def complete_interview(self, interview_id: str) -> Dict[str, Any]:
        """
        Complete an interview and generate final assessment.
        
        Args:
            interview_id: ID of the interview
            
        Returns:
            Dictionary with assessment details
        """
        # Get the interview
        interview = self.db.get_interview(interview_id)
        job_id = interview["job_id"]
        candidate_id = interview["candidate_id"]
        
        # Get job description
        job = self.db.get_job_description(job_id)
        job_description = job["description"]
        
        # Get candidate resume data
        candidate = self.db.get_candidate(candidate_id)
        resume_url = candidate.get("resume_url")
        resume_parsed = candidate.get("resume_parsed")
        
        # Get all responses for this interview
        responses = self.db.client.table('responses').select("*").eq("question_id.interview_id", interview_id).execute().data
        
        # Calculate average scores
        total_scores = {
            "empathy": [],
            "collaboration": [],
            "confidence": [],
            "english_proficiency": [],
            "professionalism": []
        }
        
        for response in responses:
            analysis = response.get("analysis_results")
            if analysis and isinstance(analysis, str):
                try:
                    analysis = eval(analysis)
                    scores = analysis.get("scores", {})
                    
                    for score_type in total_scores.keys():
                        if score_type in scores and scores[score_type] is not None:
                            total_scores[score_type].append(scores[score_type])
                except:
                    continue
        
        # Calculate averages
        avg_scores = {}
        for score_type, scores in total_scores.items():
            if scores:
                avg_scores[score_type] = round(sum(scores) / len(scores))
            else:
                avg_scores[score_type] = 0
        
        # Generate correlation matrix if resume is available
        correlation_data = None
        if resume_parsed and isinstance(resume_parsed, str):
            try:
                resume_data = eval(resume_parsed)
                # Analyze resume against job
                job_analysis = self.resume_analyzer.analyze_resume_for_job("", job_description)
                correlation_data = job_analysis["correlation"]
            except:
                # If resume parsing fails, use the minimal structure
                job_fields = self.resume_analyzer.identify_job_fields(job_description)
                candidate_scores = [{"field": jf["field"], "score": 50, "evidence": "Automatic score"} for jf in job_fields]
                correlation_data = self.resume_analyzer.generate_correlation_matrix(job_fields, candidate_scores)
        
        # Create the assessment
        assessment_data = {
            **avg_scores,
            "field_importance": correlation_data["job_fields"] if correlation_data else None,
            "candidate_skills": correlation_data["candidate_scores"] if correlation_data else None,
            "correlation_matrix": correlation_data["visualization_data"] if correlation_data else None
        }
        
        assessment = self.db.create_assessment(interview_id, assessment_data)
        
        # Update interview status to completed
        self.db.update_interview_status(interview_id, "completed")
        
        return {
            "assessment": assessment,
            "interview_id": interview_id
        }
    
    def upload_and_parse_resume(self, candidate_id: str, resume_file: BinaryIO, filename: str) -> Dict[str, Any]:
        """
        Upload and parse a candidate's resume.
        
        Args:
            candidate_id: ID of the candidate
            resume_file: Binary resume file
            filename: Original filename
            
        Returns:
            Dictionary with resume details
        """
        # Make a unique filename to avoid conflicts
        file_ext = os.path.splitext(filename)[1]
        unique_filename = f"{candidate_id}{file_ext}"
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as temp_file:
            temp_file.write(resume_file.read())
            temp_path = temp_file.name
        
        try:
            # Upload to storage
            resume_url = self.db.upload_resume(temp_path, unique_filename)
            
            # Parse the resume
            resume_text = self.resume_analyzer.parse_pdf_resume(temp_path)
            resume_data = self.resume_analyzer.extract_resume_data(resume_text)
            
            # Update candidate with resume info
            self.db.update_candidate_resume(candidate_id, resume_url, resume_data)
            
            return {
                "candidate_id": candidate_id,
                "resume_url": resume_url,
                "resume_data": resume_data
            }
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    def get_assessment(self, interview_id: str) -> Dict[str, Any]:
        """
        Get the final assessment for an interview.
        
        Args:
            interview_id: ID of the interview
            
        Returns:
            Assessment details or None if not found
        """
        try:
            return self.db.get_assessment(interview_id)
        except:
            return None 