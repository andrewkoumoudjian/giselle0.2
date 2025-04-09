import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Textarea,
  FormHelperText,
  Flex,
  Divider,
  Progress,
  HStack
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const SimpleApplicationForm = ({ jobId, jobTitle }) => {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    cover_letter: '',
    resume: null
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, resume: file }));
  };

  // Move to next step
  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  // Move to previous step
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you would submit the form data to your API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Application submitted!',
        description: `Your application for ${jobTitle} has been submitted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to jobs page after successful submission
      router.push('/jobs');
    } catch (error) {
      toast({
        title: 'Error submitting application',
        description: error.message || "Something went wrong. Please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      as="form" 
      onSubmit={handleSubmit}
      p={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      boxShadow="md"
    >
      {/* Progress indicator */}
      <Box mb={8}>
        <Progress value={(step / 3) * 100} size="sm" colorScheme="blue" borderRadius="md" mb={2} />
        <HStack justify="space-between">
          <Text color={step >= 1 ? "blue.500" : "gray.500"} fontWeight={step === 1 ? "bold" : "normal"}>
            Personal Info
          </Text>
          <Text color={step >= 2 ? "blue.500" : "gray.500"} fontWeight={step === 2 ? "bold" : "normal"}>
            Resume
          </Text>
          <Text color={step >= 3 ? "blue.500" : "gray.500"} fontWeight={step === 3 ? "bold" : "normal"}>
            Cover Letter
          </Text>
        </HStack>
      </Box>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Stack spacing={4}>
          <Heading size="md" mb={2}>Personal Information</Heading>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter your full name"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email address"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="Enter your phone number"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>LinkedIn Profile</FormLabel>
            <Input 
              name="linkedin" 
              value={formData.linkedin} 
              onChange={handleChange} 
              placeholder="https://linkedin.com/in/yourprofile"
            />
            <FormHelperText>Optional, but recommended</FormHelperText>
          </FormControl>
          
          <FormControl>
            <FormLabel>GitHub Profile</FormLabel>
            <Input 
              name="github" 
              value={formData.github} 
              onChange={handleChange} 
              placeholder="https://github.com/yourusername"
            />
            <FormHelperText>Optional, but recommended for technical roles</FormHelperText>
          </FormControl>
          
          <Flex justify="flex-end" mt={4}>
            <Button 
              colorScheme="blue" 
              onClick={nextStep}
              isDisabled={!formData.name || !formData.email || !formData.phone}
            >
              Next: Resume
            </Button>
          </Flex>
        </Stack>
      )}
      
      {/* Step 2: Resume Upload */}
      {step === 2 && (
        <Stack spacing={4}>
          <Heading size="md" mb={2}>Resume Upload</Heading>
          <Text mb={4}>
            Please upload your resume in PDF, DOC, or DOCX format. 
            Make sure your resume is up-to-date and highlights relevant experience.
          </Text>
          
          <FormControl isRequired>
            <FormLabel>Resume</FormLabel>
            <Input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange}
              p={1}
            />
            <FormHelperText>Maximum file size: 5MB</FormHelperText>
          </FormControl>
          
          <Divider my={4} />
          
          <Flex justify="space-between" mt={4}>
            <Button variant="outline" onClick={prevStep}>
              Back: Personal Info
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={nextStep}
              isDisabled={!formData.resume}
            >
              Next: Cover Letter
            </Button>
          </Flex>
        </Stack>
      )}
      
      {/* Step 3: Cover Letter */}
      {step === 3 && (
        <Stack spacing={4}>
          <Heading size="md" mb={2}>Cover Letter</Heading>
          <Text mb={4}>
            Tell us why you're interested in this position and what makes you a great candidate.
          </Text>
          
          <FormControl>
            <FormLabel>Cover Letter</FormLabel>
            <Textarea 
              name="cover_letter" 
              value={formData.cover_letter} 
              onChange={handleChange} 
              placeholder="Write your cover letter here..."
              minHeight="200px"
            />
            <FormHelperText>Optional, but highly recommended</FormHelperText>
          </FormControl>
          
          <Divider my={4} />
          
          <Flex justify="space-between" mt={4}>
            <Button variant="outline" onClick={prevStep}>
              Back: Resume
            </Button>
            <Button 
              colorScheme="green" 
              type="submit"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Submit Application
            </Button>
          </Flex>
        </Stack>
      )}
    </Box>
  );
};

export default SimpleApplicationForm;
