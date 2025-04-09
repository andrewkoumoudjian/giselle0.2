import os
import uvicorn
from dotenv import load_dotenv

# Fix the import to use the correct module path
from src.api.app import app

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get server configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENV", "development").lower() == "development"
    
    # Run the server
    uvicorn.run(
        "src.api.app:app",
        host=host,
        port=port,
        reload=reload
    ) 