#!/bin/bash

echo "Starting basic API server..."
uvicorn basic_api:app --host 0.0.0.0 --port 8000 --reload 