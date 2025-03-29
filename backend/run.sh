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

# Run the server
echo "Starting backend server on http://localhost:8000"
python3 -m src.main 