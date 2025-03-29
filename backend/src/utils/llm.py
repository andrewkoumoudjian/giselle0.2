import os
import json
from typing import Dict, List, Any, Optional
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class LLMClient:
    """Client for LLM operations using OpenRouter."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LLMClient, cls).__new__(cls)
            
            # Check if we're using mock data
            use_mock = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
            
            # Get OpenAI API key
            openai_api_key = os.getenv("OPENAI_API_KEY")
            
            if not use_mock and openai_api_key:
                print("Using real OpenAI API for LLM operations...")
                cls._instance.client = OpenAI(api_key=openai_api_key)
                cls._instance.use_mock = False
            else:
                print("WARNING: Using mock LLM - set USE_MOCK_DATA=false and provide OPENAI_API_KEY to use real LLM")
                cls._instance.client = None
                cls._instance.use_mock = True
                
        return cls._instance
    
    def get_llm(self, model_name: Optional[str] = None):
        """
        Get an LLM instance from OpenRouter.
        
        Args:
            model_name: Specific model to use. Defaults to DEFAULT_MODEL from env.
        
        Returns:
            ChatOpenAI instance configured for the requested model
        """
        if not model_name:
            model_name = os.getenv("DEFAULT_MODEL", "anthropic/claude-3-sonnet")
            
        return ChatOpenAI(
            openai_api_base="https://openrouter.ai/api/v1",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            model=model_name,
            temperature=0.2  # Lower temperature for more consistent, deterministic outputs
        )
    
    def get_question_generator_llm(self):
        """Get LLM instance optimized for generating interview questions."""
        return self.get_llm(os.getenv("TECHNICAL_ANALYSIS_MODEL", "anthropic/claude-3-opus"))
    
    def get_resume_analyzer_llm(self):
        """Get LLM instance optimized for resume analysis."""
        return self.get_llm(os.getenv("RESUME_ANALYSIS_MODEL", "google/gemini-1.5-pro"))
    
    def simple_prompt(self, 
                    system_prompt: str, 
                    user_prompt: str, 
                    model_name: Optional[str] = None) -> str:
        """
        Send a simple prompt to the LLM and get a response.
        
        Args:
            system_prompt: Instructions for the LLM
            user_prompt: User's specific query
            model_name: Optional specific model to use
            
        Returns:
            String response from the LLM
        """
        llm = self.get_llm(model_name)
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = llm.invoke(messages)
        return response.content
    
    def structured_prompt(self, 
                        system_prompt: str, 
                        user_prompt: str, 
                        model_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Send a prompt to the LLM and parse the response as JSON.
        
        Args:
            system_prompt: Instructions for the LLM
            user_prompt: User's specific query
            model_name: Optional specific model to use
            
        Returns:
            Dictionary parsed from JSON response
        """
        system_prompt_with_json_instruction = f"{system_prompt}\n\nYou MUST respond with valid JSON only, no other text."
        response_text = self.simple_prompt(system_prompt_with_json_instruction, user_prompt, model_name)
        
        # Clean the response in case there are markdown code blocks
        cleaned_response = response_text
        if "```json" in response_text:
            cleaned_response = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            cleaned_response = response_text.split("```")[1].split("```")[0].strip()
            
        try:
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            # Fallback: Try to extract only the JSON part if there's other text
            import re
            json_pattern = r'\{(?:[^{}]|(?:\{[^{}]*\}))*\}'
            match = re.search(json_pattern, cleaned_response)
            if match:
                return json.loads(match.group(0))
            else:
                raise ValueError(f"Could not parse JSON from response: {response_text}")
                
    def analyze_text_with_score(self, 
                              text: str, 
                              criteria: str, 
                              scale: str = "0-20",
                              model_name: Optional[str] = None) -> int:
        """
        Analyze text and return a numerical score based on given criteria.
        
        Args:
            text: Text to analyze
            criteria: What to evaluate in the text
            scale: The scoring scale (default "0-20")
            model_name: Optional specific model to use
            
        Returns:
            Integer score
        """
        system_prompt = f"""
        You are an expert communication analyst. Analyze the text for {criteria}.
        Score on a scale of {scale} based ONLY on concrete evidence in the text.
        Provide ONLY a numerical score as your answer, with no explanation or other text.
        """
        
        response = self.simple_prompt(system_prompt, text, model_name)
        
        # Extract just the number from the response
        import re
        score_match = re.search(r'\d+', response)
        if score_match:
            return int(score_match.group(0))
        else:
            raise ValueError(f"Could not extract numerical score from response: {response}")
    
    def generate_text(self, 
                     prompt: str, 
                     system_prompt: str = "You are a helpful AI assistant.",
                     temperature: float = 0.7,
                     max_tokens: int = 500) -> str:
        """
        Generate text using the LLM.
        
        Args:
            prompt: The prompt to send to the model
            system_prompt: The system prompt (role setting)
            temperature: Controls randomness (0-1)
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            Generated text as a string
        """
        if self.use_mock:
            # Return mock data based on the prompt
            if "interview questions" in prompt.lower():
                return json.dumps([
                    {"question": "Tell me about your experience with frontend development.", "type": "experience", "skill_assessed": "technical_knowledge"},
                    {"question": "How do you handle difficult team dynamics?", "type": "behavioral", "skill_assessed": "collaboration"},
                    {"question": "Describe a challenging project you worked on.", "type": "behavioral", "skill_assessed": "problem_solving"},
                    {"question": "How do you stay updated with the latest technologies?", "type": "behavioral", "skill_assessed": "learning"},
                    {"question": "What's your approach to responsive design?", "type": "technical", "skill_assessed": "frontend_skills"}
                ])
            elif "analyze response" in prompt.lower():
                return json.dumps({
                    "relevance_score": 8,
                    "content_score": 7,
                    "communication_score": 9,
                    "scores": {
                        "empathy": 8,
                        "collaboration": 9,
                        "confidence": 7,
                        "english_proficiency": 8,
                        "professionalism": 9
                    },
                    "feedback": "Good response that demonstrates strong communication skills. Consider providing more specific examples."
                })
            elif "extract skills" in prompt.lower() or "resume" in prompt.lower():
                return json.dumps({
                    "skills": ["JavaScript", "React", "CSS", "HTML", "Node.js"],
                    "experience": [
                        {"role": "Senior Frontend Developer", "company": "Tech Co", "duration": "3 years"},
                        {"role": "Frontend Developer", "company": "Web Solutions", "duration": "2 years"}
                    ],
                    "education": [
                        {"degree": "BSc Computer Science", "institution": "University Tech", "year": 2018}
                    ]
                })
            else:
                return "I don't have specific mock data for this prompt type."
        else:
            # Use real OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Can be configured from env var later
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
    
    def classify_text(self, text: str, categories: List[str]) -> str:
        """
        Classify text into one of the given categories.
        
        Args:
            text: The text to classify
            categories: List of possible categories
            
        Returns:
            The selected category
        """
        if self.use_mock:
            # Simple mock classification
            if len(categories) > 0:
                return categories[0]  # Just return the first category for mock
            else:
                return "unknown"
        else:
            # Use real OpenAI API
            prompt = f"Classify the following text into exactly one of these categories: {', '.join(categories)}.\n\nText: {text}\n\nCategory:"
            response = self.generate_text(prompt, "You are a classification assistant. Respond with only the category name.", 0.1, 20)
            
            # Check if the response matches any of the categories
            for category in categories:
                if category.lower() in response.lower():
                    return category
                    
            # If no match, return the first category as a fallback
            return categories[0] if categories else "unknown" 