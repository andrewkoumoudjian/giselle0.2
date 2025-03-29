#!/bin/bash

# Set Python path
export PYTHONPATH=.

# Run the minimal API
echo "Starting minimal API server..."
uvicorn src.api.minimal:app --host 0.0.0.0 --port 8000 --reload 