-- Create database schema for HR Talent Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employer', 'jobseeker')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  location TEXT,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  size TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_users table (for employer users associated with companies)
CREATE TABLE IF NOT EXISTS company_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'recruiter', 'hiring_manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'remote')),
  salary_min INTEGER,
  salary_max INTEGER,
  experience_level TEXT,
  education TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'closed')) DEFAULT 'draft',
  department TEXT,
  posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closing_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_skills table
CREATE TABLE IF NOT EXISTS job_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  importance TEXT CHECK (importance IN ('required', 'preferred', 'nice-to-have')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, skill)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'reviewing', 'interviewing', 'rejected', 'accepted')) DEFAULT 'pending',
  match_score INTEGER,
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Create application_answers table (for custom application questions)
CREATE TABLE IF NOT EXISTS application_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_skills table (for skills extracted from resume)
CREATE TABLE IF NOT EXISTS application_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  match_type TEXT CHECK (match_type IN ('matched', 'missing', 'additional')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, skill)
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES users(id),
  interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  interview_type TEXT NOT NULL CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'panel')),
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_feedback table
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  recommendation TEXT CHECK (recommendation IN ('hire', 'reject', 'consider')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('application', 'interview', 'job', 'system')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies

-- Users can only read their own data
CREATE POLICY users_read_own ON users
  FOR SELECT USING (id = auth.uid());

-- Users can only update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (id = auth.uid());

-- Users can only read their own profile
CREATE POLICY profiles_read_own ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY profiles_update_own ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Anyone can read active jobs
CREATE POLICY jobs_read_active ON jobs
  FOR SELECT USING (status = 'active');

-- Employers can read all jobs in their company
CREATE POLICY jobs_read_company ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = jobs.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Employers can create jobs for their company
CREATE POLICY jobs_create_company ON jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = jobs.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Employers can update jobs in their company
CREATE POLICY jobs_update_company ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = jobs.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Job seekers can create applications
CREATE POLICY applications_create_own ON applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Job seekers can read their own applications
CREATE POLICY applications_read_own ON applications
  FOR SELECT USING (user_id = auth.uid());

-- Employers can read applications for their company's jobs
CREATE POLICY applications_read_company ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_users ON jobs.company_id = company_users.company_id
      WHERE applications.job_id = jobs.id
      AND company_users.user_id = auth.uid()
    )
  );

-- Employers can update applications for their company's jobs
CREATE POLICY applications_update_company ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_users ON jobs.company_id = company_users.company_id
      WHERE applications.job_id = jobs.id
      AND company_users.user_id = auth.uid()
    )
  );

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles table
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for companies table
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for company_users table
CREATE TRIGGER update_company_users_updated_at
BEFORE UPDATE ON company_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for jobs table
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for applications table
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for interviews table
CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for interview_feedback table
CREATE TRIGGER update_interview_feedback_updated_at
BEFORE UPDATE ON interview_feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after user creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user profile after user creation
CREATE TRIGGER create_user_profile_after_user_creation
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();

-- Function to update application status when interview is scheduled
CREATE OR REPLACE FUNCTION update_application_status_on_interview()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE applications
  SET status = 'interviewing',
      updated_at = NOW()
  WHERE id = NEW.application_id
  AND status IN ('pending', 'reviewing');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update application status when interview is scheduled
CREATE TRIGGER update_application_status_on_interview_creation
AFTER INSERT ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_application_status_on_interview();

-- Function to create notification when application status changes
CREATE OR REPLACE FUNCTION create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Application Status Updated',
      'Your application status has been updated to ' || NEW.status,
      'application'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when application status changes
CREATE TRIGGER create_application_notification_on_status_change
AFTER UPDATE OF status ON applications
FOR EACH ROW
EXECUTE FUNCTION create_application_notification();

-- Function to create notification when interview is scheduled
CREATE OR REPLACE FUNCTION create_interview_notification()
RETURNS TRIGGER AS $$
DECLARE
  applicant_id UUID;
BEGIN
  SELECT user_id INTO applicant_id
  FROM applications
  WHERE id = NEW.application_id;
  
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    applicant_id,
    'Interview Scheduled',
    'An interview has been scheduled for ' || NEW.interview_date,
    'interview'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when interview is scheduled
CREATE TRIGGER create_interview_notification_on_creation
AFTER INSERT ON interviews
FOR EACH ROW
EXECUTE FUNCTION create_interview_notification();

-- Enable row level security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
