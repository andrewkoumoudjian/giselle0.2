const request = require('supertest');
const app = require('../../api/index');
const supabase = require('../../api/lib/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock Supabase
jest.mock('../../api/lib/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Mock Supabase responses
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'jobseeker',
              },
            }),
          }),
        }),
      });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token', 'test-token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id', 'test-user-id');
      expect(res.body.user).toHaveProperty('name', 'Test User');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('role', 'jobseeker');
      
      // Verify bcrypt was called
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      
      // Verify JWT was called
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'test-user-id' },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
    });
    
    it('should return 400 if user already exists', async () => {
      // Mock Supabase response for existing user
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-user-id' },
            }),
          }),
        }),
      });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists with this email');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          // Missing email
          password: 'password123',
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide all required fields');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      // Mock Supabase response
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'jobseeker',
                password: 'hashedPassword',
              },
            }),
          }),
        }),
      });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token', 'test-token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id', 'test-user-id');
      expect(res.body.user).toHaveProperty('name', 'Test User');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('role', 'jobseeker');
      
      // Verify bcrypt was called
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      
      // Verify JWT was called
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'test-user-id' },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
    });
    
    it('should return 401 if user does not exist', async () => {
      // Mock Supabase response for non-existent user
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' },
            }),
          }),
        }),
      });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    it('should return 401 if password is incorrect', async () => {
      // Mock Supabase response
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'jobseeker',
                password: 'hashedPassword',
              },
            }),
          }),
        }),
      });
      
      // Mock bcrypt to return false for incorrect password
      bcrypt.compare.mockResolvedValueOnce(false);
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
  
  describe('GET /api/auth/me', () => {
    it('should return the current user', async () => {
      // Mock Supabase responses
      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'test-user-id',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'jobseeker',
                  },
                }),
              }),
            }),
          };
        } else if (table === 'user_profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'test-user-id',
                    phone: '123-456-7890',
                    location: 'New York, NY',
                  },
                }),
              }),
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
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 'test-user-id');
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('role', 'jobseeker');
      expect(res.body).toHaveProperty('profile');
      expect(res.body.profile).toHaveProperty('phone', '123-456-7890');
      expect(res.body.profile).toHaveProperty('location', 'New York, NY');
    });
    
    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication token required');
    });
  });
});
