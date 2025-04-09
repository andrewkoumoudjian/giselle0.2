import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Text, Alert, AlertIcon, Button, Flex } from '@chakra-ui/react';
import JobPosting from '../../../components/JobPosting';
import NextLink from 'next/link';

const JobDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${id}`);

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
        console.error('Error fetching job:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh" direction="column">
        <Spinner size="xl" mb={4} />
        <Text>Loading job details...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
        <Button as={NextLink} href="/jobs" colorScheme="blue">
          View All Jobs
        </Button>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box p={8}>
        <Alert status="info" mb={6}>
          <AlertIcon />
          Job not found
        </Alert>
        <Button as={NextLink} href="/jobs" colorScheme="blue">
          View All Jobs
        </Button>
      </Box>
    );
  }

  return <JobPosting job={job} />;
};

export default JobDetailPage;
