import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
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
  Select,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'jobseeker', // 'jobseeker' or 'employer'
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { redirect } = router.query;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push(redirect || '/dashboard');
    }
  }, [isAuthenticated, router, redirect]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Call register function from auth context
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType
      });

      if (result.success) {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Redirect based on account type
        if (formData.accountType === 'employer') {
          router.push('/dashboard');
        } else {
          router.push('/jobs');
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading size={{ base: 'xl', md: '2xl' }}>Create your account</Heading>
          <Text color="gray.500">
            Join our platform to find the perfect job or candidate
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
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                  >
                    <option value="jobseeker">Job Seeker</option>
                    <option value="employer">Employer / HR Agency</option>
                  </Select>
                  <FormHelperText>
                    {formData.accountType === 'employer'
                      ? 'Create an account to post jobs and manage candidates'
                      : 'Create an account to apply for jobs and track applications'}
                  </FormHelperText>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
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
                  <FormHelperText>
                    Password must be at least 8 characters long
                  </FormHelperText>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                </FormControl>
              </Stack>

              <Stack spacing="4">
                <Checkbox
                  name="agreeTerms"
                  isChecked={formData.agreeTerms}
                  onChange={handleChange}
                >
                  I agree to the{' '}
                  <Link as={NextLink} href="/terms" color="blue.500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link as={NextLink} href="/privacy" color="blue.500">
                    Privacy Policy
                  </Link>
                </Checkbox>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  loadingText="Creating Account"
                  isDisabled={!formData.agreeTerms}
                >
                  Create Account
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
                    title: 'Google Sign Up',
                    description: 'This feature is not implemented yet',
                    status: 'info',
                    duration: 3000,
                  })}
                >
                  Sign up with Google
                </Button>

                <Button
                  leftIcon={<FaLinkedin />}
                  variant="outline"
                  colorScheme="linkedin"
                  onClick={() => toast({
                    title: 'LinkedIn Sign Up',
                    description: 'This feature is not implemented yet',
                    status: 'info',
                    duration: 3000,
                  })}
                >
                  Sign up with LinkedIn
                </Button>
              </Stack>

              <HStack spacing="1" justify="center">
                <Text color="gray.500">Already have an account?</Text>
                <Link as={NextLink} href="/login" color="blue.500">
                  Log in
                </Link>
              </HStack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Register;
