import React, { useState, useEffect } from 'react';
import { withAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaBriefcase,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';
import NextLink from 'next/link';

// Mock data for dashboard
const mockStats = {
  activeJobs: 12,
  totalApplications: 143,
  newApplications: 28,
  averageScore: 76,
};

const mockApplications = [
  {
    id: '1',
    candidate: 'John Smith',
    position: 'Software Engineer',
    date: '2023-06-15',
    status: 'pending',
    matchScore: 85,
  },
  {
    id: '2',
    candidate: 'Sarah Johnson',
    position: 'Product Manager',
    date: '2023-06-14',
    status: 'reviewing',
    matchScore: 92,
  },
  {
    id: '3',
    candidate: 'Michael Brown',
    position: 'UX Designer',
    date: '2023-06-13',
    status: 'interviewing',
    matchScore: 78,
  },
  {
    id: '4',
    candidate: 'Emily Davis',
    position: 'Software Engineer',
    date: '2023-06-12',
    status: 'rejected',
    matchScore: 65,
  },
  {
    id: '5',
    candidate: 'David Wilson',
    position: 'Data Scientist',
    date: '2023-06-11',
    status: 'accepted',
    matchScore: 95,
  },
];

const mockJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    applications: 45,
    status: 'active',
    posted: '2023-06-01',
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    applications: 32,
    status: 'active',
    posted: '2023-06-05',
  },
  {
    id: '3',
    title: 'UX Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    applications: 28,
    status: 'active',
    posted: '2023-06-08',
  },
  {
    id: '4',
    title: 'Data Scientist',
    department: 'Data',
    location: 'Remote',
    applications: 19,
    status: 'active',
    posted: '2023-06-10',
  },
  {
    id: '5',
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Chicago, IL',
    applications: 12,
    status: 'draft',
    posted: '2023-06-12',
  },
];

