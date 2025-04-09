-- Supabase SQL schema for Giselle AI Interview System
-- Run this in the Supabase SQL Editor to set up the database schema

-- Candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  resume_url TEXT,
  resume_parsed JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews table
CREATE TABLE interviews (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id),
  question TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  audio_url TEXT NOT NULL,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) UNIQUE,
  overall_assessment TEXT,
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  job_match_percentage FLOAT,
  skill_scores JSONB DEFAULT '[]',
  job_match_subjects JSONB DEFAULT '[]',
  question_feedback JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX candidates_email_idx ON candidates(email);
CREATE INDEX interviews_candidate_id_idx ON interviews(candidate_id);
CREATE INDEX interviews_job_id_idx ON interviews(job_id);
CREATE INDEX questions_interview_id_idx ON questions(interview_id);
CREATE INDEX responses_interview_id_idx ON responses(interview_id);
CREATE INDEX responses_question_id_idx ON responses(question_id);
CREATE INDEX assessments_interview_id_idx ON assessments(interview_id);

-- Enable Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For simplicity, we're allowing all authenticated users to read/write all records
-- In a production environment, you would want more restrictive policies

-- Candidates policies
CREATE POLICY "Allow all access to authenticated users" ON candidates
  FOR ALL USING (auth.role() = 'authenticated');

-- Jobs policies
CREATE POLICY "Allow all access to authenticated users" ON jobs
  FOR ALL USING (auth.role() = 'authenticated');

-- Interviews policies
CREATE POLICY "Allow all access to authenticated users" ON interviews
  FOR ALL USING (auth.role() = 'authenticated');

-- Questions policies
CREATE POLICY "Allow all access to authenticated users" ON questions
  FOR ALL USING (auth.role() = 'authenticated');

-- Responses policies
CREATE POLICY "Allow all access to authenticated users" ON responses
  FOR ALL USING (auth.role() = 'authenticated');

-- Assessments policies
CREATE POLICY "Allow all access to authenticated users" ON assessments
  FOR ALL USING (auth.role() = 'authenticated'); 