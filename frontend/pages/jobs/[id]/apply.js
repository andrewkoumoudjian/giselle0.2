import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  Spinner,
  Flex
} from '@chakra-ui/react';
import NextLink from 'next/link';
import SimpleApplicationForm from '../../../components/SimpleApplicationForm';

const JobApplicationPage = () => {
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
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" direction="column">
          <Spinner size="xl" />
          <Text mt={4}>Loading job details...</Text>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
        <Button as={NextLink} href="/jobs" colorScheme="blue">
          View All Jobs
        </Button>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="info" mb={6}>
          <AlertIcon />
          Job not found
        </Alert>
        <Button as={NextLink} href="/jobs" colorScheme="blue">
          View All Jobs
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
          <BreadcrumbLink>Apply</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Box mb={8}>
        <Heading as="h1" size="xl">Apply for {job.title}</Heading>
        <Text mt={2} color="gray.600">
          at {job.companies?.name || 'Unknown Company'}
        </Text>
      </Box>

      <SimpleApplicationForm jobId={id} jobTitle={job.title} />
    </Container>
  );
};

export default JobApplicationPage;
