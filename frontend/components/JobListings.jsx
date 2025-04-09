import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  Input,
  Select,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Stack,
  Divider,
  useColorModeValue,
  Link,
  HStack,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { SearchIcon, TimeIcon, BriefcaseIcon, LocationIcon } from '@chakra-ui/icons';
import { FaBuilding, FaMapMarkerAlt, FaClock, FaBriefcase, FaSearch } from 'react-icons/fa';
import NextLink from 'next/link';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Fetch companies for the filter
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (companyFilter) params.append('company_id', companyFilter);
        params.append('page', pagination.page);
        params.append('limit', pagination.pageSize);
        
        const response = await fetch(`/api/jobs?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const data = await response.json();
        setJobs(data.jobs);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [search, companyFilter, pagination.page, pagination.pageSize]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const handleCompanyFilterChange = (e) => {
    setCompanyFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new filter
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && jobs.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading jobs...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading jobs: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>
        Job Listings
      </Heading>

      <Flex direction={{ base: 'column', md: 'row' }} mb={6} gap={4}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search jobs by title or description"
            value={search}
            onChange={handleSearchChange}
          />
        </InputGroup>

        <Select
          placeholder="Filter by company"
          value={companyFilter}
          onChange={handleCompanyFilterChange}
          maxW={{ base: '100%', md: '250px' }}
        >
          <option value="">All Companies</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </Select>
      </Flex>

      {jobs.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No jobs found matching your criteria. Try adjusting your search or filters.
        </Alert>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {jobs.map(job => (
              <Card 
                key={job.id} 
                borderWidth="1px" 
                borderColor={borderColor}
                bg={cardBg}
                boxShadow="md"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
              >
                <CardHeader pb={0}>
                  <Heading size="md" noOfLines={2}>{job.title}</Heading>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    <Icon as={FaBuilding} mr={1} />
                    {job.companies?.name || 'Unknown Company'}
                  </Text>
                </CardHeader>

                <CardBody>
                  <Text noOfLines={3} mb={4}>
                    {job.description}
                  </Text>
                  
                  <Stack direction="row" flexWrap="wrap" spacing={2} mb={3}>
                    {job.required_skills && job.required_skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} colorScheme="blue" variant="subtle" px={2} py={1}>
                        {skill}
                      </Badge>
                    ))}
                    {job.required_skills && job.required_skills.length > 3 && (
                      <Tooltip label={job.required_skills.slice(3).join(', ')}>
                        <Badge colorScheme="gray" px={2} py={1}>
                          +{job.required_skills.length - 3} more
                        </Badge>
                      </Tooltip>
                    )}
                  </Stack>
                  
                  <HStack spacing={4} mt={2} color="gray.500" fontSize="sm">
                    {job.department && (
                      <Flex align="center">
                        <Icon as={FaBriefcase} mr={1} />
                        <Text>{job.department}</Text>
                      </Flex>
                    )}
                    <Flex align="center">
                      <Icon as={FaClock} mr={1} />
                      <Text>
                        {new Date(job.created_at).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </HStack>
                </CardBody>

                <Divider />

                <CardFooter>
                  <Flex justify="space-between" width="100%">
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
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Flex justify="center" mt={8}>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  isDisabled={pagination.page === 1}
                >
                  First
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  isDisabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                <Text>
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
                
                <Button
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  isDisabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  isDisabled={pagination.page === pagination.totalPages}
                >
                  Last
                </Button>
              </HStack>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default JobListings;
