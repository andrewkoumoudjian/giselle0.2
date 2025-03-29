import os
from typing import Dict, Any, List
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from langgraph.graph import StateGraph
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from ..utils.llm import LLMClient

load_dotenv()

class AnalysisState(BaseModel):
    """Represents the state of the response analysis process."""
    
    interview_id: str = Field(description="ID of the interview being analyzed")
    question_id: str = Field(description="ID of the question being answered")
    question_text: str = Field(description="Text of the question")
    question_type: str = Field(description="Type of the question (technical/behavioral)")
    skill_assessed: str = Field(description="Skill being assessed by the question")
    transcription: str = Field(description="Transcribed text of the response")
    speech_metadata: Dict[str, Any] = Field(description="Metadata about speech patterns")
    
    empathy_score: int = Field(default=None, description="Score for empathy (0-20)")
    collaboration_score: int = Field(default=None, description="Score for collaboration (0-20)")
    confidence_score: int = Field(default=None, description="Score for confidence (0-20)")
    english_proficiency: int = Field(default=None, description="Score for English proficiency (0-20)")
    professionalism: int = Field(default=None, description="Score for professionalism (0-20)")
    relevance_score: int = Field(default=None, description="Score for answer relevance (0-20)")
    
    technical_accuracy: int = Field(default=None, description="Score for technical accuracy (0-20), only for technical questions")
    completeness: int = Field(default=None, description="Score for answer completeness (0-20)")
    
    final_analysis: Dict[str, Any] = Field(default=None, description="Final analysis results")

