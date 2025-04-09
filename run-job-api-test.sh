#!/bin/bash

# Start the server in the background
echo "Starting the API server..."
node server.js &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 3

# Run the job API test
echo "Running job API test..."
node test-job-api.js

# Kill the server
echo "Stopping the server..."
kill $SERVER_PID

echo "Test completed!"
