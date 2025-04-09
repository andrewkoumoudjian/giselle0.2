import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
  Avatar,
  AvatarBadge,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  FormHelperText,
  Alert,
  AlertIcon,
  Switch,
} from '@chakra-ui/react';
import { FaCamera, FaKey, FaUser, FaBell, FaShieldAlt } from 'react-icons/fa';
import { withAuth } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../utils/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    linkedin: '',
    github: '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    applicationUpdates: true,
    newJobs: true,
    marketing: false,
  });
  
  // Load user data
  useEffect(() => {
    if (user) {
      // In a real app, we would fetch the full profile from the API
      // For now, we'll use the data from the auth context
      const nameParts = (user.name || '').split(' ');
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
        bio: '',
        location: '',
        linkedin: '',
        github: '',
      });
    }
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle notification toggle
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, we would call the API
      // await updateProfile(profileData);
      
      // For demo purposes, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully');
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    
    try {
      // In a real app, we would call the API
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // For demo purposes, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccess('Password changed successfully');
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save notification settings
  const handleSaveNotifications = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, we would call the API
      // await updateNotificationSettings(notifications);
      
      // For demo purposes, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Notification settings saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save notification settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" mb={8}>
        Profile Settings
      </Heading>
      
      <Tabs colorScheme="blue" variant="enclosed-colored">
        <TabList mb={4}>
          <Tab><Box as={FaUser} mr={2} /> Personal Information</Tab>
          <Tab><Box as={FaKey} mr={2} /> Password</Tab>
          <Tab><Box as={FaBell} mr={2} /> Notifications</Tab>
          {user?.role === 'employer' && (
            <Tab><Box as={FaShieldAlt} mr={2} /> Account</Tab>
          )}
        </TabList>
        
        <TabPanels>
          {/* Personal Information Tab */}
          <TabPanel>
            <Box
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              borderRadius="lg"
              boxShadow="md"
            >
              {success && (
                <Alert status="success" mb={4} borderRadius="md">
                  <AlertIcon />
                  {success}
                </Alert>
              )}
              
              {error && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleUpdateProfile}>
                <VStack spacing={6} align="start">
                  {/* Profile Picture */}
                  <Flex direction="column" align="center" w="full" mb={4}>
                    <Avatar 
                      size="2xl" 
                      name={`${profileData.firstName} ${profileData.lastName}`}
                      src={user?.avatar}
                      bg="blue.500"
                      mb={2}
                    >
                      <AvatarBadge
                        as={IconButton}
                        size="sm"
                        rounded="full"
                        top="-10px"
                        colorScheme="blue"
                        aria-label="Change profile picture"
                        icon={<FaCamera />}
                      />
                    </Avatar>
                    <Text fontSize="sm" color="gray.500">
                      Click the camera icon to change your profile picture
                    </Text>
                  </Flex>
                  
                  {/* Name */}
                  <HStack w="full" spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                      />
                    </FormControl>
                  </HStack>
                  
                  {/* Contact Information */}
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      isReadOnly
                      bg="gray.50"
                    />
                    <FormHelperText>
                      Email cannot be changed. Contact support if you need to update your email.
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      placeholder="City, State, Country"
                    />
                  </FormControl>
                  
                  {/* Professional Information */}
                  <Divider />
                  <Heading size="md">Professional Information</Heading>
                  
                  <FormControl>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <Input
                      name="linkedin"
                      value={profileData.linkedin}
                      onChange={handleProfileChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>GitHub Profile</FormLabel>
                    <Input
                      name="github"
                      value={profileData.github}
                      onChange={handleProfileChange}
                      placeholder="https://github.com/yourusername"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    alignSelf="flex-end"
                    mt={4}
                  >
                    Save Changes
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabPanel>
          
          {/* Password Tab */}
          <TabPanel>
            <Box
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              borderRadius="lg"
              boxShadow="md"
            >
              {success && (
                <Alert status="success" mb={4} borderRadius="md">
                  <AlertIcon />
                  {success}
                </Alert>
              )}
              
              {error && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleChangePassword}>
                <VStack spacing={6} align="start">
                  <Heading size="md">Change Password</Heading>
                  
                  <FormControl isRequired>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <FormHelperText>
                      Password must be at least 8 characters long
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    alignSelf="flex-end"
                    mt={4}
                  >
                    Change Password
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabPanel>
          
          {/* Notifications Tab */}
          <TabPanel>
            <Box
              bg={useColorModeValue('white', 'gray.700')}
              p={6}
              borderRadius="lg"
              boxShadow="md"
            >
              <VStack spacing={6} align="start">
                <Heading size="md">Notification Preferences</Heading>
                <Text>Choose which notifications you'd like to receive</Text>
                
                <Stack spacing={4} w="full">
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="email-alerts"
                      name="emailAlerts"
                      isChecked={notifications.emailAlerts}
                      onChange={handleNotificationChange}
                      colorScheme="blue"
                      mr={3}
                    />
                    <FormLabel htmlFor="email-alerts" mb={0}>
                      Email Alerts
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="application-updates"
                      name="applicationUpdates"
                      isChecked={notifications.applicationUpdates}
                      onChange={handleNotificationChange}
                      colorScheme="blue"
                      mr={3}
                    />
                    <FormLabel htmlFor="application-updates" mb={0}>
                      Application Status Updates
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="new-jobs"
                      name="newJobs"
                      isChecked={notifications.newJobs}
                      onChange={handleNotificationChange}
                      colorScheme="blue"
                      mr={3}
                    />
                    <FormLabel htmlFor="new-jobs" mb={0}>
                      New Job Alerts
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="marketing"
                      name="marketing"
                      isChecked={notifications.marketing}
                      onChange={handleNotificationChange}
                      colorScheme="blue"
                      mr={3}
                    />
                    <FormLabel htmlFor="marketing" mb={0}>
                      Marketing and Promotional Emails
                    </FormLabel>
                  </FormControl>
                </Stack>
                
                <Button
                  colorScheme="blue"
                  isLoading={isLoading}
                  onClick={handleSaveNotifications}
                  alignSelf="flex-end"
                  mt={4}
                >
                  Save Preferences
                </Button>
              </VStack>
            </Box>
          </TabPanel>
          
          {/* Account Tab (Employer Only) */}
          {user?.role === 'employer' && (
            <TabPanel>
              <Box
                bg={useColorModeValue('white', 'gray.700')}
                p={6}
                borderRadius="lg"
                boxShadow="md"
              >
                <VStack spacing={6} align="start">
                  <Heading size="md">Account Settings</Heading>
                  <Text>Manage your account settings and subscription</Text>
                  
                  <Box w="full" p={4} bg="blue.50" borderRadius="md">
                    <Heading size="sm" mb={2} color="blue.600">
                      Current Plan: Professional
                    </Heading>
                    <Text fontSize="sm" mb={4}>
                      Your subscription renews on October 15, 2023
                    </Text>
                    <HStack>
                      <Button size="sm" colorScheme="blue">
                        Upgrade Plan
                      </Button>
                      <Button size="sm" variant="outline" colorScheme="blue">
                        Billing History
                      </Button>
                    </HStack>
                  </Box>
                  
                  <Divider />
                  
                  <Heading size="sm" color="red.500">
                    Danger Zone
                  </Heading>
                  
                  <HStack spacing={4}>
                    <Button colorScheme="red" variant="outline">
                      Delete Account
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default withAuth(ProfilePage);
