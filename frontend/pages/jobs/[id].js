import React from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
  Link
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const JobDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Sample job data - in a real app, this would come from an API
  const job = {
    id: id,
    title: 'Software Engineer',
    company: 'Tech Solutions Inc.',
    location: 'Remote',
    salary: '$100,000 - $130,000',
    type: 'Full-time',
    description: 'We are looking for a talented software engineer to join our team. The ideal candidate will have experience with modern web technologies and a passion for building high-quality software.',
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience with JavaScript and React',
      'Experience with Node.js and Express',
      'Familiarity with cloud platforms (AWS, Azure, or GCP)',
      'Strong problem-solving skills and attention to detail'
    ],
    responsibilities: [
      'Develop and maintain web applications using React and Node.js',
      'Collaborate with cross-functional teams to define and implement new features',
      'Write clean, maintainable, and efficient code',
      'Participate in code reviews and provide constructive feedback',
      'Troubleshoot and fix bugs in existing applications'
    ]
  };

  if (!id) {
    return <Container maxW="container.xl" py={8}>Loading...</Container>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Button as={Link} href="/jobs" variant="outline" mb={4}>
          Back to Jobs
        </Button>
        <Heading as="h1" size="xl" mb={2}>{job.title}</Heading>
        <Flex gap={2} mb={4} flexWrap="wrap">
          <Badge colorScheme="blue" fontSize="0.8em" p={1}>{job.company}</Badge>
          <Badge colorScheme="green" fontSize="0.8em" p={1}>{job.location}</Badge>
          <Badge colorScheme="purple" fontSize="0.8em" p={1}>{job.type}</Badge>
          <Badge colorScheme="yellow" fontSize="0.8em" p={1}>{job.salary}</Badge>
        </Flex>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="md" mb={3}>Job Description</Heading>
        <Text>{job.description}</Text>
      </Box>

      <Divider my={6} />

      <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
        <Box flex="1">
          <Heading as="h2" size="md" mb={4}>Requirements</Heading>
          <List spacing={2}>
            {job.requirements.map((req, index) => (
              <ListItem key={index} display="flex">
                <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                <Text>{req}</Text>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box flex="1">
          <Heading as="h2" size="md" mb={4}>Responsibilities</Heading>
          <List spacing={2}>
            {job.responsibilities.map((resp, index) => (
              <ListItem key={index} display="flex">
                <ListIcon as={CheckCircleIcon} color="blue.500" mt={1} />
                <Text>{resp}</Text>
              </ListItem>
            ))}
          </List>
        </Box>
      </Stack>

      <Box mt={10} textAlign="center">
        <Button 
          as={Link}
          href={`/jobs/${id}/apply`}
          colorScheme="blue" 
          size="lg" 
          px={8}
        >
          Apply for this Position
        </Button>
      </Box>
    </Container>
  );
};

export default JobDetailsPage;
