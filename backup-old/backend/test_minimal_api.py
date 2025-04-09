from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Minimal API Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a health check endpoint
@app.get("/health")
async def health_check():
    """Check if the API is running."""
    return {
        "status": "ok",
        "version": "0.1.0",
        "message": "Backend API is running"
    }

# Create a test endpoint
@app.get("/test")
async def test_endpoint():
    return {
        "message": "This is a test endpoint from the backend API"
    }

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.getenv("PORT", "8001"))
    
    # Run the server
    print(f"Starting minimal API server on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port) 