import json
import uuid
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
                                item[k] = "2023-01-01T00:00:00Z"  # Mock timestamp
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
    
    def upload(self, file_name, file_data):
        if "storage" not in self.data_store:
            self.data_store["storage"] = {}
        if self.bucket_name not in self.data_store["storage"]:
            self.data_store["storage"][self.bucket_name] = {}
        
        self.data_store["storage"][self.bucket_name][file_name] = True
        return True
    
    def get_public_url(self, file_name):
        return f"https://mock-storage.example.com/{self.bucket_name}/{file_name}"

class MockStorageBucketClient:
    def __init__(self, data_store):
        self.data_store = data_store
    
    def from_(self, bucket_name):
        return MockStorageClient(bucket_name, self.data_store)

class MockExecuteResult:
    def __init__(self, data=None):
        self.data = data or []
    
    def execute(self):
        # Allow chaining of execute() calls
        return self

class MockSupabaseClient:
    def __init__(self):
        self.data_store = {}
        self.storage = MockStorageBucketClient(self.data_store)
    
    def table(self, table_name):
        return MockTableClient(table_name, self.data_store) 