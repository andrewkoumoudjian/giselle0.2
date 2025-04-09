import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Badge,
  Flex,
  Icon,
  Button,
  HStack,
  VStack,
  Progress,
  useColorModeValue,
  Divider,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Spinner,
  Alert,
  AlertIcon,
  Link,
  Tag,
  TagLabel,
  TagLeftIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
} from '@chakra-ui/react';
import { 
  FaBriefcase, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaUserTie,
  FaChartLine,
} from 'react-icons/fa';
import NextLink from 'next/link';
import { withAuth } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

// Mock application data
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
  {
    id: '4',
    job_title: 'Data Scientist',
    company: 'Data Insights',
    location: 'Remote',
    applied_date: '2023-05-28',
    status: 'rejected',
    match_score: 65,
    job_id: '4',
    feedback: 'We found candidates with more experience in machine learning.',
  },
  {
    id: '5',
    job_title: 'Frontend Developer',
    company: 'Web Solutions',
    location: 'Remote',
    applied_date: '2023-05-20',
    status: 'accepted',
    match_score: 95,
    job_id: '6',
    offer_details: {
      salary: '$110,000',
      start_date: '2023-07-15',
      benefits: ['Health Insurance', '401k', 'Remote Work'],
    },
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

const ApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // In a real app, we would call the API
        // const data = await getApplications();
        
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setApplications(mockApplications);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);
  
  // Filter applications based on search term and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.applied_date) - new Date(a.applied_date);
    } else if (sortBy === 'score') {
      return b.match_score - a.match_score;
    }
    return 0;
  });
  
  // Group applications by status
  const applicationsByStatus = {
    pending: sortedApplications.filter(app => app.status === 'pending'),
    reviewing: sortedApplications.filter(app => app.status === 'reviewing'),
    interviewing: sortedApplications.filter(app => app.status === 'interviewing'),
    accepted: sortedApplications.filter(app => app.status === 'accepted'),
    rejected: sortedApplications.filter(app => app.status === 'rejected'),
  };
  
  // Calculate statistics
  const stats = {
    total: applications.length,
    active: applications.filter(app => ['pending', 'reviewing', 'interviewing'].includes(app.status)).length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    averageScore: applications.length > 0 
      ? Math.round(applications.reduce((sum, app) => sum + app.match_score, 0) / applications.length) 
      : 0,
  };
  
  // Card styles
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');
  
  // Render application card
  const renderApplicationCard = (application) => (
    <Box
      key={application.id}
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg={cardBg}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
        bg: cardHoverBg,
      }}
      transition="all 0.3s"
    >
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Heading size="md" noOfLines={1}>{application.job_title}</Heading>
        <Badge 
          colorScheme={statusColors[application.status]} 
          fontSize="0.8em" 
          p={1} 
          borderRadius="full"
        >
          <HStack spacing={1}>
            <Icon as={statusIcons[application.status]} />
            <Text>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</Text>
          </HStack>
        </Badge>
      </Flex>
      
      <VStack align="start" spacing={1} mb={3}>
        <HStack>
          <Icon as={FaBuilding} color="gray.500" />
          <Text color="gray.600">{application.company}</Text>
        </HStack>
        
        <HStack>
          <Icon as={FaMapMarkerAlt} color="gray.500" />
          <Text color="gray.600">{application.location}</Text>
        </HStack>
        
        <HStack>
          <Icon as={FaCalendarAlt} color="gray.500" />
          <Text color="gray.600">Applied on {new Date(application.applied_date).toLocaleDateString()}</Text>
        </HStack>
      </VStack>
      
      <Box mb={4}>
        <Text fontWeight="medium" mb={1}>Match Score</Text>
        <Flex align="center">
          <Progress 
            value={application.match_score} 
            colorScheme={application.match_score >= 80 ? 'green' : 
                        application.match_score >= 60 ? 'yellow' : 'red'} 
            size="sm" 
            borderRadius="full" 
            flex="1" 
            mr={2} 
          />
          <Badge 
            colorScheme={application.match_score >= 80 ? 'green' : 
                        application.match_score >= 60 ? 'yellow' : 'red'}
          >
            {application.match_score}%
          </Badge>
        </Flex>
      </Box>
      
      {application.status === 'rejected' && application.feedback && (
        <Box mb={4} p={2} bg="red.50" borderRadius="md">
          <Text fontWeight="medium" color="red.600">Feedback:</Text>
          <Text fontSize="sm">{application.feedback}</Text>
        </Box>
      )}
      
      {application.status === 'accepted' && application.offer_details && (
        <Box mb={4} p={2} bg="green.50" borderRadius="md">
          <Text fontWeight="medium" color="green.600">Offer Details:</Text>
          <Text fontSize="sm">Salary: {application.offer_details.salary}</Text>
          <Text fontSize="sm">Start Date: {application.offer_details.start_date}</Text>
          <Flex mt={1} flexWrap="wrap" gap={1}>
            {application.offer_details.benefits.map((benefit, index) => (
              <Tag key={index} size="sm" colorScheme="green" variant="subtle">
                <TagLeftIcon as={FaCheckCircle} />
                <TagLabel>{benefit}</TagLabel>
              </Tag>
            ))}
          </Flex>
        </Box>
      )}
      
      <Flex justify="space-between">
        <Button 
          as={NextLink} 
          href={`/jobs/${application.job_id}`} 
          variant="outline" 
          colorScheme="blue" 
          size="sm"
        >
          View Job
        </Button>
        <Button 
          as={NextLink} 
          href={`/applications/${application.id}`} 
          colorScheme="blue" 
          size="sm"
        >
          View Details
        </Button>
      </Flex>
    </Box>
  );
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={2}>My Applications</Heading>
      <Text color="gray.600" mb={8}>
        Track and manage your job applications
      </Text>
      
      {/* Statistics */}
      <StatGroup 
        mb={8} 
        bg={useColorModeValue('white', 'gray.700')} 
        p={4} 
        borderRadius="lg" 
        boxShadow="md"
      >
        <Stat>
          <StatLabel>Total Applications</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
          <StatHelpText>All time</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Active Applications</StatLabel>
          <StatNumber>{stats.active}</StatNumber>
          <StatHelpText>In progress</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Success Rate</StatLabel>
          <StatNumber>
            {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
          </StatNumber>
          <StatHelpText>{stats.accepted} accepted</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Average Match Score</StatLabel>
          <StatNumber>{stats.averageScore}%</StatNumber>
          <StatHelpText>
            <Icon as={FaChartLine} mr={1} />
            Job compatibility
          </StatHelpText>
        </Stat>
      </StatGroup>
      
      {/* Filters */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        mb={6} 
        gap={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search by job title or company" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <HStack spacing={4}>
          <Select 
            maxW="200px" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            icon={<FaFilter />}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interviewing">Interviewing</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </Select>
          
          <Select 
            maxW="200px"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Match Score</option>
          </Select>
        </HStack>
      </Flex>
      
      {/* Loading State */}
      {loading && (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text ml={4} fontSize="lg">Loading your applications...</Text>
        </Flex>
      )}
      
      {/* Error State */}
      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* No Applications */}
      {!loading && !error && applications.length === 0 && (
        <Box 
          textAlign="center" 
          py={10} 
          px={6} 
          borderWidth="1px" 
          borderRadius="lg"
          bg={cardBg}
        >
          <Heading size="lg" mb={3}>No applications yet</Heading>
          <Text color="gray.600" mb={6}>
            You haven't applied to any jobs yet. Start your job search and apply to positions that match your skills.
          </Text>
          <Button 
            as={NextLink}
            href="/jobs"
            colorScheme="blue"
            leftIcon={<Icon as={FaBriefcase} />}
          >
            Browse Jobs
          </Button>
        </Box>
      )}
      
      {/* Applications List */}
      {!loading && !error && applications.length > 0 && (
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>All ({sortedApplications.length})</Tab>
            <Tab>Pending ({applicationsByStatus.pending.length})</Tab>
            <Tab>Reviewing ({applicationsByStatus.reviewing.length})</Tab>
            <Tab>Interviewing ({applicationsByStatus.interviewing.length})</Tab>
            <Tab>Accepted ({applicationsByStatus.accepted.length})</Tab>
            <Tab>Rejected ({applicationsByStatus.rejected.length})</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              {sortedApplications.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">No applications found with the current filters</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {sortedApplications.map(renderApplicationCard)}
                </SimpleGrid>
              )}
            </TabPanel>
            
            <TabPanel px={0}>
              {applicationsByStatus.pending.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">No pending applications</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {applicationsByStatus.pending.map(renderApplicationCard)}
                </SimpleGrid>
              )}
            </TabPanel>
            
            <TabPanel px={0}>
              {applicationsByStatus.reviewing.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">No applications under review</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {applicationsByStatus.reviewing.map(renderApplicationCard)}
                </SimpleGrid>
              )}
            </TabPanel>
            
            <TabPanel px={0}>
              {applicationsByStatus.interviewing.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">No applications in interview stage</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {applicationsByStatus.interviewing.map(renderApplicationCard)}
                </SimpleGrid>
              )}
            </TabPanel>
            
            <TabPanel px={0}>
              {applicationsByStatus.accepted.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">No accepted applications</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {applicationsByStatus.accepted.map(renderApplicationCard)}
                </SimpleGrid>
              )}
            </TabPanel>
            
            <TabPanel px={0}>
              {applicationsByStatus.rejected.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text fontSize="lg" color="gray.500">No rejected applications</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {applicationsByStatus.rejected.map(renderApplicationCard)}
                </SimpleGrid>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Container>
  );
};

export default withAuth(ApplicationsPage, { requiredRole: 'jobseeker' });
