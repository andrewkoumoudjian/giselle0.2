import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TailwindJobCard from '../../components/TailwindJobCard';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return (
      <a href={href} data-testid="next-link">
        {children}
      </a>
    );
  };
});

describe('TailwindJobCard Component', () => {
  const mockJob = {
    id: 'job-1',
    title: 'Software Engineer',
    company: 'Tech Company',
    company_logo: '/logo.png',
    location: 'Remote',
    job_type: 'full-time',
    salary_range: '$80,000 - $120,000',
    posted_date: '2023-01-01T00:00:00Z',
    skills: ['JavaScript', 'React', 'Node.js'],
  };
  
  it('renders job card with correct information', () => {
    render(<TailwindJobCard job={mockJob} />);
    
    // Check if job title is rendered
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    
    // Check if company name is rendered
    expect(screen.getByText('Tech Company')).toBeInTheDocument();
    
    // Check if location is rendered
    expect(screen.getByText('Remote')).toBeInTheDocument();
    
    // Check if job type is rendered
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    
    // Check if salary range is rendered
    expect(screen.getByText('$80,000 - $120,000')).toBeInTheDocument();
    
    // Check if skills are rendered
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    
    // Check if the link is correct
    const link = screen.getByTestId('next-link');
    expect(link).toHaveAttribute('href', '/jobs/job-1');
  });
  
  it('renders job card with default values when optional props are missing', () => {
    const jobWithMissingProps = {
      id: 'job-2',
      title: 'Product Manager',
      company: 'Another Company',
      location: 'New York, NY',
      job_type: 'full-time',
      // Missing salary_range, posted_date, and skills
    };
    
    render(<TailwindJobCard job={jobWithMissingProps} />);
    
    // Check if job title is rendered
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    
    // Check if company name is rendered
    expect(screen.getByText('Another Company')).toBeInTheDocument();
    
    // Check if location is rendered
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    
    // Check if job type is rendered
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    
    // Salary range should not be rendered
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    
    // Skills section should not be rendered or should be empty
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
  });
  
  it('formats the posted date correctly', () => {
    render(<TailwindJobCard job={mockJob} />);
    
    // Check if the posted date is formatted correctly
    // The exact format may depend on your implementation, but it should be human-readable
    expect(screen.getByText(/Jan(uary)? 1, 2023/)).toBeInTheDocument();
  });
  
  it('renders a featured job with highlight styling', () => {
    const featuredJob = {
      ...mockJob,
      featured: true,
    };
    
    render(<TailwindJobCard job={featuredJob} />);
    
    // Check if the featured badge is rendered
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });
});