// Status badge color mapping
const statusColors = {
  pending: 'yellow',
  reviewing: 'blue',
  interviewing: 'purple',
  rejected: 'red',
  accepted: 'green',
  active: 'green',
  draft: 'gray',
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Filter applications based on search term and status
  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'score') {
      return b.matchScore - a.matchScore;
    }
    return 0;
  });

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={2}>HR Dashboard</Heading>
      <Text color="gray.600" mb={8}>
        Manage your job listings and applications
      </Text>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat
          px={4}
          py={5}
          bg={useColorModeValue('white', 'gray.700')}
          shadow="base"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="blue.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel fontWeight="medium">Active Jobs</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="medium">
                {mockStats.activeJobs}
              </StatNumber>
              <StatHelpText mb={0}>
                Job listings currently active
              </StatHelpText>
            </Box>
            <Flex
              alignItems="center"
              justifyContent="center"
              rounded="full"
              bg="blue.100"
              color="blue.600"
              h={12}
              w={12}
            >
              <Icon as={FaBriefcase} boxSize={6} />
            </Flex>
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={5}
          bg={useColorModeValue('white', 'gray.700')}
          shadow="base"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="green.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel fontWeight="medium">Total Applications</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="medium">
                {mockStats.totalApplications}
              </StatNumber>
              <StatHelpText mb={0}>
                <Text as="span" color="green.500">+{mockStats.newApplications}</Text> since last week
              </StatHelpText>
            </Box>
            <Flex
              alignItems="center"
              justifyContent="center"
              rounded="full"
              bg="green.100"
              color="green.600"
              h={12}
              w={12}
            >
              <Icon as={FaUsers} boxSize={6} />
            </Flex>
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={5}
          bg={useColorModeValue('white', 'gray.700')}
          shadow="base"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="purple.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel fontWeight="medium">Average Match Score</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="medium">
                {mockStats.averageScore}%
              </StatNumber>
              <StatHelpText mb={0}>
                Based on all applications
              </StatHelpText>
            </Box>
            <Flex
              alignItems="center"
              justifyContent="center"
              rounded="full"
              bg="purple.100"
              color="purple.600"
              h={12}
              w={12}
            >
              <Icon as={FaChartLine} boxSize={6} />
            </Flex>
          </Flex>
        </Stat>

        <Stat
          px={4}
          py={5}
          bg={useColorModeValue('white', 'gray.700')}
          shadow="base"
          rounded="lg"
          borderLeft="4px solid"
          borderColor="orange.400"
        >
          <Flex justifyContent="space-between">
            <Box>
              <StatLabel fontWeight="medium">New Applications</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="medium">
                {mockStats.newApplications}
              </StatNumber>
              <StatHelpText mb={0}>
                In the last 7 days
              </StatHelpText>
            </Box>
            <Flex
              alignItems="center"
              justifyContent="center"
              rounded="full"
              bg="orange.100"
              color="orange.600"
              h={12}
              w={12}
            >
              <Icon as={FaUsers} boxSize={6} />
            </Flex>
          </Flex>
        </Stat>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Box
        bg={useColorModeValue('white', 'gray.700')}
        shadow="base"
        rounded="lg"
        p={4}
      >
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>Applications</Tab>
            <Tab>Job Listings</Tab>
          </TabList>

          <TabPanels>
            {/* Applications Tab */}
            <TabPanel px={0}>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'stretch', md: 'center' }}
                mb={4}
                gap={4}
              >
                <InputGroup maxW={{ md: '320px' }}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <HStack spacing={4}>
                  <Select
                    maxW="200px"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    leftIcon={<FaFilter />}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
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

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Candidate</Th>
                      <Th>Position</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th isNumeric>Match Score</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedApplications.map((application) => (
                      <Tr key={application.id}>
                        <Td fontWeight="medium">{application.candidate}</Td>
                        <Td>{application.position}</Td>
                        <Td>{new Date(application.date).toLocaleDateString()}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[application.status]}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge
                            colorScheme={application.matchScore >= 80 ? 'green' :
                                        application.matchScore >= 70 ? 'yellow' : 'red'}
                            variant="solid"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {application.matchScore}%
                          </Badge>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm" variant="outline">
                              Actions
                            </MenuButton>
                            <MenuList>
                              <MenuItem icon={<FaEye />}>View Details</MenuItem>
                              <MenuItem icon={<FaEdit />}>Change Status</MenuItem>
                              <MenuItem icon={<FaTrash />} color="red.500">Delete</MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {sortedApplications.length === 0 && (
                  <Box textAlign="center" py={10}>
                    <Text fontSize="lg" color="gray.500">No applications found</Text>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Job Listings Tab */}
            <TabPanel px={0}>
              <Flex
                justify="space-between"
                align="center"
                mb={4}
              >
                <InputGroup maxW="320px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Search jobs..." />
                </InputGroup>

                <Button
                  as={NextLink}
                  href="/jobs/create"
                  colorScheme="blue"
                  leftIcon={<FaPlus />}
                >
                  Post New Job
                </Button>
              </Flex>

              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Job Title</Th>
                      <Th>Department</Th>
                      <Th>Location</Th>
                      <Th isNumeric>Applications</Th>
                      <Th>Status</Th>
                      <Th>Posted Date</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mockJobs.map((job) => (
                      <Tr key={job.id}>
                        <Td fontWeight="medium">
                          <Link as={NextLink} href={`/jobs/${job.id}`} color="blue.500">
                            {job.title}
                          </Link>
                        </Td>
                        <Td>{job.department}</Td>
                        <Td>{job.location}</Td>
                        <Td isNumeric>{job.applications}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[job.status]}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                        </Td>
                        <Td>{new Date(job.posted).toLocaleDateString()}</Td>
                        <Td>
                          <Menu>
                            <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm" variant="outline">
                              Actions
                            </MenuButton>
                            <MenuList>
                              <MenuItem icon={<FaEye />}>View Details</MenuItem>
                              <MenuItem icon={<FaEdit />}>Edit Job</MenuItem>
                              <MenuItem icon={<FaUsers />}>View Applicants</MenuItem>
                              <MenuItem icon={<FaTrash />} color="red.500">Delete</MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

// Wrap the Dashboard component with the withAuth HOC to protect this route
// Only users with the 'employer' role can access this page
export default withAuth(Dashboard, { requiredRole: 'employer' });
