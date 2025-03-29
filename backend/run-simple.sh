#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    echo "Activated virtual environment"
fi

# Set the PYTHONPATH to include the current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Run the server with the simple API
echo "Starting simplified backend server on http://localhost:8000"
uvicorn src.api.simple:app --host 0.0.0.0 --port 8000 