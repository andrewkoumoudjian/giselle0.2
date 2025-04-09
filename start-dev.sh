#!/bin/bash

# Start the backend server in the background
echo "Starting the backend server..."
node server.js &
BACKEND_PID=$!

# Wait for the backend server to start
echo "Waiting for backend server to start..."
sleep 3

# Start the frontend server
echo "Starting the frontend server..."
cd frontend && npm run dev

# When the frontend server is stopped, also stop the backend server
echo "Stopping the backend server..."
kill $BACKEND_PID

echo "Development servers stopped!"
