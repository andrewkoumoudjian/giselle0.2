import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TailwindJobCard from '../components/TailwindJobCard';
import TailwindDashboardStats from '../components/TailwindDashboardStats';
import TailwindNavbar from '../components/TailwindNavbar';
import TailwindFooter from '../components/TailwindFooter';

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
    };
  },
}));

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isAuthenticated: () => true,
    hasRole: () => true,
    logout: jest.fn(),
  }),
  withAuth: (Component) => Component,
}));

describe('Tailwind Components', () => {
  // Test TailwindJobCard component
  describe('TailwindJobCard', () => {
    const mockJob = {
      id: '1',
      title: 'Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      description: 'We are looking for a talented software engineer to join our team.',
      posted_date: '2023-06-01',
      salary_range: '$100,000 - $130,000',
      job_type: 'Full-time',
      skills: ['JavaScript', 'React', 'Node.js'],
    };

    it('renders job card with correct information', () => {
      render(<TailwindJobCard job={mockJob} />);
      
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Solutions Inc.')).toBeInTheDocument();
      expect(screen.getByText('Remote')).toBeInTheDocument();
      expect(screen.getByText('Full-time')).toBeInTheDocument();
      expect(screen.getByText('$100,000 - $130,000')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });
  });

  // Test TailwindDashboardStats component
  describe('TailwindDashboardStats', () => {
    const mockStats = {
      activeJobs: 12,
      totalApplications: 143,
      newApplications: 28,
      averageScore: 76,
    };

    it('renders dashboard stats with correct information', () => {
      render(<TailwindDashboardStats stats={mockStats} />);
      
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('143')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText('76%')).toBeInTheDocument();
    });
  });

  // Test TailwindNavbar component
  describe('TailwindNavbar', () => {
    it('renders navbar with correct links', () => {
      render(<TailwindNavbar />);
      
      expect(screen.getByText('HR Talent')).toBeInTheDocument();
      expect(screen.getByText('Jobs')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  // Test TailwindFooter component
  describe('TailwindFooter', () => {
    it('renders footer with correct information', () => {
      render(<TailwindFooter />);
      
      expect(screen.getByText('HR Talent')).toBeInTheDocument();
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      
      // Check for copyright text with current year
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} HR Talent`))).toBeInTheDocument();
    });
  });
});
