import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Container,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa';
import NextLink from 'next/link';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { isAuthenticated, user } = useAuth();
  const bgColor = useColorModeValue('red.50', 'red.900');
  const iconColor = useColorModeValue('red.500', 'red.300');

  return (
    <Container maxW="container.md" py={20}>
      <Box
        p={10}
        bg={bgColor}
        borderRadius="lg"
        textAlign="center"
        boxShadow="md"
      >
        <VStack spacing={6}>
          <Icon as={FaLock} boxSize={16} color={iconColor} />
          
          <Heading size="xl">Access Denied</Heading>
          
          <Text fontSize="lg">
            {isAuthenticated() 
              ? "You don't have permission to access this page. This area requires different privileges than your current account has."
              : "You need to be logged in to access this page."}
          </Text>
          
          {isAuthenticated() ? (
            <Text>
              You are logged in as <strong>{user?.name || 'User'}</strong> with the role of <strong>{user?.role || 'unknown'}</strong>.
            </Text>
          ) : null}
          
          <Box pt={4}>
            <Button
              as={NextLink}
              href={isAuthenticated() ? '/' : '/login'}
              colorScheme="blue"
              size="lg"
              mr={4}
            >
              {isAuthenticated() ? 'Go Home' : 'Sign In'}
            </Button>
            
            {isAuthenticated() && (
              <Button
                as={NextLink}
                href={user?.role === 'employer' ? '/dashboard' : '/jobs'}
                variant="outline"
                colorScheme="blue"
                size="lg"
              >
                Go to {user?.role === 'employer' ? 'Dashboard' : 'Jobs'}
              </Button>
            )}
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
