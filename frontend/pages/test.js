import React from 'react';
import { Box, Heading, Text, Button, Container, Stack, Flex } from '@chakra-ui/react';

const TestPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box p={8} borderWidth="1px" borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="xl" mb={4}>Chakra UI Test Page</Heading>
        <Text fontSize="lg" mb={6}>This is a simple test page to verify that Chakra UI is working correctly.</Text>

        <Stack direction="row" spacing={4}>
          <Button colorScheme="blue">Primary Button</Button>
          <Button colorScheme="green">Success Button</Button>
          <Button colorScheme="red">Danger Button</Button>
        </Stack>

        <Flex mt={8} justify="space-between">
          <Box p={4} bg="gray.100" borderRadius="md" flex="1" mr={4}>
            <Heading size="md" mb={2}>Box 1</Heading>
            <Text>This is a test box using Chakra UI styling.</Text>
          </Box>
          <Box p={4} bg="blue.100" borderRadius="md" flex="1">
            <Heading size="md" mb={2}>Box 2</Heading>
            <Text>This is another test box using Chakra UI styling.</Text>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
};

export default TestPage;
