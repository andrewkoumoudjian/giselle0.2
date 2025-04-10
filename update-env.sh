#!/bin/bash

# Check if the required arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <SUPABASE_URL> <SUPABASE_ANON_KEY>"
    exit 1
fi

SUPABASE_URL=$1
SUPABASE_ANON_KEY=$2

# Update the .env.local file
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_KEY=$SUPABASE_ANON_KEY

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_RESUME_PARSER_API_URL=http://localhost:3000/api/resume

# OpenRouter Configuration (for LangGraph)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
EOF

echo ".env.local file updated successfully!"
