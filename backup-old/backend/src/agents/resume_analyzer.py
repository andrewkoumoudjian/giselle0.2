import json
from typing import Dict, List, Any, Tuple
from langchain.document_loaders import PyPDFLoader
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import pandas as pd
import numpy as np

from ..utils.llm import LLMClient

class ResumeAnalyzer:
    """Analyzes resumes and creates job correlation matrices."""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self._setup_chains()
    
    def _setup_chains(self):
        """Setup LangChains for resume analysis."""
        # Chain for extracting structured data from resume
        extract_template = """
        You are a professional resume analyst. Extract the following information from the resume text:
        
        Resume Content:
        {resume_text}
        
        Extract and return ONLY a JSON object with the following structure:
        {
            "skills": ["skill1", "skill2", ...],
            "experience": [
                {"title": "Job Title", "company": "Company Name", "duration": "X years", "description": "Brief summary"}
            ],
            "education": [
                {"degree": "Degree Name", "institution": "Institution Name", "year": "Year"}
            ]
        }
        """
        
        extract_prompt = PromptTemplate(
            input_variables=["resume_text"],
            template=extract_template
        )
        
        self.extract_chain = LLMChain(
            llm=self.llm_client.get_resume_analyzer_llm(),
            prompt=extract_prompt
        )
        
        # Chain for identifying professional fields from job description
        fields_template = """
        You are an expert job analyzer. Based on the job description, identify the key professional fields that are relevant to this position.
        
        Job Description:
        {job_description}
        
        For each professional field you identify, assign an importance score from 0-100 that reflects how crucial this field is for success in the role.
        
        Return ONLY a JSON array of objects with this structure:
        [
            {"field": "field_name", "score": importance_score}
        ]
        
        Focus on specific professional domains and skills rather than general traits.
        Example fields: "Data Analysis", "Front-end Development", "Project Management", "Financial Modeling", etc.
        Identify 5-8 fields that best represent the core requirements of this job.
        """
        
        fields_prompt = PromptTemplate(
            input_variables=["job_description"],
            template=fields_template
        )
        
        self.fields_chain = LLMChain(
            llm=self.llm_client.get_llm(),
            prompt=fields_prompt
        )
        
        # Chain for scoring candidate against professional fields
        scoring_template = """
        You are an unbiased professional skills assessor.
        
        Resume Information:
        {resume_info}
        
        Job Fields Required:
        {job_fields}
        
        For each job field listed, assign a score from 0-100 indicating how well the candidate's skills and experience match that field.
        Base your scoring ONLY on concrete evidence from their resume, not assumptions about background.
        
        Return ONLY a JSON array of objects with this structure:
        [
            {"field": "field_name", "score": candidate_score, "evidence": "brief justification"}
        ]
        """
        
        scoring_prompt = PromptTemplate(
            input_variables=["resume_info", "job_fields"],
            template=scoring_template
        )
        
        self.scoring_chain = LLMChain(
            llm=self.llm_client.get_resume_analyzer_llm(),
            prompt=scoring_prompt
        )
    
    def extract_resume_data(self, resume_text: str) -> Dict[str, Any]:
        """
        Extract structured data from resume text.
        
        Args:
            resume_text: Plain text content of resume
            
        Returns:
            Dictionary with structured resume data
        """
        response = self.extract_chain.invoke({"resume_text": resume_text})
        
        # Parse the response
        try:
            if isinstance(response, dict) and "text" in response:
                # Extract JSON from text
                text = response["text"]
                if "```json" in text:
                    json_text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    json_text = text.split("```")[1].split("```")[0].strip()
                else:
                    json_text = text
                
                parsed_data = json.loads(json_text)
            else:
                # Directly get structured output if using structured LLM response
                parsed_data = json.loads(response)
                
            return parsed_data
        except Exception as e:
            print(f"Error parsing resume data: {e}")
            # Return minimal structure for fallback
            return {
                "skills": [],
                "experience": [],
                "education": []
            }
    
    def identify_job_fields(self, job_description: str) -> List[Dict[str, Any]]:
        """
        Identify key professional fields from job description.
        
        Args:
            job_description: Full job description text
            
        Returns:
            List of fields with importance scores
        """
        response = self.fields_chain.invoke({"job_description": job_description})
        
        # Parse the response
        try:
            if isinstance(response, dict) and "text" in response:
                # Extract JSON from text
                text = response["text"]
                if "```json" in text:
                    json_text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    json_text = text.split("```")[1].split("```")[0].strip()
                else:
                    json_text = text
                
                fields = json.loads(json_text)
            else:
                # Directly get structured output if using structured LLM response
                fields = json.loads(response)
                
            return fields
        except Exception as e:
            print(f"Error identifying job fields: {e}")
            # Return minimal fields for fallback
            return [
                {"field": "General Aptitude", "score": 100}
            ]
    
    def score_candidate(self, resume_data: Dict[str, Any], job_fields: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Score candidate against job fields.
        
        Args:
            resume_data: Structured resume data
            job_fields: List of job fields with importance scores
            
        Returns:
            List of fields with candidate scores
        """
        # Format the resume data for prompting
        resume_info = json.dumps(resume_data, indent=2)
        job_fields_info = json.dumps(job_fields, indent=2)
        
        response = self.scoring_chain.invoke({
            "resume_info": resume_info,
            "job_fields": job_fields_info
        })
        
        # Parse the response
        try:
            if isinstance(response, dict) and "text" in response:
                # Extract JSON from text
                text = response["text"]
                if "```json" in text:
                    json_text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    json_text = text.split("```")[1].split("```")[0].strip()
                else:
                    json_text = text
                
                scores = json.loads(json_text)
            else:
                # Directly get structured output if using structured LLM response
                scores = json.loads(response)
                
            return scores
        except Exception as e:
            print(f"Error scoring candidate: {e}")
            # Return minimal scores for fallback
            return [
                {"field": field["field"], "score": 50, "evidence": "Automatic fallback score"} 
                for field in job_fields
            ]
    
    def generate_correlation_matrix(self, job_fields: List[Dict[str, Any]], candidate_fields: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate a correlation matrix between job requirements and candidate skills.
        
        Args:
            job_fields: List of fields with importance scores
            candidate_fields: List of fields with candidate scores
            
        Returns:
            Dictionary with correlation score and visualization data
        """
        # Create dataframes
        job_df = pd.DataFrame(job_fields)
        
        # Ensure candidate fields match job fields exactly
        candidate_df = pd.DataFrame([
            {"field": cf["field"], "score": cf["score"], "evidence": cf.get("evidence", "")}
            for cf in candidate_fields
            if any(jf["field"] == cf["field"] for jf in job_fields)
        ])
        
        # If any job fields are missing from candidate scores, add with zero score
        for jf in job_fields:
            if not any(cf["field"] == jf["field"] for cf in candidate_fields):
                candidate_df = pd.concat([
                    candidate_df,
                    pd.DataFrame([{
                        "field": jf["field"], 
                        "score": 0, 
                        "evidence": "No matching evidence found"
                    }])
                ])
        
        # Merge dataframes on field name
        merged_df = pd.merge(job_df, candidate_df, on='field', suffixes=('_job', '_candidate'))
        
        # Calculate weighted match score (normalized by dividing by 100)
        merged_df['weighted_match'] = (merged_df['score_candidate'] / 100) * (merged_df['score_job'] / 100)
        
        # Calculate overall correlation score
        total_importance = sum(item["score"] for item in job_fields)
        if total_importance > 0:
            correlation_score = (merged_df['weighted_match'] * merged_df['score_job']).sum() / total_importance * 100
        else:
            correlation_score = 0
            
        # Create visualization dataset
        visualization_data = merged_df[['field', 'score_job', 'score_candidate', 'weighted_match', 'evidence']].to_dict('records')
        
        return {
            'correlation_score': round(correlation_score, 1),
            'visualization_data': visualization_data
        }
    
    def parse_pdf_resume(self, pdf_path: str) -> str:
        """
        Parse a PDF resume into plain text.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Plain text content of the resume
        """
        try:
            loader = PyPDFLoader(pdf_path)
            pages = loader.load()
            text = "\n".join(page.page_content for page in pages)
            return text
        except Exception as e:
            print(f"Error parsing PDF resume: {e}")
            return ""
    
    def analyze_resume_for_job(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Complete workflow to analyze a resume for a job.
        
        Args:
            resume_text: Plain text content of resume
            job_description: Job description text
            
        Returns:
            Dictionary with analysis results
        """
        # Extract structured data from resume
        resume_data = self.extract_resume_data(resume_text)
        
        # Identify job fields from description
        job_fields = self.identify_job_fields(job_description)
        
        # Score candidate against fields
        candidate_scores = self.score_candidate(resume_data, job_fields)
        
        # Generate correlation matrix
        correlation = self.generate_correlation_matrix(job_fields, candidate_scores)
        
        # Combine results
        return {
            "resume_data": resume_data,
            "job_fields": job_fields,
            "candidate_scores": candidate_scores,
            "correlation": correlation
        } 