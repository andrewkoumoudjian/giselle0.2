#!/bin/bash

# Copy the example environment file if .env.local doesn't exist
if [ ! -f ".env.local" ]; then
  echo "Creating .env.local from example file..."
  cp .env.local.example .env.local
  echo "Please update .env.local with your specific configuration."
else
  echo ".env.local already exists. Skipping creation."
fi

# Check if .env.local has required variables
if [ -f ".env.local" ]; then
  # Check for API URL
  if ! grep -q "NEXT_PUBLIC_API_URL" .env.local; then
    echo "Warning: NEXT_PUBLIC_API_URL is missing in .env.local"
    echo "Adding default API URL..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
  fi
  
  # Check for app name
  if ! grep -q "NEXT_PUBLIC_APP_NAME" .env.local; then
    echo "Adding application name to .env.local..."
    echo "NEXT_PUBLIC_APP_NAME=Giselle AI Interview System" >> .env.local
  fi
  
  echo "Environment variables are set up."
else
  echo "Error: Failed to create .env.local file."
  exit 1
fi 