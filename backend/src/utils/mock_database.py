import json
import uuid
import datetime
from typing import Dict, List, Any, Optional

class MockTableClient:
    def __init__(self, table_name, data_store):
        self.table_name = table_name
        self.data_store = data_store
        self.query_conditions = []
        self.order_by = None
        
        # Initialize default data for certain tables
        if table_name == 'companies' and 'companies' not in data_store:
            data_store['companies'] = [{
                "id": "default",
                "name": "Default Company",
                "created_at": "2023-01-01T00:00:00Z"
            }]
        
    def select(self, fields="*"):
        return self
    
    def insert(self, data):
        if isinstance(data, list):
            result = []
            for item in data:
                item_with_id = {"id": str(uuid.uuid4()), **item}
                if self.table_name not in self.data_store:
                    self.data_store[self.table_name] = []
                self.data_store[self.table_name].append(item_with_id)
                result.append(item_with_id)
            return MockExecuteResult(data=result)
        else:
            # If it's a company with id "default", return the existing one
            if self.table_name == 'companies' and data.get('name') == 'Default Company':
                for company in self.data_store.get('companies', []):
                    if company.get('id') == 'default':
                        return MockExecuteResult(data=[company])
            
            item_with_id = {"id": data.get('id', str(uuid.uuid4())), **data}
            item_with_id["created_at"] = datetime.datetime.now().isoformat()
            if self.table_name not in self.data_store:
                self.data_store[self.table_name] = []
            self.data_store[self.table_name].append(item_with_id)
            return MockExecuteResult(data=[item_with_id])
    
    def eq(self, field, value):
        self.query_conditions.append((field, value))
        return self
    
    def order(self, field):
        self.order_by = field
        return self
    
    def update(self, data):
        self._update_data = data
        return self
    
    def execute(self):
        if hasattr(self, '_update_data'):
            # This is an update operation
            results = []
            if self.table_name in self.data_store:
                for item in self.data_store[self.table_name]:
                    match = True
                    for field, value in self.query_conditions:
                        if field.startswith("question_id."):  # Handle nested fields
                            q_id = item.get("question_id")
                            # Find the question
                            for q in self.data_store.get('questions', []):
                                if q.get("id") == q_id:
                                    parent_field = field.split(".")[1]
                                    if q.get(parent_field) != value:
                                        match = False
                                    break
                        elif item.get(field) != value:
                            match = False
                    
                    if match:
                        # Update the item
                        for k, v in self._update_data.items():
                            if v == "now()":
                                item[k] = datetime.datetime.now().isoformat()  # Real timestamp
                            else:
                                item[k] = v
                        results.append(item)
            
            return MockExecuteResult(data=results)
        else:
            # This is a select operation
            results = []
            if self.table_name in self.data_store:
                for item in self.data_store[self.table_name]:
                    match = True
                    for field, value in self.query_conditions:
                        if field.startswith("question_id."):  # Handle nested fields
                            q_id = item.get("question_id")
                            # Find the question
                            for q in self.data_store.get('questions', []):
                                if q.get("id") == q_id:
                                    parent_field = field.split(".")[1]
                                    if q.get(parent_field) != value:
                                        match = False
                                    break
                        elif item.get(field) != value:
                            match = False
                    
                    if match:
                        results.append(item)
            
            if self.order_by and results:
                results.sort(key=lambda x: x.get(self.order_by, 0))
            
            return MockExecuteResult(data=results)

class MockStorageClient:
    def __init__(self, bucket_name, data_store):
        self.bucket_name = bucket_name
        self.data_store = data_store
    
    def upload(self, file_path, file_data):
        if "storage" not in self.data_store:
            self.data_store["storage"] = {}
        if self.bucket_name not in self.data_store["storage"]:
            self.data_store["storage"][self.bucket_name] = {}
        
        self.data_store["storage"][self.bucket_name][file_path] = True
        return True
    
    def get_public_url(self, file_path):
        return f"https://mock-storage.example.com/{self.bucket_name}/{file_path}"

class MockStorageBucketClient:
    def __init__(self, data_store):
        self.data_store = data_store
    
    def from_(self, bucket_name):
        return MockStorageClient(bucket_name, self.data_store)

class MockExecuteResult:
    """Mock result from database execute operation."""
    
    def __init__(self, data=None):
        self.data = data or []
    
    def execute(self):
        """Allow chaining of execute calls."""
        return self

