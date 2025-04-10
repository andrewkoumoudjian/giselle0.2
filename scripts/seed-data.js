const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or service key. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  try {
    console.log('Seeding database with test data...');
    
    // Create test users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const employerPassword = await bcrypt.hash('employer123', 10);
    const jobseekerPassword = await bcrypt.hash('jobseeker123', 10);
    
    // Create admin user
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .upsert({
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
      })
      .select()
      .single();
    
    if (adminError) {
      console.error('Error creating admin user:', adminError);
    } else {
      console.log('Admin user created:', admin.id);
    }
    
    // Create employer user
    const { data: employer, error: employerError } = await supabase
      .from('users')
      .upsert({
        email: 'employer@example.com',
        password: employerPassword,
        name: 'Employer User',
        role: 'employer',
      })
      .select()
      .single();
    
    if (employerError) {
      console.error('Error creating employer user:', employerError);
    } else {
      console.log('Employer user created:', employer.id);
      
      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .upsert({
          name: 'Tech Solutions Inc.',
          description: 'A leading technology company specializing in software development and IT services.',
          website: 'https://techsolutions.example.com',
          logo_url: 'https://via.placeholder.com/150',
          location: 'San Francisco, CA',
          size: '51-200',
          industry: 'Technology',
        })
        .select()
        .single();
      
      if (companyError) {
        console.error('Error creating company:', companyError);
      } else {
        console.log('Company created:', company.id);
        
        // Associate employer with company
        const { error: companyUserError } = await supabase
          .from('company_users')
          .upsert({
            company_id: company.id,
            user_id: employer.id,
            role: 'admin',
          });
        
        if (companyUserError) {
          console.error('Error associating employer with company:', companyUserError);
        } else {
          console.log('Employer associated with company');
          
          // Create jobs
          const jobs = [
            {
              company_id: company.id,
              title: 'Software Engineer',
              description: 'We are looking for a talented Software Engineer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
              location: 'San Francisco, CA',
              job_type: 'full-time',
              salary_min: 90000,
              salary_max: 130000,
              experience_level: 'Mid-level',
              education: "Bachelor's Degree",
              department: 'Engineering',
              status: 'active',
              created_by: employer.id,
            },
            {
              company_id: company.id,
              title: 'Product Manager',
              description: 'We are seeking a Product Manager to lead our product development efforts. You will be responsible for defining product vision, strategy, and roadmap.',
              location: 'Remote',
              job_type: 'full-time',
              salary_min: 100000,
              salary_max: 150000,
              experience_level: 'Senior',
              education: "Bachelor's Degree",
              department: 'Product',
              status: 'active',
              created_by: employer.id,
            },
            {
              company_id: company.id,
              title: 'UX Designer',
              description: 'We are looking for a UX Designer to create exceptional user experiences. You will be responsible for designing intuitive and engaging interfaces for our products.',
              location: 'New York, NY',
              job_type: 'full-time',
              salary_min: 85000,
              salary_max: 120000,
              experience_level: 'Mid-level',
              education: "Bachelor's Degree",
              department: 'Design',
              status: 'active',
              created_by: employer.id,
            },
          ];
          
          for (const job of jobs) {
            const { data: createdJob, error: jobError } = await supabase
              .from('jobs')
              .upsert(job)
              .select()
              .single();
            
            if (jobError) {
              console.error('Error creating job:', jobError);
            } else {
              console.log('Job created:', createdJob.id);
              
              // Add skills to job
              let skills = [];
              if (createdJob.title === 'Software Engineer') {
                skills = [
                  { job_id: createdJob.id, skill: 'JavaScript', importance: 'required' },
                  { job_id: createdJob.id, skill: 'React', importance: 'required' },
                  { job_id: createdJob.id, skill: 'Node.js', importance: 'preferred' },
                  { job_id: createdJob.id, skill: 'TypeScript', importance: 'preferred' },
                  { job_id: createdJob.id, skill: 'Git', importance: 'required' },
                ];
              } else if (createdJob.title === 'Product Manager') {
                skills = [
                  { job_id: createdJob.id, skill: 'Product Management', importance: 'required' },
                  { job_id: createdJob.id, skill: 'Agile', importance: 'required' },
                  { job_id: createdJob.id, skill: 'User Research', importance: 'preferred' },
                  { job_id: createdJob.id, skill: 'Data Analysis', importance: 'preferred' },
                  { job_id: createdJob.id, skill: 'Communication', importance: 'required' },
                ];
              } else if (createdJob.title === 'UX Designer') {
                skills = [
                  { job_id: createdJob.id, skill: 'UI Design', importance: 'required' },
                  { job_id: createdJob.id, skill: 'Figma', importance: 'required' },
                  { job_id: createdJob.id, skill: 'User Research', importance: 'required' },
                  { job_id: createdJob.id, skill: 'Prototyping', importance: 'preferred' },
                  { job_id: createdJob.id, skill: 'HTML/CSS', importance: 'preferred' },
                ];
              }
              
              if (skills.length > 0) {
                const { error: skillsError } = await supabase
                  .from('job_skills')
                  .upsert(skills);
                
                if (skillsError) {
                  console.error('Error adding skills to job:', skillsError);
                } else {
                  console.log(`Added ${skills.length} skills to job:`, createdJob.id);
                }
              }
            }
          }
        }
      }
    }
    
    // Create job seeker user
    const { data: jobseeker, error: jobseekerError } = await supabase
      .from('users')
      .upsert({
        email: 'jobseeker@example.com',
        password: jobseekerPassword,
        name: 'Job Seeker',
        role: 'jobseeker',
      })
      .select()
      .single();
    
    if (jobseekerError) {
      console.error('Error creating job seeker user:', jobseekerError);
    } else {
      console.log('Job seeker user created:', jobseeker.id);
      
      // Update job seeker profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          phone: '123-456-7890',
          location: 'San Francisco, CA',
          bio: 'Experienced software developer with a passion for building web applications.',
          linkedin_url: 'https://linkedin.com/in/jobseeker',
          github_url: 'https://github.com/jobseeker',
          portfolio_url: 'https://jobseeker.example.com',
          resume_url: 'https://example.com/resume.pdf',
        })
        .eq('id', jobseeker.id);
      
      if (profileError) {
        console.error('Error updating job seeker profile:', profileError);
      } else {
        console.log('Job seeker profile updated');
      }
    }
    
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData();
