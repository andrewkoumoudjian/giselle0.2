import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Stack,
  Divider,
  Icon,
  useColorModeValue,
  Container,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FaBuilding, FaMapMarkerAlt, FaClock, FaBriefcase, FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import ApplicationForm from './ApplicationForm';

const JobDetail = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/jobs/${jobId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found');
          }
          throw new Error('Failed to fetch job details');
        }
        
        const data = await response.json();
        setJob(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading job details...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!job) {
    return (
      <Alert status="info">
        <AlertIcon />
        Job not found. <Button as={NextLink} href="/jobs" variant="link" colorScheme="blue">View all jobs</Button>
      </Alert>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Button as={NextLink} href="/jobs" leftIcon={<Icon as={FaArrowLeft} />} variant="ghost" mb={4}>
          Back to Jobs
        </Button>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={4}
        >
          <Box>
            <Heading as="h1" size="xl">{job.title}</Heading>
            <Flex align="center" mt={2} color="gray.600">
              <Icon as={FaBuilding} mr={2} />
              <Text fontWeight="medium">{job.companies?.name || 'Unknown Company'}</Text>
              
              {job.department && (
                <>
                  <Text mx={2}>•</Text>
                  <Icon as={FaBriefcase} mr={2} />
                  <Text>{job.department}</Text>
                </>
              )}
              
              <Text mx={2}>•</Text>
              <Icon as={FaClock} mr={2} />
              <Text>Posted {new Date(job.created_at).toLocaleDateString()}</Text>
            </Flex>
          </Box>
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            mt={{ base: 4, md: 0 }}
            onClick={() => setShowApplicationForm(true)}
          >
            Apply Now
          </Button>
        </Flex>
        
        <Divider my={6} />
        
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          <Box gridColumn="span 2">
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={6}>
              <CardBody>
                <Heading as="h2" size="md" mb={4}>Job Description</Heading>
                <Text whiteSpace="pre-line">{job.description}</Text>
              </CardBody>
            </Card>
            
            {showApplicationForm && (
              <Box mt={8}>
                <ApplicationForm jobId={job.id} jobTitle={job.title} />
              </Box>
            )}
          </Box>
          
          <Box>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={6}>
              <CardBody>
                <Heading as="h2" size="md" mb={4}>Required Skills</Heading>
                {job.required_skills && job.required_skills.length > 0 ? (
                  <List spacing={2}>
                    {job.required_skills.map((skill, index) => (
                      <ListItem key={index}>
                        <ListIcon as={FaCheckCircle} color="green.500" />
                        {skill}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text color="gray.500">No specific skills listed</Text>
                )}
              </CardBody>
            </Card>
            
            {job.soft_skills_priorities && Object.keys(job.soft_skills_priorities).length > 0 && (
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <Heading as="h2" size="md" mb={4}>Soft Skills</Heading>
                  <List spacing={2}>
                    {Object.entries(job.soft_skills_priorities).map(([skill, priority], index) => (
                      <ListItem key={index}>
                        <ListIcon as={FaCheckCircle} color="blue.500" />
                        {skill} 
                        <Badge ml={2} colorScheme={
                          priority > 80 ? "red" : 
                          priority > 60 ? "orange" : 
                          priority > 40 ? "yellow" : 
                          "green"
                        }>
                          {priority}%
                        </Badge>
                      </ListItem>
                    ))}
                  </List>
                </CardBody>
              </Card>
            )}
            
            {!showApplicationForm && (
              <Button 
                colorScheme="blue" 
                size="lg" 
                width="100%" 
                mt={6}
                onClick={() => setShowApplicationForm(true)}
              >
                Apply for this Position
              </Button>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </Container>
  );
};

export default JobDetail;
