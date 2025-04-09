# Giselle AI Interview System - Production Deployment

This repository contains the production-ready code for the Giselle AI Interview System, optimized for deployment on Vercel with Supabase for data storage.

## Production Features

- **Real-time LLM-powered interviews**: Uses OpenRouter to access advanced language models for customized interview questions
- **AI-powered assessment**: Analyzes candidate responses using deepseek/deepseek-chat models via OpenRouter
- **Comprehensive candidate evaluation**: Generates detailed assessments including skills evaluation, strengths, areas for improvement, and job match percentage
- **Secure data storage**: All candidate data, interview responses, and assessments stored in Supabase

## Project Structure

The project follows a monorepo structure:

```
vercel-deployment/
├── api/               # Serverless API functions with OpenRouter LLM integration
├── frontend/          # Next.js frontend application
├── package.json       # Root package.json for the monorepo
└── vercel.json        # Vercel configuration
```

## Requirements

- Node.js 18+ and npm
- Vercel account
- Supabase account
- OpenRouter API key

## Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd vercel-deployment
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create `api/.env` with the following:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_service_key
     OPENROUTER_API_KEY=your_openrouter_api_key
     OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free
     ```
   - Create `frontend/.env` with:
     ```
     NEXT_PUBLIC_API_URL=/api
     ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser to http://localhost:3000

## Deploying to Vercel

### Option 1: Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Set up environment variables:
   ```
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_KEY
   vercel env add OPENROUTER_API_KEY
   vercel env add OPENROUTER_MODEL
   ```

4. Deploy:
   ```
   vercel --prod
   ```

### Option 2: GitHub Integration

1. Push your code to a GitHub repository

2. Log in to your Vercel account

3. Click "New Project" and import your GitHub repository

4. Configure the project:
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `frontend/.next`

5. Set up environment variables:
   - Add `SUPABASE_URL`, `SUPABASE_KEY`, `OPENROUTER_API_KEY`, and `OPENROUTER_MODEL`

6. Click "Deploy"

## Database Setup

1. Create a new Supabase project

2. Run the database setup script:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `api/lib/supabase-schema.sql`
   - Paste into the SQL editor and run

3. Configure RLS (Row Level Security) policies:
   - The schema includes basic policies for authenticated users
   - For production, adjust these policies according to your security requirements

## Authentication (Optional)

This system supports social authentication through Supabase:

1. Go to the Authentication settings in your Supabase dashboard
2. Enable the providers you want (Google, GitHub, Twitter, etc.)
3. Configure the callback URLs to point to your Vercel deployment

## Features

- AI-powered question generation tailored to the job and candidate
- Audio recording and upload for candidate responses
- Real-time transcription of audio responses
- Advanced AI assessment of interview responses
- Detailed result visualization with charts and recommendations
- Candidate and job management

## License

This project is licensed under the MIT License. 