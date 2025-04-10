const request = require('supertest');
const app = require('../../api/index');
const supabase = require('../../api/lib/supabase');
const jwt = require('jsonwebtoken');

// Mock Supabase
jest.mock('../../api/lib/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
}));

describe('Jobs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/jobs', () => {
    it('should return a list of jobs', async () => {
      // Mock Supabase responses
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'job-1',
              title: 'Software Engineer',
              companies: {
                id: 'company-1',
                name: 'Tech Company',
                logo_url: 'logo.png',
              },
              location: 'Remote',
              description: 'Job description',
              job_type: 'full-time',
              salary_min: 80000,
              salary_max: 120000,
              experience_level: 'Mid-level',
              education: "Bachelor's Degree",
              department: 'Engineering',
              posted_date: '2023-01-01T00:00:00Z',
              closing_date: '2023-02-01T00:00:00Z',
              job_skills: [
                { skill: 'JavaScript' },
                { skill: 'React' },
              ],
            },
          ],
        }),
      });
      
      // Mock count query
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ count: 1 }),
      });
      
      const res = await request(app).get('/api/jobs');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('jobs');
      expect(res.body.jobs).toBeInstanceOf(Array);
      expect(res.body.jobs.length).toBe(1);
      expect(res.body.jobs[0]).toHaveProperty('id', 'job-1');
      expect(res.body.jobs[0]).toHaveProperty('title', 'Software Engineer');
      expect(res.body.jobs[0]).toHaveProperty('company', 'Tech Company');
      expect(res.body.jobs[0]).toHaveProperty('location', 'Remote');
      expect(res.body.jobs[0]).toHaveProperty('skills');
      expect(res.body.jobs[0].skills).toContain('JavaScript');
      expect(res.body.jobs[0].skills).toContain('React');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('totalItems', 1);
    });
    
    it('should filter jobs by search term', async () => {
      // Mock Supabase responses
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'job-1',
              title: 'Software Engineer',
              companies: {
                id: 'company-1',
                name: 'Tech Company',
                logo_url: 'logo.png',
              },
              location: 'Remote',
              description: 'Job description',
              job_type: 'full-time',
              salary_min: 80000,
              salary_max: 120000,
              experience_level: 'Mid-level',
              education: "Bachelor's Degree",
              department: 'Engineering',
              posted_date: '2023-01-01T00:00:00Z',
              closing_date: '2023-02-01T00:00:00Z',
              job_skills: [
                { skill: 'JavaScript' },
                { skill: 'React' },
              ],
            },
          ],
        }),
      });
      
      // Mock count query
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ count: 1 }),
      });
      
      const res = await request(app).get('/api/jobs?search=software');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('jobs');
      expect(res.body.jobs).toBeInstanceOf(Array);
      expect(res.body.jobs.length).toBe(1);
      expect(res.body.jobs[0]).toHaveProperty('title', 'Software Engineer');
      
      // Verify that the or method was called for search
      expect(supabase.or).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/jobs/:id', () => {
    it('should return a job by ID', async () => {
      // Mock Supabase responses
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'job-1',
            title: 'Software Engineer',
            companies: {
              id: 'company-1',
              name: 'Tech Company',
              logo_url: 'logo.png',
              description: 'Company description',
              website: 'https://example.com',
              location: 'San Francisco, CA',
              size: '51-200',
              industry: 'Technology',
            },
            location: 'Remote',
            description: 'Job description',
            job_type: 'full-time',
            salary_min: 80000,
            salary_max: 120000,
            experience_level: 'Mid-level',
            education: "Bachelor's Degree",
            department: 'Engineering',
            posted_date: '2023-01-01T00:00:00Z',
            closing_date: '2023-02-01T00:00:00Z',
            job_skills: [
              { skill: 'JavaScript' },
              { skill: 'React' },
            ],
          },
        }),
      });
      
      // Mock application count query
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ count: 5 }),
      });
      
      const res = await request(app).get('/api/jobs/job-1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 'job-1');
      expect(res.body).toHaveProperty('title', 'Software Engineer');
      expect(res.body).toHaveProperty('company', 'Tech Company');
      expect(res.body).toHaveProperty('location', 'Remote');
      expect(res.body).toHaveProperty('description', 'Job description');
      expect(res.body).toHaveProperty('job_type', 'full-time');
      expect(res.body).toHaveProperty('salary_range', '$80,000 - $120,000');
      expect(res.body).toHaveProperty('skills');
      expect(res.body.skills).toContain('JavaScript');
      expect(res.body.skills).toContain('React');
      expect(res.body).toHaveProperty('application_count', 5);
    });
    
    it('should return 404 if job is not found', async () => {
      // Mock Supabase response for non-existent job
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Job not found' },
        }),
      });
      
      const res = await request(app).get('/api/jobs/nonexistent-job');
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Job not found');
    });
  });
  
  describe('POST /api/jobs', () => {
    it('should create a new job', async () => {
      // Mock JWT verification to return employer role
      jwt.verify.mockReturnValueOnce({ userId: 'employer-id' });
      
      // Mock Supabase responses
      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'employer-id',
                    role: 'employer',
                  },
                }),
              }),
            }),
          };
        } else if (table === 'company_users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { company_id: 'company-1' },
                  }),
                }),
              }),
            }),
          };
        } else if (table === 'jobs') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'new-job-id',
                    title: 'Software Engineer',
                  },
                }),
              }),
            }),
          };
        } else if (table === 'job_skills') {
          return {
            insert: jest.fn().mockResolvedValue({
              data: [{ job_id: 'new-job-id', skill: 'JavaScript' }],
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null }),
        };
      });
      
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Software Engineer',
          company_id: 'company-1',
          description: 'Job description',
          location: 'Remote',
          job_type: 'full-time',
          salary_min: 80000,
          salary_max: 120000,
          experience_level: 'Mid-level',
          education: "Bachelor's Degree",
          department: 'Engineering',
          skills: [
            { name: 'JavaScript', importance: 'required' },
            { name: 'React', importance: 'preferred' },
          ],
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Job created successfully');
      expect(res.body).toHaveProperty('job_id', 'new-job-id');
    });
    
    it('should return 403 if user is not an employer', async () => {
      // Mock JWT verification to return jobseeker role
      jwt.verify.mockReturnValueOnce({ userId: 'jobseeker-id' });
      
      // Mock Supabase response
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'jobseeker-id',
                role: 'jobseeker',
              },
            }),
          }),
        }),
      });
      
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Software Engineer',
          company_id: 'company-1',
          description: 'Job description',
          location: 'Remote',
          job_type: 'full-time',
        });
      
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to create jobs');
    });
  });
});