class ResponseAnalyzer:
    """Analyzes interview responses using a LangGraph workflow."""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.workflow = self._build_analysis_graph()
    
    def _build_analysis_graph(self) -> StateGraph:
        """Build the LangGraph for response analysis."""
        # Define nodes
        def analyze_empathy(state: AnalysisState) -> AnalysisState:
            """Analyze empathy in the response."""
            # Only analyze for behavioral questions or when specifically about teamwork/collaboration
            if state.question_type == "behavioral" or "team" in state.skill_assessed.lower() or "collaboration" in state.skill_assessed.lower():
                system_prompt = """
                You are an expert in detecting empathy in communication. 
                Analyze the text for signs of empathy such as:
                - Acknowledgment of others' feelings
                - Perspective-taking ability
                - Compassionate language
                - Awareness of others' needs
                
                Score from 0-20 based ONLY on concrete evidence in the text.
                """
                
                user_prompt = f"""
                Question: {state.question_text}
                Skill being assessed: {state.skill_assessed}
                
                Response to analyze: {state.transcription}
                
                Provide ONLY a numerical score from 0-20 for empathy.
                """
                
                state.empathy_score = self.llm_client.analyze_text_with_score(
                    state.transcription, 
                    "empathy",
                    "0-20"
                )
            else:
                # For technical questions, set a neutral score
                state.empathy_score = 10
                
            return state
        
        def analyze_collaboration(state: AnalysisState) -> AnalysisState:
            """Analyze collaboration skills in the response."""
            if state.question_type == "behavioral" or "team" in state.skill_assessed.lower():
                system_prompt = """
                You are an expert in detecting collaboration skills in communication.
                Analyze the text for signs of effective collaboration such as:
                - Team-oriented language
                - Credit sharing
                - Describing healthy team dynamics
                - Conflict resolution approaches
                
                Score from 0-20 based ONLY on concrete evidence in the text.
                """
                
                user_prompt = f"""
                Question: {state.question_text}
                Skill being assessed: {state.skill_assessed}
                
                Response to analyze: {state.transcription}
                
                Provide ONLY a numerical score from 0-20 for collaboration skills.
                """
                
                state.collaboration_score = self.llm_client.analyze_text_with_score(
                    state.transcription, 
                    "collaboration skills",
                    "0-20"
                )
            else:
                # For technical questions, set a neutral score
                state.collaboration_score = 10
                
            return state
            
        def analyze_confidence(state: AnalysisState) -> AnalysisState:
            """Analyze confidence in the response."""
            # Analyze speech patterns for confidence indicators
            speech_patterns = state.speech_metadata
            
            # Factors that might indicate confidence:
            # - Fewer filler words
            # - Appropriate speech rate
            # - Strategic pausing
            
            filler_words = speech_patterns.get("filler_words", {}).get("per_100_words", 0)
            speech_rate = speech_patterns.get("speech_rate", {}).get("assessment", "moderate")
            pause_frequency = speech_patterns.get("pauses", {}).get("frequency_per_100_words", 0)
            
            # Calculate base confidence score from speech patterns
            base_confidence = 10  # Start with neutral score
            
            # Adjust for filler words (fewer is better)
            if filler_words < 3:
                base_confidence += 3
            elif filler_words > 7:
                base_confidence -= 3
                
            # Adjust for speech rate (moderate is ideal)
            if speech_rate == "moderate":
                base_confidence += 2
            elif speech_rate == "slow":
                base_confidence -= 1
                
            # Adjust for strategic pausing (some pauses are good)
            if 1 <= pause_frequency <= 4:
                base_confidence += 2
            elif pause_frequency > 8:
                base_confidence -= 2
                
            # Now use LLM to analyze the content for confidence
            system_prompt = """
            You are an expert in detecting confidence in communication.
            Analyze the text for signs of confidence such as:
            - Decisive language
            - Clear statements
            - Substantive examples
            - Ownership of achievements and failures
            
            Score from 0-20 based ONLY on concrete evidence in the text.
            """
            
            content_confidence = self.llm_client.analyze_text_with_score(
                state.transcription, 
                "confidence",
                "0-20"
            )
            
            # Combine speech pattern and content analysis
            # 40% speech patterns, 60% content
            state.confidence_score = int(0.4 * base_confidence + 0.6 * content_confidence)
            
            # Ensure score is within bounds
            state.confidence_score = max(0, min(20, state.confidence_score))
            
            return state
            
        def analyze_english_proficiency(state: AnalysisState) -> AnalysisState:
            """Analyze English proficiency in the response."""
            system_prompt = """
            You are an expert in assessing English language proficiency.
            Analyze the text for:
            - Grammar and syntax
            - Vocabulary usage
            - Sentence structure
            - Clarity of expression
            
            Important: Focus ONLY on language proficiency, not content knowledge.
            Avoid cultural bias - different accents or dialect features should NOT lower the score.
            
            Score from 0-20 based ONLY on functional English communication ability.
            """
            
            state.english_proficiency = self.llm_client.analyze_text_with_score(
                state.transcription, 
                "English language proficiency while avoiding cultural or accent bias",
                "0-20"
            )
            
            return state
            
        def analyze_professionalism(state: AnalysisState) -> AnalysisState:
            """Analyze professionalism in the response."""
            system_prompt = """
            You are an expert in assessing professional communication.
            Analyze the text for:
            - Appropriate tone for a professional setting
            - Clear and organized thoughts
            - Relevance to the question
            - Appropriate level of detail
            
            Score from 0-20 based ONLY on concrete evidence in the text.
            """
            
            state.professionalism = self.llm_client.analyze_text_with_score(
                state.transcription, 
                "professional communication",
                "0-20"
            )
            
            return state
            
        def analyze_technical_content(state: AnalysisState) -> AnalysisState:
            """Analyze technical content in the response."""
            # Only analyze technical accuracy for technical questions
            if state.question_type == "technical":
                system_prompt = """
                You are an expert in assessing technical knowledge.
                Analyze the response for:
                - Accuracy of technical concepts
                - Depth of understanding
                - Appropriate use of terminology
                - Problem-solving approach
                
                Score from 0-20 based ONLY on the technical merit of the response.
                """
                
                user_prompt = f"""
                Technical Question: {state.question_text}
                Skill being assessed: {state.skill_assessed}
                
                Response to analyze: {state.transcription}
                
                Provide ONLY a numerical score from 0-20 for technical accuracy.
                """
                
                state.technical_accuracy = self.llm_client.analyze_text_with_score(
                    state.transcription, 
                    f"technical accuracy regarding {state.skill_assessed}",
                    "0-20"
                )
                
                # Also score completeness
                state.completeness = self.llm_client.analyze_text_with_score(
                    state.transcription, 
                    "completeness and thoroughness of the answer",
                    "0-20"
                )
            else:
                # For behavioral questions, set null values
                state.technical_accuracy = None
                
                # Still score completeness for behavioral questions
                state.completeness = self.llm_client.analyze_text_with_score(
                    state.transcription, 
                    "completeness and thoroughness of the answer",
                    "0-20"
                )
                
            return state
            
        def analyze_relevance(state: AnalysisState) -> AnalysisState:
            """Analyze the relevance of the response to the question."""
            system_prompt = """
            You are an expert in assessing how well responses answer questions.
            Analyze how directly and completely the response addresses the question asked.
            
            Score from 0-20 based on:
            - Direct addressing of the question
            - Inclusion of all necessary elements
            - Staying on topic
            - Providing appropriate examples
            """
            
            user_prompt = f"""
            Question: {state.question_text}
            
            Response: {state.transcription}
            
            Provide ONLY a numerical score from 0-20 for relevance to the question.
            """
            
            state.relevance_score = self.llm_client.analyze_text_with_score(
                state.transcription, 
                f"relevance to the question: '{state.question_text}'",
                "0-20"
            )
            
            return state
            
        def create_final_analysis(state: AnalysisState) -> AnalysisState:
            """Compile the final analysis from all the individual scores."""
            analysis = {
                "interview_id": state.interview_id,
                "question_id": state.question_id,
                "scores": {
                    "empathy": state.empathy_score,
                    "collaboration": state.collaboration_score,
                    "confidence": state.confidence_score,
                    "english_proficiency": state.english_proficiency,
                    "professionalism": state.professionalism,
                    "relevance": state.relevance_score,
                    "completeness": state.completeness
                },
                "speech_patterns": state.speech_metadata
            }
            
            # Add technical accuracy for technical questions
            if state.question_type == "technical" and state.technical_accuracy is not None:
                analysis["scores"]["technical_accuracy"] = state.technical_accuracy
                
            state.final_analysis = analysis
            return state
        
        # Create the graph
        workflow = StateGraph(AnalysisState)
        
        # Add nodes
        workflow.add_node("analyze_empathy", analyze_empathy)
        workflow.add_node("analyze_collaboration", analyze_collaboration)
        workflow.add_node("analyze_confidence", analyze_confidence)
        workflow.add_node("analyze_english_proficiency", analyze_english_proficiency)
        workflow.add_node("analyze_professionalism", analyze_professionalism)
        workflow.add_node("analyze_technical_content", analyze_technical_content)
        workflow.add_node("analyze_relevance", analyze_relevance)
        workflow.add_node("create_final_analysis", create_final_analysis)
        
        # Define edges - these can be processed in parallel
        workflow.add_edge("analyze_empathy", "analyze_collaboration")
        workflow.add_edge("analyze_collaboration", "analyze_confidence")
        workflow.add_edge("analyze_confidence", "analyze_english_proficiency")
        workflow.add_edge("analyze_english_proficiency", "analyze_professionalism")
        workflow.add_edge("analyze_professionalism", "analyze_technical_content")
        workflow.add_edge("analyze_technical_content", "analyze_relevance")
        workflow.add_edge("analyze_relevance", "create_final_analysis")
        
        # Set entry point
        workflow.set_entry_point("analyze_empathy")
        
        # Fix the dead-end node issue by adding an edge from create_final_analysis to the final state
        workflow.add_edge(create_final_analysis, END)
        
        # Compile the graph
        return workflow.compile()
    
    def analyze_response(self, 
                        interview_id: str,
                        question_id: str, 
                        question_text: str,
                        question_type: str,
                        skill_assessed: str,
                        transcription: str,
                        speech_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze an interview response.
        
        Args:
            interview_id: ID of the interview
            question_id: ID of the question
            question_text: Text of the question
            question_type: Type of question (technical/behavioral)
            skill_assessed: Skill being assessed
            transcription: Transcribed text of the response
            speech_metadata: Metadata about speech patterns
            
        Returns:
            Dictionary with analysis results
        """
        # Initialize state
        initial_state = AnalysisState(
            interview_id=interview_id,
            question_id=question_id,
            question_text=question_text,
            question_type=question_type,
            skill_assessed=skill_assessed,
            transcription=transcription,
            speech_metadata=speech_metadata
        )
        
        # Run the workflow
        final_state = self.workflow.invoke(initial_state)
        
        # Return the final analysis
        return final_state.final_analysis 