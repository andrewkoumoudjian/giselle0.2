import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { redirect } = router.query;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push(redirect || '/dashboard');
    }
  }, [isAuthenticated, router, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }

      // Call login function from auth context
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: 'Login successful',
          description: `Welcome back, ${result.user.name}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Redirect to dashboard or the original requested page
        router.push(redirect || (result.user.role === 'employer' ? '/dashboard' : '/jobs'));
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading size={{ base: 'xl', md: '2xl' }}>Log in to your account</Heading>
          <Text color="gray.500">
            Welcome back! Please enter your credentials to access your account.
          </Text>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <Stack spacing="5">
                <FormControl isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </Stack>
              <HStack justify="space-between">
                <Checkbox defaultChecked>Remember me</Checkbox>
                <Button variant="link" colorScheme="blue" size="sm">
                  Forgot password?
                </Button>
              </HStack>
              <Stack spacing="4">
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  loadingText="Logging in"
                >
                  Sign in
                </Button>
                <HStack>
                  <Divider />
                  <Text fontSize="sm" color="gray.500">
                    OR
                  </Text>
                  <Divider />
                </HStack>
                <Button
                  leftIcon={<FaGoogle />}
                  variant="outline"
                  colorScheme="red"
                  onClick={() => toast({
                    title: 'Google Sign In',
                    description: 'This feature is not implemented yet',
                    status: 'info',
                    duration: 3000,
                  })}
                >
                  Sign in with Google
                </Button>
                <Button
                  leftIcon={<FaLinkedin />}
                  variant="outline"
                  colorScheme="linkedin"
                  onClick={() => toast({
                    title: 'LinkedIn Sign In',
                    description: 'This feature is not implemented yet',
                    status: 'info',
                    duration: 3000,
                  })}
                >
                  Sign in with LinkedIn
                </Button>
              </Stack>
              <HStack spacing="1" justify="center">
                <Text color="gray.500">Don't have an account?</Text>
                <Link as={NextLink} href="/register" color="blue.500">
                  Sign up
                </Link>
              </HStack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
