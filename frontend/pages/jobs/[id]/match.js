import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { withAuth } from '../../../context/AuthContext';
import ResumeAnalysis from '../../../components/ResumeAnalysis';
import { FaArrowLeft } from 'react-icons/fa';

const JobMatchPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);
  
  // Fetch job details and match data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // In a real app, we would call the API
        // const jobData = await getJobById(id);
        // const matchData = await getJobMatch(id);
        
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock job data
        const mockJob = {
          id,
          title: 'Software Engineer',
          company: 'Tech Solutions Inc.',
          location: 'Remote',
          job_type: 'Full-time',
        };
        
        setJob(mockJob);
        
        // Mock match data will be provided by the ResumeAnalysis component
        setMatchData({});
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load job match data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text ml={4} fontSize="lg">Loading job match data...</Text>
        </Flex>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
        <Button 
          as={NextLink}
          href={`/jobs/${id}`}
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          variant="outline"
        >
          Back to Job Details
        </Button>
      </Container>
    );
  }
  
  if (!job) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          Job not found
        </Alert>
        <Button 
          as={NextLink}
          href="/jobs"
          colorScheme="blue"
          variant="outline"
        >
          Back to Jobs
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink as={NextLink} href="/jobs">Jobs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={NextLink} href={`/jobs/${id}`}>{job.title}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Match Analysis</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg={cardBg}
        mb={6}
      >
        <Heading as="h1" size="xl" mb={2}>Match Analysis: {job.title}</Heading>
        <Text color="gray.600" mb={6}>
          {job.company} • {job.location} • {job.job_type}
        </Text>
        
        <Text mb={8}>
          This analysis compares your profile, skills, and experience with the requirements for this position.
          Use this information to highlight your strengths and address any gaps in your application.
        </Text>
        
        <ResumeAnalysis />
        
        <Flex justify="space-between" mt={8}>
          <Button 
            as={NextLink}
            href={`/jobs/${id}`}
            leftIcon={<FaArrowLeft />}
            colorScheme="blue"
            variant="outline"
          >
            Back to Job Details
          </Button>
          
          <Button 
            as={NextLink}
            href={`/jobs/${id}/apply`}
            colorScheme="blue"
          >
            Apply Now
          </Button>
        </Flex>
      </Box>
    </Container>
  );
};

export default withAuth(JobMatchPage, { requiredRole: 'jobseeker' });
