import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Progress,
  Textarea,
  SimpleGrid,
  FormHelperText,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue,
  Flex,
  Divider,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaUser, FaEnvelope, FaFileAlt, FaPhone, FaLinkedin, FaGithub, FaPlus } from 'react-icons/fa';

const ApplicationForm = ({ jobId, jobTitle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const toast = useToast();

  const formBackground = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const nextStep = () => {
    if (step === 1 && (!name || !email || !phone)) {
      setError('Please fill in all required fields in this section');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !resume) {
      setError('Please fill in all required fields and upload a resume');
      return;
    }

    try {
      setIsSubmitting(true);
      setProgress(10);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('linkedin', linkedin);
      formData.append('github', github);
      formData.append('resume', resume);
      formData.append('cover_letter', coverLetter);
      formData.append('skills', JSON.stringify(skills));
      formData.append('job_id', jobId);

      setProgress(30);

      // Submit the application
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const data = await response.json();
      setProgress(100);

      // Show success message
      toast({
        title: 'Application submitted',
        description: 'Your application has been submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setLinkedin('');
      setGithub('');
      setResume(null);
      setCoverLetter('');
      setSkills([]);
      setStep(1);

      // If there's a match score, show it
      if (data.application?.analysis_results?.overall_match_score) {
        toast({
          title: 'Match Score',
          description: `Your profile has a ${data.application.analysis_results.overall_match_score}% match with this job`,
          status: 'info',
          duration: 8000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message);

      toast({
        title: 'Error',
        description: err.message,
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
      borderWidth="1px"
      borderRadius="xl"
      p={8}
      boxShadow="lg"
      bg={formBackground}
      maxW="800px"
      mx="auto"
      position="relative"
      overflow="hidden"
    >
      {/* Progress indicator */}
      <Flex justify="center" mb={8}>
        <HStack spacing={4}>
          <Flex
            direction="column"
            align="center"
          >
            <Flex
              w={10}
              h={10}
              align="center"
              justify="center"
              borderRadius="full"
              bg={step >= 1 ? "blue.500" : "gray.200"}
              color="white"
              fontWeight="bold"
            >
              1
            </Flex>
            <Text mt={2} fontSize="sm" color={step >= 1 ? "blue.500" : "gray.500"}>
              Personal Info
            </Text>
          </Flex>

          <Box w="50px" h="1px" bg={step >= 2 ? "blue.500" : "gray.200"} />

          <Flex
            direction="column"
            align="center"
          >
            <Flex
              w={10}
              h={10}
              align="center"
              justify="center"
              borderRadius="full"
              bg={step >= 2 ? "blue.500" : "gray.200"}
              color="white"
              fontWeight="bold"
            >
              2
            </Flex>
            <Text mt={2} fontSize="sm" color={step >= 2 ? "blue.500" : "gray.500"}>
              Skills & Resume
            </Text>
          </Flex>

          <Box w="50px" h="1px" bg={step >= 3 ? "blue.500" : "gray.200"} />

          <Flex
            direction="column"
            align="center"
          >
            <Flex
              w={10}
              h={10}
              align="center"
              justify="center"
              borderRadius="full"
              bg={step >= 3 ? "blue.500" : "gray.200"}
              color="white"
              fontWeight="bold"
            >
              3
            </Flex>
            <Text mt={2} fontSize="sm" color={step >= 3 ? "blue.500" : "gray.500"}>
              Cover Letter
            </Text>
          </Flex>
        </HStack>
      </Flex>

      <Heading size="lg" mb={2} textAlign="center">
        Apply for {jobTitle}
      </Heading>

      <Text mb={6} color="gray.600" textAlign="center">
        {step === 1 && "Let's start with your personal information"}
        {step === 2 && "Tell us about your skills and upload your resume"}
        {step === 3 && "Add a cover letter to stand out from other applicants"}
      </Text>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUser} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaEnvelope} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </InputGroup>
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel>Phone Number</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaPhone} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  disabled={isSubmitting}
                />
              </InputGroup>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>LinkedIn Profile</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaLinkedin} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    disabled={isSubmitting}
                  />
                </InputGroup>
                <FormHelperText>Optional</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>GitHub Profile</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaGithub} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    disabled={isSubmitting}
                  />
                </InputGroup>
                <FormHelperText>Optional</FormHelperText>
              </FormControl>
            </SimpleGrid>
          </VStack>
        )}

        {/* Step 2: Skills and Resume */}
        {step === 2 && (
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Skills</FormLabel>
              <InputGroup>
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. JavaScript, Project Management, Communication"
                  disabled={isSubmitting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Add skill"
                    icon={<FaPlus />}
                    size="sm"
                    onClick={handleAddSkill}
                    isDisabled={!skillInput.trim()}
                    colorScheme="blue"
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText>Press Enter or click the + button to add a skill</FormHelperText>

              {skills.length > 0 && (
                <Box mt={4}>
                  <HStack spacing={2} flexWrap="wrap">
                    {skills.map((skill, index) => (
                      <Tag key={index} size="md" borderRadius="full" colorScheme="blue" my={1}>
                        <TagLabel>{skill}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Resume</FormLabel>
              <Box
                borderWidth="1px"
                borderRadius="md"
                borderStyle="dashed"
                borderColor={borderColor}
                p={6}
                textAlign="center"
                bg={useColorModeValue('gray.50', 'gray.700')}
                cursor="pointer"
                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                onClick={() => document.getElementById('resume-upload').click()}
              >
                <Icon as={FaFileAlt} w={10} h={10} color="gray.400" mb={4} />
                <Heading size="sm" mb={2}>
                  {resume ? resume.name : 'Upload your resume'}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {resume ? 'Click to change file' : 'Drag and drop or click to browse'}
                </Text>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setResume(e.target.files[0])}
                  disabled={isSubmitting}
                  display="none"
                />
              </Box>
              <FormHelperText>Accepted formats: PDF, DOC, DOCX, TXT</FormHelperText>
            </FormControl>
          </VStack>
        )}

        {/* Step 3: Cover Letter */}
        {step === 3 && (
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Cover Letter</FormLabel>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're interested in this position and what makes you a great candidate..."
                disabled={isSubmitting}
                minH="200px"
              />
              <FormHelperText>Optional, but recommended</FormHelperText>
            </FormControl>

            {isSubmitting && (
              <Box w="100%">
                <Text mb={2} fontSize="sm">
                  {progress < 30
                    ? 'Uploading resume...'
                    : progress < 70
                    ? 'Analyzing your application...'
                    : 'Finalizing submission...'}
                </Text>
                <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
              </Box>
            )}
          </VStack>
        )}

        <Flex justify="space-between" mt={8}>
          {step > 1 ? (
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={isSubmitting}
            >
              Previous
            </Button>
          ) : (
            <Box /> // Empty box for spacing
          )}

          {step < 3 ? (
            <Button
              onClick={nextStep}
              colorScheme="blue"
              disabled={isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Submit Application
            </Button>
          )}
        </Flex>
      </form>
    </Box>
  );
};

export default ApplicationForm;