class MockSupabaseClient:
    def __init__(self):
        """Initialize with empty in-memory tables."""
        self.data_store = {
            "companies": [],
            "job_descriptions": [],
            "candidates": [],
            "interviews": [],
            "questions": [],
            "responses": [],
            "assessments": []
        }
        self.storage = MockStorageBucketClient(self.data_store)
        self.use_mock = True
        print("Using MockSupabaseClient - mock implementation for testing")
    
    def table(self, table_name):
        return MockTableClient(table_name, self.data_store)
    
    # Company operations
    def create_company(self, name: str) -> Dict[str, Any]:
        """Create a new company."""
        result = self.table("companies").insert({
            "name": name
        }).execute()
        
        return result.data[0]
    
    def get_company(self, company_id: str) -> Dict[str, Any]:
        """Get a company by ID."""
        result = self.table("companies").select("*").eq("id", company_id).execute()
        
        if not result.data:
            raise ValueError(f"Company not found with ID: {company_id}")
            
        return result.data[0]
    
    # Job description operations
    def create_job_description(self, company_id: str, title: str, description: str, 
                             department: Optional[str] = None, 
                             required_skills: Optional[List[str]] = None,
                             soft_skills_priorities: Optional[Dict[str, int]] = None) -> Dict[str, Any]:
        """Create a new job description."""
        data = {
            "company_id": company_id,
            "title": title,
            "description": description,
            "department": department,
            "required_skills": required_skills,  # Already JSON in mock
            "soft_skills_priorities": soft_skills_priorities  # Already JSON in mock
        }
        
        result = self.table("job_descriptions").insert(data).execute()
        
        return result.data[0]
    
    def get_job_description(self, job_id: str) -> Dict[str, Any]:
        """Get a job description by ID."""
        result = self.table("job_descriptions").select("*").eq("id", job_id).execute()
        
        if not result.data:
            raise ValueError(f"Job description not found with ID: {job_id}")
            
        return result.data[0]
    
    # Candidate operations
    def create_candidate(self, name: str, email: str, resume_url: Optional[str] = None) -> Dict[str, Any]:
        """Create a new candidate."""
        data = {
            "name": name,
            "email": email,
            "resume_url": resume_url
        }
        
        result = self.table("candidates").insert(data).execute()
        
        return result.data[0]
    
    def get_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Get a candidate by ID."""
        result = self.table("candidates").select("*").eq("id", candidate_id).execute()
        
        if not result.data:
            raise ValueError(f"Candidate not found with ID: {candidate_id}")
            
        return result.data[0]
    
    def update_candidate_resume(self, candidate_id: str, resume_url: str, resume_parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Update a candidate's resume data."""
        data = {
            "resume_url": resume_url,
            "resume_parsed": resume_parsed  # Already JSON in mock
        }
        
        result = self.table("candidates").update(data).eq("id", candidate_id).execute()
        
        if not result.data:
            raise ValueError(f"Failed to update candidate resume for ID: {candidate_id}")
            
        return result.data[0]
    
    # Interview operations
    def create_interview(self, job_id: str, candidate_id: str) -> Dict[str, Any]:
        """Create a new interview."""
        data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "status": "pending"
        }
        
        result = self.table("interviews").insert(data).execute()
        
        return result.data[0]
    
    def get_interview(self, interview_id: str) -> Dict[str, Any]:
        """Get an interview by ID."""
        result = self.table("interviews").select("*").eq("id", interview_id).execute()
        
        if not result.data:
            raise ValueError(f"Interview not found with ID: {interview_id}")
            
        return result.data[0]
    
    def update_interview_status(self, interview_id: str, status: str) -> Dict[str, Any]:
        """Update the status of an interview."""
        data = {
            "status": status
        }
        
        if status == "completed":
            data["completed_at"] = "now()"
        
        result = self.table("interviews").update(data).eq("id", interview_id).execute()
        
        if not result.data:
            raise ValueError(f"Failed to update interview status for ID: {interview_id}")
            
        return result.data[0]
    
    # Question operations
    def create_questions(self, interview_id: str, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create questions for an interview."""
        insert_data = []
        for idx, question in enumerate(questions):
            insert_data.append({
                "interview_id": interview_id,
                "text": question.get("text", ""),
                "type": question.get("type", "technical"),
                "skill_assessed": question.get("skill_assessed", ""),
                "order_index": idx
            })
        
        result = self.table("questions").insert(insert_data).execute()
        
        return result.data
    
    def get_interview_questions(self, interview_id: str) -> List[Dict[str, Any]]:
        """Get all questions for an interview."""
        result = self.table("questions").select("*").eq("interview_id", interview_id).order("order_index").execute()
        
        return result.data
    
    # Response operations
    def create_response(self, question_id: str, transcription: str, audio_url: Optional[str] = None, analysis_results: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a response to a question."""
        data = {
            "question_id": question_id,
            "transcription": transcription,
            "audio_url": audio_url,
            "analysis_results": analysis_results  # Already JSON in mock
        }
        
        result = self.table("responses").insert(data).execute()
        
        return result.data[0]
    
    def get_response(self, response_id: str) -> Dict[str, Any]:
        """Get a response by ID."""
        result = self.table("responses").select("*").eq("id", response_id).execute()
        
        if not result.data:
            raise ValueError(f"Response not found with ID: {response_id}")
            
        return result.data[0]
    
    def update_response_analysis(self, response_id: str, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Update the analysis of a response."""
        data = {
            "analysis_results": analysis_results  # Already JSON in mock
        }
        
        result = self.table("responses").update(data).eq("id", response_id).execute()
        
        if not result.data:
            raise ValueError(f"Failed to update response analysis for ID: {response_id}")
            
        return result.data[0]
    
    # Assessment operations
    def create_assessment(self, interview_id: str, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an assessment for an interview."""
        data = {
            "interview_id": interview_id,
            "empathy_score": assessment_data.get("empathy_score"),
            "collaboration_score": assessment_data.get("collaboration_score"),
            "confidence_score": assessment_data.get("confidence_score"),
            "english_proficiency": assessment_data.get("english_proficiency"),
            "professionalism": assessment_data.get("professionalism"),
            "field_importance": assessment_data.get("field_importance", {}),  # Already JSON in mock
            "candidate_skills": assessment_data.get("candidate_skills", {}),  # Already JSON in mock
            "correlation_matrix": assessment_data.get("correlation_matrix", {})  # Already JSON in mock
        }
        
        result = self.table("assessments").insert(data).execute()
        
        return result.data[0]
    
    def get_assessment(self, interview_id: str) -> Dict[str, Any]:
        """Get an assessment by interview ID."""
        result = self.table("assessments").select("*").eq("interview_id", interview_id).execute()
        
        if not result.data:
            raise ValueError(f"Assessment not found for interview ID: {interview_id}")
            
        return result.data[0]
    
    # Storage operations
    def upload_resume(self, candidate_id: str, file_data: bytes, file_name: str) -> str:
        """Upload a resume file to storage and return the URL."""
        storage_path = f"{candidate_id}/{file_name}"
        
        self.storage.from_("resumes").upload(
            storage_path,
            file_data
        )
        
        url = self.storage.from_("resumes").get_public_url(storage_path)
        return url
    
    def upload_audio(self, interview_id: str, question_id: str, file_data: bytes) -> str:
        """Upload an audio file to storage and return the URL."""
        file_name = f"{interview_id}_{question_id}.webm"
        storage_path = f"{interview_id}/{file_name}"
        
        self.storage.from_("interview_audio").upload(
            storage_path,
            file_data
        )
        
        url = self.storage.from_("interview_audio").get_public_url(storage_path)
        return url

class MockDatabase:
    """Mock implementation of database operations."""
    
    def __init__(self):
        """Initialize with empty in-memory tables."""
        self.tables = {
            "companies": [],
            "jobs": [],
            "candidates": [],
            "interviews": [],
            "questions": [],
            "responses": []
        }
        print("Using mock database - USE_MOCK_DATA is set to true")
    
    def _generate_id(self):
        """Generate a UUID string."""
        return str(uuid.uuid4())
    
    def _now(self):
        """Get current timestamp as string."""
        return datetime.datetime.now().isoformat()
    
    def execute(self, query, params=None):
        """Mock execution of a SQL query."""
        # This is a simplified mock implementation that just returns data based on table name
        # For a real implementation, this would parse the SQL and simulate the database behavior
        
        # Extract table name from query (very basic parsing)
        if "companies" in query:
            table = "companies"
        elif "jobs" in query:
            table = "jobs"
        elif "candidates" in query:
            table = "candidates"
        elif "interviews" in query:
            table = "interviews"
        elif "questions" in query:
            table = "questions"
        elif "responses" in query:
            table = "responses"
        else:
            return []
        
        # Handle SELECT queries (basic implementation)
        if query.lower().startswith("select"):
            if "where id =" in query.lower() and params and 'id' in params:
                # Filter by ID
                filtered = [item for item in self.tables[table] if item['id'] == params['id']]
                return filtered
            elif "where interview_id =" in query.lower() and params and 'interview_id' in params:
                # Filter by interview_id
                filtered = [item for item in self.tables[table] if item['interview_id'] == params['interview_id']]
                # Handle ORDER BY order_index
                if "order by order_index" in query.lower():
                    filtered.sort(key=lambda x: x.get('order_index', 0))
                return filtered
            else:
                return self.tables[table]
        
        # Handle INSERT queries (basic implementation)
        elif query.lower().startswith("insert"):
            if params:
                # Create a new record with provided params
                record = params.copy()
                if 'id' not in record:
                    record['id'] = self._generate_id()
                if 'created_at' not in record:
                    record['created_at'] = self._now()
                self.tables[table].append(record)
                return [record]
            
        # Handle UPDATE queries (basic implementation)
        elif query.lower().startswith("update"):
            if params and 'id' in params:
                for i, item in enumerate(self.tables[table]):
                    if item['id'] == params['id']:
                        # Update the item
                        self.tables[table][i].update({k: v for k, v in params.items() if k != 'id'})
                        return [self.tables[table][i]]
        
        return []
    
    def execute_one(self, query, params=None):
        """Execute a query and return a single result."""
        results = self.execute(query, params)
        return results[0] if results else None
    
    # Company operations
    def create_company(self, name):
        """Create a new company."""
        company_id = self._generate_id()
        company = {
            'id': company_id,
            'name': name,
            'created_at': self._now()
        }
        self.tables['companies'].append(company)
        return company
    
    def get_company(self, company_id):
        """Get a company by ID."""
        for company in self.tables['companies']:
            if company['id'] == company_id:
                return company
        return None
    
    # Job operations
    def create_job(self, company_id, title, description, department=None, required_skills=None):
        """Create a new job posting."""
        job_id = self._generate_id()
        job = {
            'id': job_id,
            'company_id': company_id,
            'title': title,
            'description': description,
            'department': department,
            'required_skills': required_skills if required_skills else [],
            'created_at': self._now()
        }
        self.tables['jobs'].append(job)
        return job
    
    def get_job(self, job_id):
        """Get a job by ID."""
        for job in self.tables['jobs']:
            if job['id'] == job_id:
                return job
        return None
    
    # Candidate operations
    def create_candidate(self, name, email, resume_path=None):
        """Create a new candidate."""
        candidate_id = self._generate_id()
        candidate = {
            'id': candidate_id,
            'name': name,
            'email': email,
            'resume_path': resume_path,
            'created_at': self._now()
        }
        self.tables['candidates'].append(candidate)
        return candidate
    
    def get_candidate(self, candidate_id):
        """Get a candidate by ID."""
        for candidate in self.tables['candidates']:
            if candidate['id'] == candidate_id:
                return candidate
        return None
    
    # Interview operations
    def create_interview(self, job_id, candidate_id):
        """Create a new interview."""
        interview_id = self._generate_id()
        interview = {
            'id': interview_id,
            'job_id': job_id,
            'candidate_id': candidate_id,
            'status': 'pending',
            'created_at': self._now()
        }
        self.tables['interviews'].append(interview)
        return interview
    
    def get_interview(self, interview_id):
        """Get an interview by ID."""
        for interview in self.tables['interviews']:
            if interview['id'] == interview_id:
                return interview
        return None
    
    def update_interview_status(self, interview_id, status):
        """Update the status of an interview."""
        for interview in self.tables['interviews']:
            if interview['id'] == interview_id:
                interview['status'] = status
                if status == 'completed':
                    interview['completed_at'] = self._now()
                return interview
        return None
    
    # Question operations
    def create_questions(self, interview_id, questions):
        """Create questions for an interview."""
        created_questions = []
        for idx, question in enumerate(questions):
            question_id = self._generate_id()
            q = {
                'id': question_id,
                'interview_id': interview_id,
                'text': question['text'],
                'type': question.get('type', 'standard'),
                'skill_assessed': question.get('skill_assessed'),
                'order_index': idx,
                'created_at': self._now()
            }
            self.tables['questions'].append(q)
            created_questions.append(q)
        return created_questions
    
    def get_interview_questions(self, interview_id):
        """Get all questions for an interview."""
        questions = [q for q in self.tables['questions'] if q['interview_id'] == interview_id]
        questions.sort(key=lambda x: x.get('order_index', 0))
        return questions
    
    # Response operations
    def create_response(self, question_id, response_text, audio_path=None, analysis=None):
        """Create a response to a question."""
        response_id = self._generate_id()
        response = {
            'id': response_id,
            'question_id': question_id,
            'response_text': response_text,
            'audio_path': audio_path,
            'analysis': json.dumps(analysis) if analysis else None,
            'created_at': self._now()
        }
        self.tables['responses'].append(response)
        return response
    
    def get_response(self, response_id):
        """Get a response by ID."""
        for response in self.tables['responses']:
            if response['id'] == response_id:
                return response
        return None
    
    def update_response_analysis(self, response_id, analysis):
        """Update the analysis of a response."""
        for response in self.tables['responses']:
            if response['id'] == response_id:
                response['analysis'] = json.dumps(analysis)
                return response
        return None 