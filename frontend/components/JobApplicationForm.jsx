import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  SimpleGrid,
  Progress,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Switch,
  Checkbox,
} from '@chakra-ui/react';
import {
  FaUpload,
  FaFile,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const JobApplicationForm = ({ jobId }) => {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    coverLetter: '',
    linkedin: '',
    portfolio: '',
    github: '',
    useProfileResume: true,
    customQuestions: {
      yearsOfExperience: '',
      relevantProjects: '',
      salary: '',
      startDate: '',
      relocation: false,
    },
  });
  
  // File upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (custom questions)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };
  
  // Handle resume file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or Word document',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setResumeFile(file);
    
    // Simulate file upload and analysis
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Simulate resume analysis after upload completes
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      
      // Mock resume analysis result
      setResumeAnalysis({
        match_score: 85,
        skills: {
          matched: ['JavaScript', 'React', 'Node.js', 'HTML/CSS'],
          missing: ['GraphQL', 'AWS'],
        },
        experience_years: 4,
        education: "Bachelor's Degree in Computer Science",
        recommendations: [
          'Consider highlighting your React project experience in your cover letter',
          'Add more details about your cloud platform experience',
        ],
      });
      
      toast({
        title: 'Resume uploaded and analyzed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 3000);
  };
  
  // Remove uploaded resume
  const handleRemoveResume = () => {
    setResumeFile(null);
    setUploadProgress(0);
    setResumeAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (!file) return FaFile;
    
    if (file.type === 'application/pdf') {
      return FaFilePdf;
    } else if (file.type.includes('word')) {
      return FaFileWord;
    } else {
      return FaFileAlt;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.useProfileResume && !resumeFile) {
      setError('Please upload your resume');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // In a real app, we would call the API
      // await submitApplication(jobId, formData, resumeFile);
      
      // For demo purposes, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      toast({
        title: 'Application submitted',
        description: 'Your application has been successfully submitted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to applications page after a delay
      setTimeout(() => {
        router.push('/applications');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  
  // If application was successfully submitted
  if (success) {
    return (
      <Box
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg={highlightBg}
        textAlign="center"
      >
        <Icon as={FaCheckCircle} boxSize={16} color="green.500" mb={4} />
        <Heading size="lg" mb={4}>Application Submitted!</Heading>
        <Text fontSize="lg" mb={6}>
          Your application has been successfully submitted. You will be redirected to your applications page shortly.
        </Text>
        <Button
          colorScheme="blue"
          onClick={() => router.push('/applications')}
        >
          View My Applications
        </Button>
      </Box>
    );
  }
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <VStack spacing={8} align="stretch">
        {/* Personal Information */}
        <Box>
          <Heading size="md" mb={4}>Personal Information</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
              />
            </FormControl>
          </SimpleGrid>
          
          <FormControl isRequired mb={6}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </FormControl>
        </Box>
        
        <Divider />
        
        {/* Resume Upload */}
        <Box>
          <Heading size="md" mb={4}>Resume</Heading>
          
          <FormControl mb={4}>
            <FormLabel>Resume Option</FormLabel>
            <Checkbox
              name="useProfileResume"
              isChecked={formData.useProfileResume}
              onChange={handleChange}
              colorScheme="blue"
            >
              Use resume from my profile
            </Checkbox>
            <FormHelperText>
              You can upload a different resume specifically for this application
            </FormHelperText>
          </FormControl>
          
          {!formData.useProfileResume && (
            <Box
              borderWidth="2px"
              borderRadius="md"
              borderStyle="dashed"
              p={6}
              mb={6}
              borderColor={resumeFile ? "green.500" : "gray.300"}
              bg={resumeFile ? "green.50" : "transparent"}
              _dark={{
                borderColor: resumeFile ? "green.500" : "gray.600",
                bg: resumeFile ? "green.900" : "transparent",
              }}
            >
              {!resumeFile ? (
                <VStack spacing={2}>
                  <Icon as={FaUpload} boxSize={8} color="gray.400" />
                  <Text fontWeight="medium">Upload your resume</Text>
                  <Text fontSize="sm" color="gray.500">
                    PDF or Word document, max 5MB
                  </Text>
                  <Button
                    onClick={() => fileInputRef.current.click()}
                    colorScheme="blue"
                    variant="outline"
                    mt={2}
                  >
                    Select File
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    display="none"
                  />
                </VStack>
              ) : (
                <VStack spacing={3}>
                  {isUploading ? (
                    <>
                      <Text fontWeight="medium">Uploading resume...</Text>
                      <Progress
                        value={uploadProgress}
                        size="sm"
                        colorScheme="blue"
                        width="100%"
                        borderRadius="full"
                        mb={2}
                      />
                      <Text fontSize="sm" color="gray.500">
                        {uploadProgress}% complete
                      </Text>
                    </>
                  ) : (
                    <>
                      <HStack spacing={3}>
                        <Icon as={getFileIcon(resumeFile)} boxSize={6} color="green.500" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{resumeFile.name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </VStack>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={handleRemoveResume}
                        >
                          <Icon as={FaTrash} />
                        </Button>
                      </HStack>
                      
                      {resumeAnalysis && (
                        <Box
                          mt={4}
                          p={4}
                          bg={highlightBg}
                          borderRadius="md"
                          width="100%"
                        >
                          <Heading size="sm" mb={3}>Resume Analysis</Heading>
                          
                          <HStack mb={3}>
                            <Text fontWeight="medium">Match Score:</Text>
                            <Badge 
                              colorScheme={
                                resumeAnalysis.match_score >= 80 ? 'green' : 
                                resumeAnalysis.match_score >= 60 ? 'yellow' : 'red'
                              }
                            >
                              {resumeAnalysis.match_score}%
                            </Badge>
                          </HStack>
                          
                          <VStack align="start" spacing={2} mb={3}>
                            <Text fontWeight="medium">Skills:</Text>
                            <HStack flexWrap="wrap" spacing={2}>
                              {resumeAnalysis.skills.matched.map((skill, index) => (
                                <Badge key={index} colorScheme="green">
                                  <Icon as={FaCheckCircle} mr={1} />
                                  {skill}
                                </Badge>
                              ))}
                              {resumeAnalysis.skills.missing.map((skill, index) => (
                                <Badge key={index} colorScheme="red">
                                  <Icon as={FaExclamationTriangle} mr={1} />
                                  {skill}
                                </Badge>
                              ))}
                            </HStack>
                          </VStack>
                          
                          <Text fontSize="sm" mb={1}>
                            <Icon as={FaInfoCircle} mr={1} color="blue.500" />
                            Experience: {resumeAnalysis.experience_years} years
                          </Text>
                          <Text fontSize="sm" mb={3}>
                            <Icon as={FaInfoCircle} mr={1} color="blue.500" />
                            Education: {resumeAnalysis.education}
                          </Text>
                          
                          <Text fontWeight="medium" mb={1}>Recommendations:</Text>
                          <VStack align="start" spacing={1}>
                            {resumeAnalysis.recommendations.map((rec, index) => (
                              <Text key={index} fontSize="sm">• {rec}</Text>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </>
                  )}
                </VStack>
              )}
            </Box>
          )}
        </Box>
        
        <Divider />
        
        {/* Cover Letter */}
        <Box>
          <Heading size="md" mb={4}>Cover Letter</Heading>
          
          <FormControl mb={6}>
            <FormLabel>Cover Letter</FormLabel>
            <Textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              placeholder="Introduce yourself and explain why you're a good fit for this position"
              minHeight="200px"
            />
            <FormHelperText>
              A personalized cover letter can significantly increase your chances of getting an interview
            </FormHelperText>
          </FormControl>
        </Box>
        
        <Divider />
        
        {/* Professional Profiles */}
        <Box>
          <Heading size="md" mb={4}>Professional Profiles</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <FormControl>
              <FormLabel>LinkedIn Profile</FormLabel>
              <Input
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Portfolio Website</FormLabel>
              <Input
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />
            </FormControl>
          </SimpleGrid>
          
          <FormControl mb={6}>
            <FormLabel>GitHub Profile</FormLabel>
            <Input
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
            />
          </FormControl>
        </Box>
        
        <Divider />
        
        {/* Additional Questions */}
        <Box>
          <Heading size="md" mb={4}>Additional Questions</Heading>
          
          <FormControl mb={6}>
            <FormLabel>How many years of relevant experience do you have?</FormLabel>
            <Input
              name="customQuestions.yearsOfExperience"
              value={formData.customQuestions.yearsOfExperience}
              onChange={handleChange}
              placeholder="e.g. 3 years"
            />
          </FormControl>
          
          <FormControl mb={6}>
            <FormLabel>Describe relevant projects you've worked on</FormLabel>
            <Textarea
              name="customQuestions.relevantProjects"
              value={formData.customQuestions.relevantProjects}
              onChange={handleChange}
              placeholder="Describe your most relevant projects and your role in them"
              minHeight="150px"
            />
          </FormControl>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            <FormControl>
              <FormLabel>Expected salary</FormLabel>
              <Input
                name="customQuestions.salary"
                value={formData.customQuestions.salary}
                onChange={handleChange}
                placeholder="e.g. $80,000 - $100,000"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Earliest start date</FormLabel>
              <Input
                name="customQuestions.startDate"
                value={formData.customQuestions.startDate}
                onChange={handleChange}
                placeholder="e.g. Immediately, 2 weeks notice"
              />
            </FormControl>
          </SimpleGrid>
          
          <FormControl mb={6} display="flex" alignItems="center">
            <Switch
              name="customQuestions.relocation"
              isChecked={formData.customQuestions.relocation}
              onChange={handleChange}
              colorScheme="blue"
              mr={3}
            />
            <FormLabel htmlFor="customQuestions.relocation" mb={0}>
              I am willing to relocate for this position
            </FormLabel>
          </FormControl>
        </Box>
        
        <Divider />
        
        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={isSubmitting}
          loadingText="Submitting..."
        >
          Submit Application
        </Button>
      </VStack>
    </Box>
  );
};

export default JobApplicationForm;
