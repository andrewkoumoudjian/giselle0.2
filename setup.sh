#!/bin/bash

# Exit on error
set -e

echo "Setting up Giselle AI Interview System..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
bash env-setup.sh
cd ..

# Create Python virtual environment for backend
echo "Setting up backend environment..."
cd backend

# Check if python3 exists
if command -v python3 &>/dev/null; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment based on OS
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
        source venv/bin/activate
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    fi
    
    # Install requirements
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
else
    echo "Python 3 not found. Please install Python 3 and try again."
    exit 1
fi

cd ..

echo "Setup complete! Run 'npm run dev' to start the application." 