import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Link,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Badge,
  Select,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import NextLink from 'next/link';
import { getJobs } from '../../utils/api';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // In a real app, this would call the API
        // const data = await getJobs();

        // For now, simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = [
          {
            id: '1',
            title: 'Software Engineer',
            company: 'Tech Solutions Inc.',
            location: 'Remote',
            description: 'We are looking for a talented software engineer to join our team with experience in React, Node.js, and cloud platforms.',
            posted_date: '2023-06-01',
            salary_range: '$100,000 - $130,000',
            job_type: 'Full-time'
          },
          {
            id: '2',
            title: 'Product Manager',
            company: 'Innovative Products',
            location: 'New York, NY',
            description: 'Experienced product manager needed to lead our product development efforts. Must have 3+ years of experience in SaaS products.',
            posted_date: '2023-06-05',
            salary_range: '$110,000 - $140,000',
            job_type: 'Full-time'
          },
          {
            id: '3',
            title: 'UX Designer',
            company: 'Creative Designs',
            location: 'San Francisco, CA',
            description: 'Join our design team to create beautiful and intuitive user experiences. Experience with Figma and user research required.',
            posted_date: '2023-06-08',
            salary_range: '$90,000 - $120,000',
            job_type: 'Full-time'
          },
          {
            id: '4',
            title: 'Data Scientist',
            company: 'Data Insights',
            location: 'Remote',
            description: 'Looking for a data scientist with expertise in machine learning, statistical analysis, and data visualization.',
            posted_date: '2023-06-10',
            salary_range: '$115,000 - $145,000',
            job_type: 'Full-time'
          },
          {
            id: '5',
            title: 'Marketing Specialist',
            company: 'Growth Marketing',
            location: 'Chicago, IL',
            description: 'Digital marketing specialist needed to help grow our online presence and lead generation efforts.',
            posted_date: '2023-06-12',
            salary_range: '$70,000 - $90,000',
            job_type: 'Full-time'
          },
          {
            id: '6',
            title: 'Frontend Developer',
            company: 'Web Solutions',
            location: 'Remote',
            description: 'Frontend developer with React expertise needed for our growing team. Work on exciting projects for various clients.',
            posted_date: '2023-06-15',
            salary_range: '$85,000 - $110,000',
            job_type: 'Contract'
          }
        ];

        setJobs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load job listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search term and location
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      locationFilter === 'all' ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const locations = ['all', ...new Set(jobs.map(job => job.location))];

  // Card background and hover effect
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');

  return (
    <Container maxW="container.xl" py={8}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={8}
        gap={4}
      >
        <Box>
          <Heading as="h1" size="xl">Job Listings</Heading>
          <Text color="gray.600" mt={1}>
            Browse available positions and find your next opportunity
          </Text>
        </Box>
        <Button
          as={NextLink}
          href="/jobs/create"
          colorScheme="blue"
          leftIcon={<Icon as={FaBriefcase} />}
        >
          Post a Job
        </Button>
      </Flex>

      {/* Search and Filter */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        mb={8}
        gap={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search jobs by title, company, or keywords"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW={{ base: 'full', md: '200px' }}
          icon={<FaMapMarkerAlt />}
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="all">All Locations</option>
          {locations.filter(loc => loc !== 'all').map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </Select>
      </Flex>

      {/* Loading State */}
      {loading && (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text ml={4} fontSize="lg">Loading jobs...</Text>
        </Flex>
      )}

      {/* Error State */}
      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Results */}
      {!loading && !error && filteredJobs.length === 0 && (
        <Box textAlign="center" py={10}>
          <Heading size="md" mb={2}>No jobs found</Heading>
          <Text color="gray.500">
            Try adjusting your search or filter criteria
          </Text>
        </Box>
      )}

      {/* Job Listings */}
      {!loading && !error && filteredJobs.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredJobs.map(job => (
            <Box
              key={job.id}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="md"
              bg={cardBg}
              _hover={{
                transform: 'translateY(-5px)',
                boxShadow: 'lg',
                bg: cardHoverBg
              }}
              transition="all 0.3s"
            >
              <Heading size="md" mb={2}>{job.title}</Heading>
              <Text color="gray.500" fontSize="sm" mb={2}>
                <Icon as={FaBriefcase} mr={1} />
                {job.company}
                <Icon as={FaMapMarkerAlt} ml={2} mr={1} />
                {job.location}
              </Text>

              <HStack mb={3} spacing={2}>
                <Badge colorScheme="blue">{job.job_type}</Badge>
                <Badge colorScheme="green">{job.salary_range}</Badge>
              </HStack>

              <Text noOfLines={3} mb={4}>{job.description}</Text>

              <Text fontSize="sm" color="gray.500" mb={4}>
                Posted on {new Date(job.posted_date).toLocaleDateString()}
              </Text>

              <Flex justify="space-between">
                <Button
                  as={NextLink}
                  href={`/jobs/${job.id}`}
                  variant="outline"
                  colorScheme="blue"
                  size="sm"
                >
                  View Details
                </Button>
                <Button
                  as={NextLink}
                  href={`/jobs/${job.id}/apply`}
                  colorScheme="blue"
                  size="sm"
                >
                  Apply Now
                </Button>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default JobsPage;
