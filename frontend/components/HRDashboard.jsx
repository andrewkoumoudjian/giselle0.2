import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
  VStack,
  Divider,
  Avatar,
  AvatarGroup,
  Progress,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaChevronDown, 
  FaFilter, 
  FaUserPlus, 
  FaBriefcase, 
  FaUsers, 
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaChartBar,
  FaCalendarAlt,
  FaSortAmountDown,
  FaSortAmountUp,
} from 'react-icons/fa';
import NextLink from 'next/link';

// Status badge colors
const statusColors = {
  pending: 'yellow',
  reviewing: 'blue',
  interviewing: 'purple',
  rejected: 'red',
  accepted: 'green',
};

// Match score colors
const getMatchScoreColor = (score) => {
  if (score >= 85) return 'green';
  if (score >= 70) return 'blue';
  if (score >= 50) return 'yellow';
  return 'red';
};

const HRDashboard = () => {
  const [activeJobs, setActiveJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    averageMatchScore: 0,
    pendingReview: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Fetch jobs and applications data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch jobs
        const jobsResponse = await fetch('/api/jobs');
        if (!jobsResponse.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const jobsData = await jobsResponse.json();
        setActiveJobs(jobsData.jobs || []);
        
        // Fetch applications (all or filtered by job)
        const applicationsUrl = selectedJob !== 'all' 
          ? `/api/jobs/${selectedJob}/applications` 
          : '/api/applications';
        
        // Add query parameters for filtering
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        
        const applicationsResponse = await fetch(`${applicationsUrl}${params.toString() ? '?' + params.toString() : ''}`);
        if (!applicationsResponse.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const applicationsData = await applicationsResponse.json();
        const applicationsList = Array.isArray(applicationsData) 
          ? applicationsData 
          : (applicationsData.applications || []);
        
        // Filter by search query if provided
        const filteredApplications = searchQuery 
          ? applicationsList.filter(app => 
              app.candidates.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              app.candidates.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : applicationsList;
        
        // Sort applications
        const sortedApplications = [...filteredApplications].sort((a, b) => {
          // Handle nested fields
          const aValue = sortField.includes('.') 
            ? sortField.split('.').reduce((obj, key) => obj?.[key], a)
            : a[sortField];
          const bValue = sortField.includes('.')
            ? sortField.split('.').reduce((obj, key) => obj?.[key], b)
            : b[sortField];
            
          // Compare based on sort direction
          if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        setApplications(sortedApplications);
        
        // Calculate stats
        const totalJobs = jobsData.jobs?.length || 0;
        const totalApplications = applicationsList.length;
        const scores = applicationsList.filter(app => app.match_score).map(app => app.match_score);
        const averageScore = scores.length > 0 
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) 
          : 0;
        const pendingReview = applicationsList.filter(app => app.status === 'pending').length;
        
        setStats({
          totalJobs,
          totalApplications,
          averageMatchScore: averageScore,
          pendingReview,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedJob, statusFilter, searchQuery, sortField, sortDirection]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Update the local state
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message);
    }
  };

  const handleCreateInterview = async (applicationId) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create interview');
      }

      // Update the application status in the local state
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: 'interviewing' } : app
        )
      );
    } catch (err) {
      console.error('Error creating interview:', err);
      setError(err.message);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  if (loading && applications.length === 0) {
    return (
      <Flex justify="center" align="center" h="50vh" direction="column">
        <Spinner size="xl" mb={4} />
        <Text>Loading dashboard data...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        Error loading dashboard: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>
        HR Dashboard
      </Heading>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={FaBriefcase} color="blue.500" boxSize={5} mr={2} />
                <StatLabel fontSize="lg">Active Jobs</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">{stats.totalJobs}</StatNumber>
              <StatHelpText>
                <Button as={NextLink} href="/jobs/create" size="sm" leftIcon={<FaUserPlus />} colorScheme="blue" variant="ghost">
                  Post New Job
                </Button>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={FaUsers} color="green.500" boxSize={5} mr={2} />
                <StatLabel fontSize="lg">Total Applications</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">{stats.totalApplications}</StatNumber>
              <StatHelpText>
                <Badge colorScheme="yellow" fontSize="sm" borderRadius="full" px={2}>
                  {stats.pendingReview} pending review
                </Badge>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={FaChartBar} color="purple.500" boxSize={5} mr={2} />
                <StatLabel fontSize="lg">Average Match Score</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">{stats.averageMatchScore}%</StatNumber>
              <StatHelpText>
                <Progress 
                  value={stats.averageMatchScore} 
                  size="sm" 
                  colorScheme={getMatchScoreColor(stats.averageMatchScore)}
                  borderRadius="full"
                  mt={1}
                />
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={FaCalendarAlt} color="orange.500" boxSize={5} mr={2} />
                <StatLabel fontSize="lg">Interviews Scheduled</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">
                {applications.filter(app => app.status === 'interviewing').length}
              </StatNumber>
              <StatHelpText>
                This week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        mb={6} 
        gap={4}
        p={4}
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="sm"
        align="center"
      >
        <Box flex="1">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search candidates by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Box>

        <HStack spacing={4}>
          <Select
            placeholder="Filter by job"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            maxW="200px"
            icon={<FaChevronDown />}
          >
            <option value="all">All Jobs</option>
            {activeJobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="200px"
            icon={<FaChevronDown />}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </Select>

          <Menu>
            <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="outline">
              <Flex align="center">
                <Icon as={sortDirection === 'asc' ? FaSortAmountUp : FaSortAmountDown} mr={2} />
                Sort
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => { setSortField('created_at'); toggleSortDirection(); }}>
                Date Applied
              </MenuItem>
              <MenuItem onClick={() => { setSortField('match_score'); toggleSortDirection(); }}>
                Match Score
              </MenuItem>
              <MenuItem onClick={() => { setSortField('candidates.name'); toggleSortDirection(); }}>
                Candidate Name
              </MenuItem>
              <MenuItem onClick={() => { setSortField('status'); toggleSortDirection(); }}>
                Status
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Applications Table */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md" overflow="hidden">
        <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
          <Heading size="md">
            {selectedJob === 'all' 
              ? 'All Applications' 
              : `Applications for ${activeJobs.find(job => job.id === selectedJob)?.title || 'Selected Job'}`}
          </Heading>
        </CardHeader>
        <CardBody p={0}>
          {applications.length === 0 ? (
            <Box p={8} textAlign="center">
              <Icon as={FaUsers} boxSize={12} color="gray.300" mb={4} />
              <Heading size="md" mb={2}>No applications found</Heading>
              <Text color="gray.500">
                {searchQuery || statusFilter || selectedJob !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Post a job to start receiving applications'}
              </Text>
              {!activeJobs.length && (
                <Button
                  as={NextLink}
                  href="/jobs/create"
                  mt={4}
                  colorScheme="blue"
                  leftIcon={<FaBriefcase />}
                >
                  Post a Job
                </Button>
              )}
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Tr>
                    <Th>Candidate</Th>
                    <Th>Job</Th>
                    <Th>Match Score</Th>
                    <Th>Status</Th>
                    <Th>Applied</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {applications.map((application) => (
                    <Tr key={application.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Td>
                        <Flex align="center">
                          <Avatar size="sm" name={application.candidates.name} mr={3} />
                          <Box>
                            <Text fontWeight="bold">{application.candidates.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {application.candidates.email}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        {application.job ? (
                          <NextLink href={`/jobs/${application.job.id}`} passHref>
                            <Text color="blue.500" fontWeight="medium" cursor="pointer">
                              {application.job.title}
                            </Text>
                          </NextLink>
                        ) : (
                          <Text>Unknown Job</Text>
                        )}
                      </Td>
                      <Td>
                        {application.match_score ? (
                          <Badge
                            colorScheme={getMatchScoreColor(application.match_score)}
                            fontSize="sm"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {application.match_score}%
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.500">Not analyzed</Text>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={statusColors[application.status]} px={2} py={1} borderRadius="full">
                          {application.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(application.created_at).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Menu>
                            <MenuButton as={Button} size="sm" rightIcon={<FaChevronDown />}>
                              Status
                            </MenuButton>
                            <MenuList>
                              <MenuItem 
                                icon={<Icon as={FaCheckCircle} color="yellow.500" />}
                                onClick={() => handleStatusChange(application.id, 'pending')}
                              >
                                Pending
                              </MenuItem>
                              <MenuItem 
                                icon={<Icon as={FaCheckCircle} color="blue.500" />}
                                onClick={() => handleStatusChange(application.id, 'reviewing')}
                              >
                                Reviewing
                              </MenuItem>
                              <MenuItem 
                                icon={<Icon as={FaCheckCircle} color="purple.500" />}
                                onClick={() => handleStatusChange(application.id, 'interviewing')}
                              >
                                Interviewing
                              </MenuItem>
                              <MenuItem 
                                icon={<Icon as={FaCheckCircle} color="green.500" />}
                                onClick={() => handleStatusChange(application.id, 'accepted')}
                              >
                                Accepted
                              </MenuItem>
                              <MenuItem 
                                icon={<Icon as={FaTimesCircle} color="red.500" />}
                                onClick={() => handleStatusChange(application.id, 'rejected')}
                              >
                                Rejected
                              </MenuItem>
                            </MenuList>
                          </Menu>
                          
                          {application.status !== 'interviewing' && (
                            <Button
                              size="sm"
                              colorScheme="purple"
                              onClick={() => handleCreateInterview(application.id)}
                              leftIcon={<Icon as={FaUserCheck} />}
                            >
                              Interview
                            </Button>
                          )}
                          
                          <Button
                            as={NextLink}
                            href={`/applications/${application.id}`}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                          >
                            View
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default HRDashboard;
