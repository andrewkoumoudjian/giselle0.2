#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    if [ -f "venv/Scripts/activate" ]; then
        # Windows
        source venv/Scripts/activate
    else
        # Unix-like
        source venv/bin/activate
    fi
    echo "Activated virtual environment"
fi

# Set environment variables for real data
export USE_MOCK_DATA=false
export USE_SUPABASE=true

# Set Python path
export PYTHONPATH=.

# Run the server
echo "Starting backend server on http://localhost:8000"
python3 -m src.main 