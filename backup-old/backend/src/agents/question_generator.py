import json
from typing import List, Dict, Any
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from ..utils.llm import LLMClient

class QuestionGeneratorAgent:
    """Agent for generating unbiased interview questions based on job descriptions."""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self._setup_chain()
    
    def _setup_chain(self):
        """Setup the LangChain for question generation."""
        prompt_template = """
        You are an unbiased hiring expert creating interview questions.
        
        Job Description:
        {job_description}
        
        Required Skills:
        {required_skills}
        
        Generate 5 questions that will help evaluate if a candidate is suitable for this position.
        The questions should:
        1. Focus solely on job-relevant skills and experience
        2. Avoid cultural references that may favor certain backgrounds
        3. Use clear, straightforward language
        4. Be answerable in 2-3 minutes each
        5. Include a mix of technical and behavioral questions
        6. Evaluate the candidate's ability to perform the specific job functions
        7. Avoid assumptions about educational background or specific career paths
        8. Focus on problem-solving abilities and adaptability
        
        For each question, specify:
        - The question text
        - Whether it's technical or behavioral
        - What specific skill or trait it assesses
        
        Return the questions in JSON format with this structure:
        [
          {{"question": "question text", "type": "technical|behavioral", "skill_assessed": "skill name"}}
        ]
        """
        
        prompt = PromptTemplate(
            input_variables=["job_description", "required_skills"],
            template=prompt_template
        )
        
        self.generation_chain = LLMChain(
            llm=self.llm_client.get_question_generator_llm(),
            prompt=prompt
        )
    
    def generate_questions(self, job_description: str, required_skills: List[str] = None) -> List[Dict[str, str]]:
        """
        Generate interview questions based on job description.
        
        Args:
            job_description: Full job description text
            required_skills: List of required skills (optional)
            
        Returns:
            List of question dictionaries with question text, type, and skill assessed
        """
        # Format required skills for prompt
        skills_text = ", ".join(required_skills) if required_skills else "Not specified"
        
        # Run the chain
        response = self.generation_chain.invoke({
            "job_description": job_description,
            "required_skills": skills_text
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
                
                questions = json.loads(json_text)
            else:
                # Directly get structured output if using structured LLM response
                questions = json.loads(response)
                
            # Validate and clean questions
            return self._validate_questions(questions)
        except Exception as e:
            # Fallback for error cases
            return self._fallback_questions(job_description, required_skills, str(e))
    
    def _validate_questions(self, questions: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Validate and ensure questions meet the format requirements."""
        valid_questions = []
        
        for q in questions:
            if not isinstance(q, dict):
                continue
                
            question = {
                "question": q.get("question", ""),
                "type": q.get("type", "behavioral"),
                "skill_assessed": q.get("skill_assessed", "general aptitude")
            }
            
            # Ensure question text exists and is not empty
            if question["question"] and len(question["question"].strip()) > 0:
                # Ensure type is valid
                if question["type"] not in ["technical", "behavioral"]:
                    question["type"] = "behavioral"
                
                valid_questions.append(question)
        
        # Ensure we have at least one question
        if not valid_questions:
            valid_questions = [
                {
                    "question": "Can you describe a challenging project you worked on and how you approached it?",
                    "type": "behavioral",
                    "skill_assessed": "problem-solving"
                }
            ]
        
        # Limit to 5 questions maximum
        return valid_questions[:5]
    
    def _fallback_questions(self, job_description: str, required_skills: List[str], error: str) -> List[Dict[str, str]]:
        """Generate fallback questions if the main generation fails."""
        print(f"Question generation failed: {error}. Using fallback questions.")
        
        return [
            {
                "question": "Can you describe a project you worked on that demonstrates your technical skills relevant to this position?",
                "type": "technical",
                "skill_assessed": "technical expertise"
            },
            {
                "question": "Tell me about a time when you had to solve a complex problem. What was your approach?",
                "type": "behavioral",
                "skill_assessed": "problem-solving"
            },
            {
                "question": "How do you approach learning new technologies or methodologies?",
                "type": "behavioral",
                "skill_assessed": "adaptability"
            },
            {
                "question": "Describe your experience working in a team environment. How do you handle disagreements?",
                "type": "behavioral",
                "skill_assessed": "teamwork"
            },
            {
                "question": "What motivates you professionally, and how does this position align with your goals?",
                "type": "behavioral",
                "skill_assessed": "motivation"
            }
        ] 