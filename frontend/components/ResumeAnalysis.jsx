import React from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Flex,
  Progress,
  Badge,
  Divider,
  SimpleGrid,
  HStack,
  VStack,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaTools,
  FaUserTie,
  FaLanguage,
  FaAward,
} from 'react-icons/fa';

// This component visualizes the results of resume analysis
const ResumeAnalysis = ({ analysisData, jobRequirements }) => {
  // Use mock data if real data is not provided
  const analysis = analysisData || {
    skills: {
      matched: [
        { name: 'JavaScript', level: 'Expert', years: 5 },
        { name: 'React', level: 'Advanced', years: 3 },
        { name: 'Node.js', level: 'Intermediate', years: 2 },
        { name: 'TypeScript', level: 'Intermediate', years: 2 },
        { name: 'HTML/CSS', level: 'Expert', years: 5 },
      ],
      missing: [
        { name: 'GraphQL', importance: 'Preferred' },
        { name: 'AWS', importance: 'Preferred' },
      ],
      additional: [
        { name: 'Vue.js', level: 'Beginner', years: 1 },
        { name: 'Python', level: 'Intermediate', years: 3 },
        { name: 'Docker', level: 'Beginner', years: 1 },
      ],
    },
    experience: {
      total_years: 5,
      relevant_years: 3,
      job_titles: ['Frontend Developer', 'Web Developer', 'UI Engineer'],
      industries: ['Technology', 'E-commerce'],
      company_sizes: ['Startup', 'Mid-size'],
    },
    education: {
      highest_degree: "Bachelor's Degree",
      field_of_study: 'Computer Science',
      relevant_to_job: true,
    },
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Intermediate' },
    ],
    certifications: [
      { name: 'AWS Certified Developer', year: 2022 },
      { name: 'React Certification', year: 2021 },
    ],
    overall_match: 85,
    strengths: [
      'Strong frontend development skills',
      'Relevant industry experience',
      'Good educational background',
    ],
    weaknesses: [
      'Missing some preferred skills',
      'Limited experience with cloud technologies',
    ],
  };

  // Use mock job requirements if real data is not provided
  const requirements = jobRequirements || {
    min_experience: 3,
    preferred_experience: 5,
    required_skills: [
      'JavaScript',
      'React',
      'Node.js',
      'TypeScript',
      'HTML/CSS',
    ],
    preferred_skills: ['GraphQL', 'AWS', 'Docker'],
    min_education: "Bachelor's Degree",
    preferred_education: "Master's Degree",
  };

  // Calculate match percentages
  const skillsMatchPercentage = Math.round(
    (analysis.skills.matched.length /
      (analysis.skills.matched.length + analysis.skills.missing.length)) *
      100
  );

  const experienceMatchPercentage = Math.min(
    100,
    Math.round(
      (analysis.experience.relevant_years / requirements.preferred_experience) *
        100
    )
  );

  const educationMatchPercentage =
    analysis.education.highest_degree === requirements.preferred_education
      ? 100
      : analysis.education.highest_degree === requirements.min_education
      ? 75
      : 50;

  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');

  // Skill level color mapping
  const skillLevelColors = {
    Beginner: 'yellow',
    Intermediate: 'blue',
    Advanced: 'purple',
    Expert: 'green',
  };

  // Importance color mapping
  const importanceColors = {
    Required: 'red',
    Preferred: 'yellow',
  };

  return (
    <Box>
      <Box
        p={5}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg={cardBg}
        mb={6}
      >
        <Heading size="md" mb={4}>
          Overall Match Score
        </Heading>
        <Flex align="center" mb={2}>
          <Progress
            value={analysis.overall_match}
            colorScheme={
              analysis.overall_match >= 80
                ? 'green'
                : analysis.overall_match >= 60
                ? 'yellow'
                : 'red'
            }
            size="lg"
            borderRadius="full"
            flex="1"
            mr={4}
          />
          <Badge
            colorScheme={
              analysis.overall_match >= 80
                ? 'green'
                : analysis.overall_match >= 60
                ? 'yellow'
                : 'red'
            }
            fontSize="xl"
            p={2}
            borderRadius="md"
          >
            {analysis.overall_match}%
          </Badge>
        </Flex>
        <Text color="gray.500" fontSize="sm">
          Based on skills, experience, education, and other factors
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        {/* Skills Match */}
        <Box
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Skills Match</Heading>
            <Badge
              colorScheme={
                skillsMatchPercentage >= 80
                  ? 'green'
                  : skillsMatchPercentage >= 60
                  ? 'yellow'
                  : 'red'
              }
              fontSize="md"
              p={2}
              borderRadius="md"
            >
              {skillsMatchPercentage}%
            </Badge>
          </Flex>
          <Flex align="center" mb={4}>
            <Icon as={FaCode} color="blue.500" boxSize={5} mr={2} />
            <Text>
              <strong>{analysis.skills.matched.length}</strong> of{' '}
              <strong>
                {analysis.skills.matched.length + analysis.skills.missing.length}
              </strong>{' '}
              required skills matched
            </Text>
          </Flex>
          <Text color="gray.500" fontSize="sm">
            {analysis.skills.additional.length} additional skills found
          </Text>
        </Box>

        {/* Experience Match */}
        <Box
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Experience Match</Heading>
            <Badge
              colorScheme={
                experienceMatchPercentage >= 80
                  ? 'green'
                  : experienceMatchPercentage >= 60
                  ? 'yellow'
                  : 'red'
              }
              fontSize="md"
              p={2}
              borderRadius="md"
            >
              {experienceMatchPercentage}%
            </Badge>
          </Flex>
          <Flex align="center" mb={4}>
            <Icon as={FaBriefcase} color="purple.500" boxSize={5} mr={2} />
            <Text>
              <strong>{analysis.experience.relevant_years}</strong> years of
              relevant experience
            </Text>
          </Flex>
          <Text color="gray.500" fontSize="sm">
            {requirements.min_experience} years required,{' '}
            {requirements.preferred_experience} years preferred
          </Text>
        </Box>

        {/* Education Match */}
        <Box
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Education Match</Heading>
            <Badge
              colorScheme={
                educationMatchPercentage >= 80
                  ? 'green'
                  : educationMatchPercentage >= 60
                  ? 'yellow'
                  : 'red'
              }
              fontSize="md"
              p={2}
              borderRadius="md"
            >
              {educationMatchPercentage}%
            </Badge>
          </Flex>
          <Flex align="center" mb={4}>
            <Icon as={FaGraduationCap} color="green.500" boxSize={5} mr={2} />
            <Text>
              <strong>{analysis.education.highest_degree}</strong> in{' '}
              {analysis.education.field_of_study}
            </Text>
          </Flex>
          <Text color="gray.500" fontSize="sm">
            {requirements.min_education} required,{' '}
            {requirements.preferred_education} preferred
          </Text>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {/* Matched Skills */}
        <Box
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
        >
          <Heading size="md" mb={4}>
            Matched Skills
          </Heading>
          <List spacing={3}>
            {analysis.skills.matched.map((skill, index) => (
              <ListItem key={index}>
                <Flex align="center" justify="space-between">
                  <HStack>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <Text fontWeight="medium">{skill.name}</Text>
                  </HStack>
                  <Badge colorScheme={skillLevelColors[skill.level]}>
                    {skill.level} ({skill.years} {skill.years === 1 ? 'year' : 'years'})
                  </Badge>
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Missing Skills */}
        <Box
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
        >
          <Heading size="md" mb={4}>
            Missing Skills
          </Heading>
          {analysis.skills.missing.length === 0 ? (
            <Text color="green.500">No missing required skills!</Text>
          ) : (
            <List spacing={3}>
              {analysis.skills.missing.map((skill, index) => (
                <ListItem key={index}>
                  <Flex align="center" justify="space-between">
                    <HStack>
                      <ListIcon
                        as={
                          skill.importance === 'Required'
                            ? FaTimesCircle
                            : FaExclamationTriangle
                        }
                        color={
                          skill.importance === 'Required'
                            ? 'red.500'
                            : 'yellow.500'
                        }
                      />
                      <Text fontWeight="medium">{skill.name}</Text>
                    </HStack>
                    <Badge colorScheme={importanceColors[skill.importance]}>
                      {skill.importance}
                    </Badge>
                  </Flex>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {/* Strengths */}
        <Box
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
        >
          <Heading size="md" mb={4}>
            Candidate Strengths
          </Heading>
          <List spacing={3}>
            {analysis.strengths.map((strength, index) => (
              <ListItem key={index}>
                <HStack>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  <Text>{strength}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Weaknesses */}
        <Box
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
        >
          <Heading size="md" mb={4}>
            Areas for Improvement
          </Heading>
          <List spacing={3}>
            {analysis.weaknesses.map((weakness, index) => (
              <ListItem key={index}>
                <HStack>
                  <ListIcon as={FaExclamationTriangle} color="yellow.500" />
                  <Text>{weakness}</Text>
                </HStack>
              </ListItem>
            ))}
          </List>
        </Box>
      </SimpleGrid>

      {/* Additional Information */}
      <Box
        p={5}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg={cardBg}
        mb={6}
      >
        <Heading size="md" mb={4}>
          Additional Information
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Experience */}
          <VStack align="start" spacing={2}>
            <Flex align="center">
              <Icon as={FaBriefcase} color="blue.500" mr={2} />
              <Heading size="sm">Experience</Heading>
            </Flex>
            <Text>
              <strong>Total:</strong> {analysis.experience.total_years} years
            </Text>
            <Text>
              <strong>Relevant:</strong> {analysis.experience.relevant_years}{' '}
              years
            </Text>
            <Text>
              <strong>Job Titles:</strong>{' '}
              {analysis.experience.job_titles.join(', ')}
            </Text>
            <Text>
              <strong>Industries:</strong>{' '}
              {analysis.experience.industries.join(', ')}
            </Text>
          </VStack>

          {/* Languages & Certifications */}
          <VStack align="start" spacing={2}>
            <Flex align="center">
              <Icon as={FaLanguage} color="purple.500" mr={2} />
              <Heading size="sm">Languages</Heading>
            </Flex>
            {analysis.languages.map((language, index) => (
              <Text key={index}>
                <strong>{language.name}:</strong> {language.proficiency}
              </Text>
            ))}
            <Box h={2} />
            <Flex align="center">
              <Icon as={FaAward} color="yellow.500" mr={2} />
              <Heading size="sm">Certifications</Heading>
            </Flex>
            {analysis.certifications.map((cert, index) => (
              <Text key={index}>
                <strong>{cert.name}</strong> ({cert.year})
              </Text>
            ))}
          </VStack>

          {/* Additional Skills */}
          <VStack align="start" spacing={2}>
            <Flex align="center">
              <Icon as={FaTools} color="green.500" mr={2} />
              <Heading size="sm">Additional Skills</Heading>
            </Flex>
            {analysis.skills.additional.map((skill, index) => (
              <Text key={index}>
                <strong>{skill.name}:</strong> {skill.level} ({skill.years}{' '}
                {skill.years === 1 ? 'year' : 'years'})
              </Text>
            ))}
          </VStack>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default ResumeAnalysis;
