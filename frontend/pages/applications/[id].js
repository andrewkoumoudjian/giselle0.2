import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Link,
  HStack,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { 
  FaArrowLeft, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaUserTie,
} from 'react-icons/fa';
import NextLink from 'next/link';
import { withAuth } from '../../context/AuthContext';

// Mock application data (in a real app, this would come from an API)
const mockApplications = [
  {
    id: '1',
    job_title: 'Software Engineer',
    company: 'Tech Solutions Inc.',
    location: 'Remote',
    applied_date: '2023-06-15',
    status: 'pending',
    match_score: 85,
    job_id: '1',
  },
  {
    id: '2',
    job_title: 'Product Manager',
    company: 'Innovative Products',
    location: 'New York, NY',
    applied_date: '2023-06-10',
    status: 'reviewing',
    match_score: 92,
    job_id: '2',
  },
  {
    id: '3',
    job_title: 'UX Designer',
    company: 'Creative Designs',
    location: 'San Francisco, CA',
    applied_date: '2023-06-05',
    status: 'interviewing',
    match_score: 78,
    job_id: '3',
  },
];

// Status badge color mapping
const statusColors = {
  pending: 'yellow',
  reviewing: 'blue',
  interviewing: 'purple',
  rejected: 'red',
  accepted: 'green',
};

// Status icon mapping
const statusIcons = {
  pending: FaHourglassHalf,
  reviewing: FaUserTie,
  interviewing: FaUserTie,
  rejected: FaTimesCircle,
  accepted: FaCheckCircle,
};

const ApplicationDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // In a real app, we would call the API
        // const data = await getApplicationById(id);
        
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        const foundApplication = mockApplications.find(app => app.id === id);
        
        if (foundApplication) {
          setApplication(foundApplication);
        } else {
          setError('Application not found');
        }
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplication();
  }, [id]);
  
  // Card styles
  const cardBg = useColorModeValue('white', 'gray.700');
  
  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text ml={4} fontSize="lg">Loading application details...</Text>
        </Flex>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
        <Button 
          as={NextLink}
          href="/applications"
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          variant="outline"
        >
          Back to Applications
        </Button>
      </Container>
    );
  }
  
  if (!application) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          Application not found
        </Alert>
        <Button 
          as={NextLink}
          href="/applications"
          leftIcon={<FaArrowLeft />}
          colorScheme="blue"
          variant="outline"
        >
          Back to Applications
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <Button 
        as={NextLink}
        href="/applications"
        leftIcon={<FaArrowLeft />}
        colorScheme="blue"
        variant="outline"
        mb={6}
      >
        Back to Applications
      </Button>
      
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg={cardBg}
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={4}
        >
          <Heading as="h1" size="xl">{application.job_title}</Heading>
          <Badge 
            colorScheme={statusColors[application.status]} 
            fontSize="md" 
            p={2} 
            borderRadius="md"
            mt={{ base: 2, md: 0 }}
          >
            <HStack spacing={1}>
              <Icon as={statusIcons[application.status]} />
              <Text>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</Text>
            </HStack>
          </Badge>
        </Flex>
        
        <HStack spacing={4} mb={4} flexWrap="wrap">
          <HStack>
            <Icon as={FaBuilding} color="gray.500" />
            <Text fontSize="lg">{application.company}</Text>
          </HStack>
          
          <HStack>
            <Icon as={FaMapMarkerAlt} color="gray.500" />
            <Text fontSize="lg">{application.location}</Text>
          </HStack>
          
          <HStack>
            <Icon as={FaCalendarAlt} color="gray.500" />
            <Text fontSize="lg">Applied on {new Date(application.applied_date).toLocaleDateString()}</Text>
          </HStack>
        </HStack>
        
        <Divider my={4} />
        
        <Flex justify="space-between" mt={6}>
          <Button 
            as={NextLink} 
            href={`/jobs/${application.job_id}`} 
            colorScheme="blue" 
          >
            View Job Details
          </Button>
          
          <Button 
            colorScheme="red" 
            variant="outline"
          >
            Withdraw Application
          </Button>
        </Flex>
      </Box>
    </Container>
  );
};

export default withAuth(ApplicationDetailPage);
