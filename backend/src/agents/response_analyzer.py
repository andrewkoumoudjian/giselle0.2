import os
import uuid
from typing import Dict, Any, List, Set
import networkx as nx
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from langgraph.graph import StateGraph
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from ..utils.llm import LLMClient
from ..utils.constants import END, START

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
    """Agent responsible for analyzing candidate responses."""
    
    def __init__(self):
        """Initialize the response analyzer with a workflow graph."""
        self.workflow = self._build_analysis_graph()
        
    def analyze_response(self, question: Dict[str, Any], response_text: str) -> Dict[str, Any]:
        """
        Analyze a candidate's response to a question.
        
        Args:
            question: The question data including text and skill_assessed
            response_text: The transcribed text of the candidate's response
            
        Returns:
            A dictionary containing analysis results
        """
        use_mock = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
        
        if use_mock:
            # Return mock analysis data for testing
            return self._generate_mock_analysis(question, response_text)
        else:
            # Use the workflow to analyze the response
            context = {
                "question": question,
                "response_text": response_text,
                "results": {}
            }
            
            # Execute the workflow
            self._execute_workflow(context)
            
            return context["results"]
            
    def _execute_workflow(self, context: Dict[str, Any]) -> None:
        """
        Execute the analysis workflow.
        
        Args:
            context: The context containing input data and results
        """
        # Start from the START node
        current_node = START
        visited = set()
        
        while current_node != END and current_node not in visited:
            visited.add(current_node)
            
            # Execute the current node function
            if callable(current_node):
                current_node(context)
                
                # Find next node based on the workflow graph
                successors = list(self.workflow.successors(current_node))
                if successors:
                    current_node = successors[0]
                else:
                    # No successors, end the workflow
                    break
            else:
                # Not a callable node, end the workflow
                break
        
    def _build_analysis_graph(self) -> nx.DiGraph:
        """
        Build the workflow graph for response analysis.
        
        Returns:
            A directed graph representing the analysis workflow
        """
        workflow = nx.DiGraph()
        
        # Define analysis functions
        
        def extract_key_points(context):
            """Extract key points from the response"""
            question = context["question"]
            response = context["response_text"]
            
            # In a real implementation, this would use an LLM to extract key points
            context["results"]["key_points"] = [
                "Professional experience mentioned",
                "Technical knowledge demonstrated",
                "Communication skills evident"
            ]
        
        def assess_relevance(context):
            """Assess the relevance of the response to the question"""
            context["results"]["relevance_score"] = 0.85  # Out of 1.0
            context["results"]["relevance_feedback"] = "Response directly addresses the question with specific examples."
        
        def evaluate_communication(context):
            """Evaluate communication effectiveness"""
            context["results"]["communication"] = {
                "clarity": 0.9,  # Out of 1.0
                "conciseness": 0.8,  # Out of 1.0
                "organization": 0.85  # Out of 1.0
            }
        
        def assess_technical_depth(context):
            """Assess technical depth if applicable"""
            question = context["question"]
            
            if question.get("skill_assessed") == "technical_knowledge":
                context["results"]["technical_depth"] = {
                    "score": 0.75,  # Out of 1.0
                    "feedback": "Demonstrates good understanding of core concepts but could provide more specific examples."
                }
        
        def create_final_analysis(context):
            """Create the final analysis summary"""
            context["results"]["overall_score"] = 0.82  # Out of 1.0
            context["results"]["strengths"] = [
                "Clear communication",
                "Relevant examples provided",
                "Good technical knowledge"
            ]
            context["results"]["areas_for_improvement"] = [
                "Could provide more specific technical details",
                "Response could be more concise"
            ]
            context["results"]["analysis_id"] = str(uuid.uuid4())
        
        # Add nodes to the workflow
        workflow.add_node(START)
        workflow.add_node(extract_key_points)
        workflow.add_node(assess_relevance)
        workflow.add_node(evaluate_communication)
        workflow.add_node(assess_technical_depth)
        workflow.add_node(create_final_analysis)
        workflow.add_node(END)
        
        # Define the workflow edges
        workflow.add_edge(START, extract_key_points)
        workflow.add_edge(extract_key_points, assess_relevance)
        workflow.add_edge(assess_relevance, evaluate_communication)
        workflow.add_edge(evaluate_communication, assess_technical_depth)
        workflow.add_edge(assess_technical_depth, create_final_analysis)
        workflow.add_edge(create_final_analysis, END)
        
        return workflow
        
    def _generate_mock_analysis(self, question: Dict[str, Any], response_text: str) -> Dict[str, Any]:
        """
        Generate mock analysis data for testing.
        
        Args:
            question: The question data
            response_text: The response text
            
        Returns:
            A dictionary with mock analysis results
        """
        # Return a fixed mock response for testing
        return {
            "analysis_id": str(uuid.uuid4()),
            "relevance_score": 0.85,
            "key_points": [
                "Professional experience mentioned",
                "Technical knowledge demonstrated",
                "Communication skills evident"
            ],
            "technical_depth": {
                "score": 0.75,
                "feedback": "Demonstrates good understanding of core concepts."
            },
            "communication": {
                "clarity": 0.9,
                "conciseness": 0.8,
                "organization": 0.85
            },
            "overall_score": 0.82,
            "strengths": [
                "Clear communication",
                "Relevant examples provided",
                "Good technical knowledge"
            ],
            "areas_for_improvement": [
                "Could provide more specific technical details",
                "Response could be more concise"
            ]
        } 