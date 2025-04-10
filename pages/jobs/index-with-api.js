import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FaFilter } from 'react-icons/fa';
import JobCard from '../../components/JobCard';
import TailwindJobCard from '../../components/TailwindJobCard';
import { getJobs } from '../../utils/api';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [useTailwind, setUseTailwind] = useState(false);
  
  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Prepare query parameters
        const params = {
          page,
          limit: 12,
          sortBy,
        };
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        if (locationFilter) {
          params.location = locationFilter;
        }
        
        if (jobTypeFilter) {
          params.jobType = jobTypeFilter;
        }
        
        // Call the API
        const response = await getJobs(params);
        
        // Update state with response data
        setJobs(response.jobs);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [page, searchTerm, locationFilter, jobTypeFilter, sortBy]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Handle location filter change
  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle job type filter change
  const handleJobTypeChange = (e) => {
    setJobTypeFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page when sort changes
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };
  
  // Toggle between Chakra UI and Tailwind CSS components
  const toggleDesign = () => {
    setUseTailwind(!useTailwind);
  };
  
  // Background colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>Browse Jobs</Heading>
          <Text color="gray.600">
            Find your next career opportunity
          </Text>
        </Box>
        <Button onClick={toggleDesign} colorScheme="blue" variant="outline">
          {useTailwind ? 'Use Chakra UI' : 'Use Tailwind CSS'}
        </Button>
      </Flex>
      
      {/* Filters */}
      <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" mb={8}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Search jobs by title, company, or keywords" 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </InputGroup>
          
          <Select 
            placeholder="All Locations" 
            maxW={{ base: '100%', md: '200px' }}
            value={locationFilter}
            onChange={handleLocationChange}
            icon={<FaFilter />}
          >
            <option value="remote">Remote</option>
            <option value="new-york">New York, NY</option>
            <option value="san-francisco">San Francisco, CA</option>
            <option value="chicago">Chicago, IL</option>
            <option value="austin">Austin, TX</option>
          </Select>
          
          <Select 
            placeholder="All Job Types" 
            maxW={{ base: '100%', md: '200px' }}
            value={jobTypeFilter}
            onChange={handleJobTypeChange}
            icon={<FaFilter />}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </Select>
          
          <Select 
            maxW={{ base: '100%', md: '200px' }}
            value={sortBy}
            onChange={handleSortChange}
            icon={<ChevronDownIcon />}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="salary-high">Highest Salary</option>
            <option value="salary-low">Lowest Salary</option>
          </Select>
        </Flex>
      </Box>
      
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
          {error}
        </Alert>
      )}
      
      {/* No Results */}
      {!loading && !error && jobs.length === 0 && (
        <Box textAlign="center" py={10}>
          <Heading size="lg" mb={3}>No jobs found</Heading>
          <Text color="gray.600" mb={6}>
            Try adjusting your search filters or check back later for new opportunities.
          </Text>
        </Box>
      )}
      
      {/* Job Listings */}
      {!loading && !error && jobs.length > 0 && (
        <>
          <Text mb={4} color="gray.600">
            Showing {jobs.length} jobs
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
            {jobs.map((job) => (
              useTailwind ? (
                <TailwindJobCard key={job.id} job={job} />
              ) : (
                <JobCard key={job.id} job={job} />
              )
            ))}
          </SimpleGrid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" mt={8}>
              <Button
                onClick={() => handlePageChange(page - 1)}
                isDisabled={page === 1}
                mr={2}
              >
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  colorScheme={page === i + 1 ? 'blue' : 'gray'}
                  variant={page === i + 1 ? 'solid' : 'outline'}
                  mx={1}
                >
                  {i + 1}
                </Button>
              ))}
              
              <Button
                onClick={() => handlePageChange(page + 1)}
                isDisabled={page === totalPages}
                ml={2}
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      )}
    </Container>
  );
};

export default JobsPage;
