import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Flex,
  Icon,
  Stack,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Container,
  SimpleGrid,
  HStack,
  VStack,
  Card,
  CardBody,
  CardFooter,
  Image,
} from '@chakra-ui/react';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaClock, 
  FaBriefcase, 
  FaCheckCircle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
  FaLaptopCode,
  FaGraduationCap,
} from 'react-icons/fa';
import NextLink from 'next/link';

const JobPosting = ({ job }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');

  // Sample company logo - in a real app, this would come from the job data
  const companyLogo = 'https://via.placeholder.com/150';

  return (
    <Container maxW="container.xl" py={8}>
      {/* Job Header */}
      <Card 
        bg={cardBg} 
        borderWidth="1px" 
        borderColor={borderColor} 
        borderRadius="xl" 
        overflow="hidden"
        boxShadow="lg"
        mb={8}
      >
        <Box bg="blue.500" h="16px" />
        <CardBody>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'flex-start', md: 'center' }}
            justify="space-between"
            wrap="wrap"
            gap={4}
          >
            <Flex align="center">
              <Box 
                borderWidth="1px" 
                borderColor={borderColor} 
                borderRadius="md" 
                p={2} 
                bg="white" 
                mr={4}
              >
                <Image 
                  src={companyLogo} 
                  alt={job.companies?.name || 'Company logo'} 
                  boxSize="60px"
                  objectFit="contain"
                />
              </Box>
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  {job.title}
                </Heading>
                <Flex align="center" color="gray.600" flexWrap="wrap" gap={3}>
                  <Flex align="center">
                    <Icon as={FaBuilding} mr={1} />
                    <Text>{job.companies?.name || 'Unknown Company'}</Text>
                  </Flex>
                  
                  {job.department && (
                    <Flex align="center">
                      <Icon as={FaBriefcase} mr={1} />
                      <Text>{job.department}</Text>
                    </Flex>
                  )}
                  
                  <Flex align="center">
                    <Icon as={FaClock} mr={1} />
                    <Text>Posted {new Date(job.created_at).toLocaleDateString()}</Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
            
            <Button 
              as={NextLink}
              href={`/jobs/${job.id}/apply`}
              colorScheme="blue" 
              size="lg"
              borderRadius="full"
              px={8}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            >
              Apply Now
            </Button>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Job Content */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        {/* Main Content */}
        <Box gridColumn="span 2">
          {/* Job Description */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" mb={8} boxShadow="md">
            <CardBody>
              <Heading as="h2" size="lg" mb={4}>
                Job Description
              </Heading>
              <Text whiteSpace="pre-line" fontSize="md" lineHeight="tall">
                {job.description}
              </Text>
            </CardBody>
          </Card>
          
          {/* Key Responsibilities */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" mb={8} boxShadow="md">
            <CardBody>
              <Heading as="h2" size="lg" mb={4}>
                Key Responsibilities
              </Heading>
              <List spacing={3}>
                {/* In a real app, these would come from the job data */}
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Design and develop robust, scalable, and secure software solutions
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Collaborate with cross-functional teams to define and implement new features
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Write clean, maintainable code and perform code reviews
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Troubleshoot and debug applications to optimize performance
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Stay up-to-date with emerging trends and technologies
                </ListItem>
              </List>
            </CardBody>
          </Card>
          
          {/* Qualifications */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" mb={8} boxShadow="md">
            <CardBody>
              <Heading as="h2" size="lg" mb={4}>
                Qualifications
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Flex align="center" mb={3}>
                    <Icon as={FaGraduationCap} color="blue.500" boxSize={5} mr={2} />
                    <Heading size="md">Education</Heading>
                  </Flex>
                  <List spacing={2} ml={7}>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Bachelor's degree in Computer Science or related field
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Relevant certifications are a plus
                    </ListItem>
                  </List>
                </Box>
                
                <Box>
                  <Flex align="center" mb={3}>
                    <Icon as={FaUsers} color="blue.500" boxSize={5} mr={2} />
                    <Heading size="md">Experience</Heading>
                  </Flex>
                  <List spacing={2} ml={7}>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      3+ years of professional experience
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Previous work in a similar role
                    </ListItem>
                  </List>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
          
          {/* Benefits */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" boxShadow="md">
            <CardBody>
              <Heading as="h2" size="lg" mb={4}>
                Benefits
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="start" spacing={4}>
                  <Flex align="center">
                    <Icon as={FaMoneyBillWave} color="green.500" boxSize={5} mr={3} />
                    <Text fontWeight="medium">Competitive salary</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaCalendarAlt} color="green.500" boxSize={5} mr={3} />
                    <Text fontWeight="medium">Flexible working hours</Text>
                  </Flex>
                </VStack>
                
                <VStack align="start" spacing={4}>
                  <Flex align="center">
                    <Icon as={FaLaptopCode} color="green.500" boxSize={5} mr={3} />
                    <Text fontWeight="medium">Remote work options</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaUsers} color="green.500" boxSize={5} mr={3} />
                    <Text fontWeight="medium">Professional development</Text>
                  </Flex>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        </Box>
        
        {/* Sidebar */}
        <Box>
          {/* Job Overview */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" mb={6} boxShadow="md">
            <CardBody>
              <Heading as="h2" size="md" mb={4}>
                Job Overview
              </Heading>
              <VStack spacing={4} align="stretch">
                <Flex>
                  <Icon as={FaBriefcase} color="blue.500" boxSize={5} mr={3} />
                  <Box>
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">
                      Job Type
                    </Text>
                    <Text>Full-time</Text>
                  </Box>
                </Flex>
                
                <Flex>
                  <Icon as={FaMapMarkerAlt} color="blue.500" boxSize={5} mr={3} />
                  <Box>
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">
                      Location
                    </Text>
                    <Text>Remote / San Francisco, CA</Text>
                  </Box>
                </Flex>
                
                <Flex>
                  <Icon as={FaMoneyBillWave} color="blue.500" boxSize={5} mr={3} />
                  <Box>
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">
                      Salary Range
                    </Text>
                    <Text>$80,000 - $120,000 per year</Text>
                  </Box>
                </Flex>
                
                <Flex>
                  <Icon as={FaCalendarAlt} color="blue.500" boxSize={5} mr={3} />
                  <Box>
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">
                      Start Date
                    </Text>
                    <Text>Immediate</Text>
                  </Box>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Required Skills */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" mb={6} boxShadow="md">
            <CardBody>
              <Heading as="h2" size="md" mb={4}>
                Required Skills
              </Heading>
              {job.required_skills && job.required_skills.length > 0 ? (
                <List spacing={2}>
                  {job.required_skills.map((skill, index) => (
                    <ListItem key={index}>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      {skill}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Text color="gray.500">No specific skills listed</Text>
              )}
            </CardBody>
          </Card>
          
          {/* Soft Skills */}
          {job.soft_skills_priorities && Object.keys(job.soft_skills_priorities).length > 0 && (
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" mb={6} boxShadow="md">
              <CardBody>
                <Heading as="h2" size="md" mb={4}>
                  Soft Skills
                </Heading>
                <List spacing={2}>
                  {Object.entries(job.soft_skills_priorities).map(([skill, priority], index) => (
                    <ListItem key={index}>
                      <Flex justify="space-between" align="center">
                        <Flex align="center">
                          <ListIcon as={FaCheckCircle} color="blue.500" />
                          {skill}
                        </Flex>
                        <Badge 
                          colorScheme={
                            priority > 80 ? "red" : 
                            priority > 60 ? "orange" : 
                            priority > 40 ? "yellow" : 
                            "green"
                          }
                          borderRadius="full"
                          px={2}
                        >
                          {priority}%
                        </Badge>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>
          )}
          
          {/* Apply Button */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" boxShadow="md">
            <CardBody textAlign="center" py={6}>
              <Heading size="md" mb={4}>
                Interested in this position?
              </Heading>
              <Button 
                as={NextLink}
                href={`/jobs/${job.id}/apply`}
                colorScheme="blue" 
                size="lg"
                width="100%"
                borderRadius="full"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              >
                Apply Now
              </Button>
              <Text fontSize="sm" color="gray.500" mt={4}>
                Application takes less than 5 minutes
              </Text>
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default JobPosting;
