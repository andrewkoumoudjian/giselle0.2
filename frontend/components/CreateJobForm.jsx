import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
  FormHelperText,
  Divider,
  SimpleGrid,
  InputGroup,
  InputRightElement,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

const CreateJobForm = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companies, setCompanies] = useState([]);
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [softSkillPriority, setSoftSkillPriority] = useState(50);
  const [softSkills, setSoftSkills] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    // Fetch companies
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please try again later.');
      }
    };

    fetchCompanies();
  }, []);

  const handleAddSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const handleAddSoftSkill = () => {
    if (softSkillInput.trim() && !(softSkillInput.trim() in softSkills)) {
      setSoftSkills({
        ...softSkills,
        [softSkillInput.trim()]: softSkillPriority
      });
      setSoftSkillInput('');
      setSoftSkillPriority(50);
    }
  };

  const handleRemoveSoftSkill = (skillToRemove) => {
    const updatedSkills = { ...softSkills };
    delete updatedSkills[skillToRemove];
    setSoftSkills(updatedSkills);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !company) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const jobData = {
        company_id: company,
        title,
        description,
        department: department || null,
        required_skills: requiredSkills.length > 0 ? requiredSkills : null,
        soft_skills_priorities: Object.keys(softSkills).length > 0 ? softSkills : null
      };
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Job created',
        description: 'Your job listing has been created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to the job detail page
      router.push(`/jobs/${data.id}`);
    } catch (err) {
      console.error('Error creating job:', err);
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
      borderRadius="lg"
      p={6}
      boxShadow="md"
      bg="white"
      maxW="800px"
      mx="auto"
    >
      <Heading size="lg" mb={4}>
        Create New Job Listing
      </Heading>
      
      <Text mb={6} color="gray.600">
        Fill out the form below to create a new job listing. Fields marked with * are required.
      </Text>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="flex-start">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
            <FormControl isRequired>
              <FormLabel>Job Title*</FormLabel>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                disabled={isSubmitting}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Company*</FormLabel>
              <Select
                placeholder="Select company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isSubmitting}
              >
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Can't find your company? <Button variant="link" colorScheme="blue" size="sm">Add a new company</Button>
              </FormHelperText>
            </FormControl>
          </SimpleGrid>
          
          <FormControl>
            <FormLabel>Department</FormLabel>
            <Input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering, Marketing, Sales"
              disabled={isSubmitting}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Job Description*</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the job..."
              rows={8}
              disabled={isSubmitting}
            />
          </FormControl>
          
          <Divider my={2} />
          
          <FormControl>
            <FormLabel>Required Skills</FormLabel>
            <InputGroup>
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. JavaScript, Project Management"
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
                  icon={<AddIcon />}
                  size="sm"
                  onClick={handleAddSkill}
                  disabled={isSubmitting || !skillInput.trim()}
                />
              </InputRightElement>
            </InputGroup>
            <FormHelperText>Press Enter or click the + button to add a skill</FormHelperText>
            
            {requiredSkills.length > 0 && (
              <HStack mt={2} spacing={2} flexWrap="wrap">
                {requiredSkills.map((skill, index) => (
                  <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="blue" my={1}>
                    <TagLabel>{skill}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                  </Tag>
                ))}
              </HStack>
            )}
          </FormControl>
          
          <Divider my={2} />
          
          <FormControl>
            <FormLabel>Soft Skills Priorities</FormLabel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} width="100%">
              <Input
                value={softSkillInput}
                onChange={(e) => setSoftSkillInput(e.target.value)}
                placeholder="e.g. Communication, Leadership"
                disabled={isSubmitting}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSoftSkill();
                  }
                }}
              />
              <NumberInput
                value={softSkillPriority}
                onChange={(valueString) => setSoftSkillPriority(parseInt(valueString))}
                min={1}
                max={100}
                disabled={isSubmitting}
              >
                <NumberInputField placeholder="Priority (1-100)" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </SimpleGrid>
            <Button
              mt={2}
              leftIcon={<AddIcon />}
              onClick={handleAddSoftSkill}
              size="sm"
              disabled={isSubmitting || !softSkillInput.trim()}
            >
              Add Soft Skill
            </Button>
            
            {Object.keys(softSkills).length > 0 && (
              <Box mt={3}>
                <Text fontWeight="medium" mb={2}>Added Soft Skills:</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                  {Object.entries(softSkills).map(([skill, priority], index) => (
                    <Tag key={index} size="md" borderRadius="full" variant="subtle" colorScheme="green" my={1}>
                      <TagLabel>{skill} ({priority}%)</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveSoftSkill(skill)} />
                    </Tag>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </FormControl>
          
          <Button
            mt={6}
            colorScheme="blue"
            type="submit"
            isLoading={isSubmitting}
            loadingText="Creating"
            width="full"
          >
            Create Job Listing
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateJobForm;
