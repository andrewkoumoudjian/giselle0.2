import React from 'react';
import {
  Flex,
  Spinner,
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg={bgColor}
      color={textColor}
      p={4}
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
        mb={4}
      />
      <Text fontSize="xl" fontWeight="medium" textAlign="center">
        {message}
      </Text>
      <Box mt={2} maxW="md" textAlign="center">
        <Text color="gray.500">
          This may take a few moments. Please wait...
        </Text>
      </Box>
    </Flex>
  );
};

export default LoadingScreen;
