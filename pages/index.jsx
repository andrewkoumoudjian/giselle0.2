import React from 'react';
import { Box, Button, Container, Flex, Heading, Stack, Text, Image, SimpleGrid, Icon } from '@chakra-ui/react';
import { FaSearch, FaFileAlt, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import TailwindLayout from '../components/TailwindLayout';

const HomePage = () => {
  return (
    <TailwindLayout title="HR Talent Platform - Find Your Perfect Match">
      {/* Hero Section */}
      <Box className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <Container maxW="7xl" className="px-4 py-20 sm:px-6 lg:px-8">
          <Box className="text-center">
            <Heading as="h1" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Find Your Perfect Match
            </Heading>
            <Text className="mt-6 max-w-2xl mx-auto text-xl">
              Connect top talent with great opportunities using our AI-powered HR platform
            </Text>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing="4"
              className="mt-10 justify-center"
            >
              <Button
                as={Link}
                href="/jobs"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Browse Jobs
              </Button>
              <Button
                as={Link}
                href="/auth/register"
                size="lg"
                className="bg-primary-500 text-white hover:bg-primary-400"
              >
                Sign Up Free
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="py-16 bg-white">
        <Container maxW="7xl" className="px-4 sm:px-6 lg:px-8">
          <Box className="text-center">
            <Heading as="h2" className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Streamline Your Hiring Process
            </Heading>
            <Text className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform uses AI to match the right candidates with the right jobs
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="10" className="mt-16">
            <Box className="text-center">
              <Flex
                w="12"
                h="12"
                alignItems="center"
                justifyContent="center"
                rounded="full"
                bg="primary.100"
                className="mx-auto"
              >
                <Icon as={FaSearch} className="h-6 w-6 text-primary-600" />
              </Flex>
              <Heading as="h3" className="mt-6 text-lg font-medium text-gray-900">
                Smart Job Matching
              </Heading>
              <Text className="mt-2 text-base text-gray-500">
                AI-powered matching connects candidates with jobs that fit their skills and experience
              </Text>
            </Box>

            <Box className="text-center">
              <Flex
                w="12"
                h="12"
                alignItems="center"
                justifyContent="center"
                rounded="full"
                bg="primary.100"
                className="mx-auto"
              >
                <Icon as={FaFileAlt} className="h-6 w-6 text-primary-600" />
              </Flex>
              <Heading as="h3" className="mt-6 text-lg font-medium text-gray-900">
                Resume Analysis
              </Heading>
              <Text className="mt-2 text-base text-gray-500">
                Automatically extract skills and experience from resumes to find the best matches
              </Text>
            </Box>

            <Box className="text-center">
              <Flex
                w="12"
                h="12"
                alignItems="center"
                justifyContent="center"
                rounded="full"
                bg="primary.100"
                className="mx-auto"
              >
                <Icon as={FaCheckCircle} className="h-6 w-6 text-primary-600" />
              </Flex>
              <Heading as="h3" className="mt-6 text-lg font-medium text-gray-900">
                Candidate Scoring
              </Heading>
              <Text className="mt-2 text-base text-gray-500">
                Objectively evaluate candidates against job requirements with our scoring system
              </Text>
            </Box>

            <Box className="text-center">
              <Flex
                w="12"
                h="12"
                alignItems="center"
                justifyContent="center"
                rounded="full"
                bg="primary.100"
                className="mx-auto"
              >
                <Icon as={FaChartLine} className="h-6 w-6 text-primary-600" />
              </Flex>
              <Heading as="h3" className="mt-6 text-lg font-medium text-gray-900">
                Analytics Dashboard
              </Heading>
              <Text className="mt-2 text-base text-gray-500">
                Track hiring metrics and trends with our comprehensive analytics dashboard
              </Text>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="bg-primary-700 text-white">
        <Container maxW="7xl" className="px-4 py-16 sm:px-6 lg:px-8">
          <Box className="text-center">
            <Heading as="h2" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to Transform Your Hiring Process?
            </Heading>
            <Text className="mt-4 max-w-2xl mx-auto text-xl">
              Join thousands of companies using our platform to find the best talent
            </Text>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing="4"
              className="mt-10 justify-center"
            >
              <Button
                as={Link}
                href="/auth/register"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Get Started
              </Button>
              <Button
                as={Link}
                href="/about"
                size="lg"
                className="bg-primary-600 text-white border border-white hover:bg-primary-500"
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </TailwindLayout>
  );
};

export default HomePage;
