-- Create database schema for HR Talent Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set up storage
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('company_logos', 'company_logos', true);

-- Create custom types
CREATE TYPE user_role AS ENUM ('jobseeker', 'employer', 'admin');
CREATE TYPE job_status AS ENUM ('active', 'draft', 'closed');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'temporary', 'internship', 'remote');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'interviewing', 'accepted', 'rejected');
CREATE TYPE skill_importance AS ENUM ('required', 'preferred', 'nice-to-have');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid-level', 'senior', 'lead', 'executive');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role user_role DEFAULT 'jobseeker',
  phone TEXT,
  location TEXT,
  bio TEXT,
  resume_url TEXT,
  resume_text TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  location TEXT,
  logo_url TEXT,
  size TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_users table (for employer accounts)
CREATE TABLE company_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type job_type NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  experience_level experience_level,
  education TEXT,
  department TEXT,
  posted_date TIMESTAMPTZ NOT NULL,
  closing_date TIMESTAMPTZ,
  status job_status DEFAULT 'active',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_skills table
CREATE TABLE job_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  importance skill_importance DEFAULT 'required',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',
  applied_date TIMESTAMPTZ NOT NULL,
  cover_letter TEXT,
  resume_url TEXT,
  match_score INTEGER,
  skills_matched TEXT[],
  skills_missing TEXT[],
  custom_questions JSONB,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Create function to increment job views
CREATE OR REPLACE FUNCTION increment_job_views(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE jobs
  SET views = views + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at
BEFORE UPDATE ON company_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)

-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Companies: Public read, employer/admin write
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Employers can insert companies"
  ON companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('employer', 'admin')
    )
  );

CREATE POLICY "Company admins can update their company"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = id
      AND company_users.user_id = auth.uid()
      AND company_users.role = 'admin'
    )
  );

-- Company Users: Employer/admin read/write
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users are viewable by company members"
  ON company_users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM company_users
      WHERE company_id = company_users.company_id
    )
  );

CREATE POLICY "Company admins can insert company users"
  ON company_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = company_id
      AND company_users.user_id = auth.uid()
      AND company_users.role = 'admin'
    )
  );

CREATE POLICY "Company admins can update company users"
  ON company_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = company_id
      AND company_users.user_id = auth.uid()
      AND company_users.role = 'admin'
    )
  );

-- Jobs: Public read, employer/admin write for their company
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Employers can insert jobs for their company"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = company_id
      AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update jobs for their company"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = company_id
      AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete jobs for their company"
  ON jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Job Skills: Public read, employer/admin write for their company's jobs
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job skills are viewable by everyone"
  ON job_skills FOR SELECT
  USING (true);

CREATE POLICY "Employers can insert job skills for their company's jobs"
  ON job_skills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_users ON jobs.company_id = company_users.company_id
      WHERE jobs.id = job_id
      AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update job skills for their company's jobs"
  ON job_skills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_users ON jobs.company_id = company_users.company_id
      WHERE jobs.id = job_id
      AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete job skills for their company's jobs"
  ON job_skills FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_users ON jobs.company_id = company_users.company_id
      WHERE jobs.id = job_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Applications: Job seekers can read/write their own, employers can read/write for their company's jobs
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job seekers can view their own applications"
  ON applications FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_users ON jobs.company_id = company_users.company_id
      WHERE jobs.id = job_id
      AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Job seekers can insert their own applications"
  ON applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'jobseeker'
    )
  );

CREATE POLICY "Job seekers can update their own applications"
  ON applications FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_users ON jobs.company_id = company_users.company_id
      WHERE jobs.id = job_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_company_users_user_id ON company_users(user_id);

-- Create text search indexes
CREATE INDEX idx_jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops);
CREATE INDEX idx_jobs_description_trgm ON jobs USING GIN (description gin_trgm_ops);
CREATE INDEX idx_profiles_name_trgm ON profiles USING GIN (name gin_trgm_ops);
CREATE INDEX idx_companies_name_trgm ON companies USING GIN (name gin_trgm_ops);

-- Set up realtime
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    (NEW.raw_user_meta_data->>'role')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
