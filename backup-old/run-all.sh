#!/bin/bash

# Start backend server in the background
echo "Starting backend server..."
cd backend && ./run.sh &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend server
echo "Starting frontend server..."
cd frontend && npm run dev

# When frontend exits, kill the backend server
kill $BACKEND_PID 