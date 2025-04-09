import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Link
} from '@chakra-ui/react';
import NextLink from 'next/link';

const HomePage = () => {
  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" py={10}>
        <Heading as="h1" size="2xl" mb={6}>
          HR Talent Platform
        </Heading>
        <Text fontSize="xl" mb={8}>
          AI-powered candidate filtering for HR agencies
        </Text>
        <Stack direction={['column', 'row']} spacing={4} justify="center">
          <Button as={Link} href="/test" colorScheme="blue" size="lg">
            Test Chakra UI
          </Button>
          <Button as={Link} href="/jobs" colorScheme="green" size="lg">
            Browse Jobs
          </Button>
        </Stack>
      </Box>

      <Flex justify="center" mt={10}>
        <Box p={8} borderWidth="1px" borderRadius="lg" boxShadow="lg" maxW="800px">
          <Heading size="lg" mb={4}>Welcome to the HR Talent Platform</Heading>
          <Text mb={4}>
            This platform helps HR agencies filter and analyze job candidates using AI technology.
            You can post job listings, collect applications, and automatically filter candidates based on job requirements.
          </Text>
          <Text fontWeight="bold">Key Features:</Text>
          <Stack spacing={2} mt={2} mb={6} pl={4}>
            <Text>• AI-powered resume analysis</Text>
            <Text>• Candidate-job matching with scoring</Text>
            <Text>• Customizable filtering criteria</Text>
            <Text>• Optional automated interviews</Text>
          </Stack>
          <Text>
            To get started, navigate to the Jobs section to browse existing listings or create a new job posting.
          </Text>
        </Box>
      </Flex>
    </Container>
  );
};

export default HomePage;
