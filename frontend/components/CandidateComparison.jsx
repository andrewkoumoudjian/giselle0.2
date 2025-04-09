import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Flex,
  Icon,
  HStack,
  VStack,
  Avatar,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useColorModeValue,
  Tooltip,
  Progress,
  SimpleGrid,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  FaChevronDown,
  FaFilter,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDownload,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';

// This component allows comparing multiple candidates for a job
const CandidateComparison = ({ candidates, jobRequirements, onSelectCandidate }) => {
  // Use mock data if real data is not provided
  const candidatesList = candidates || [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      status: 'reviewing',
      match_score: 85,
      skills: {
        matched: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML/CSS'],
        missing: ['GraphQL', 'AWS'],
      },
      experience: {
        years: 5,
        relevant_years: 3,
      },
      education: "Bachelor's Degree",
      applied_date: '2023-06-15',
      resume_url: '#',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '(555) 987-6543',
      status: 'interviewing',
      match_score: 92,
      skills: {
        matched: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML/CSS', 'GraphQL', 'AWS'],
        missing: [],
      },
      experience: {
        years: 7,
        relevant_years: 5,
      },
      education: "Master's Degree",
      applied_date: '2023-06-10',
      resume_url: '#',
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '(555) 456-7890',
      status: 'pending',
      match_score: 78,
      skills: {
        matched: ['JavaScript', 'React', 'HTML/CSS'],
        missing: ['Node.js', 'TypeScript', 'GraphQL', 'AWS'],
      },
      experience: {
        years: 3,
        relevant_years: 2,
      },
      education: "Bachelor's Degree",
      applied_date: '2023-06-05',
      resume_url: '#',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '(555) 789-0123',
      status: 'rejected',
      match_score: 65,
      skills: {
        matched: ['JavaScript', 'HTML/CSS'],
        missing: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'AWS'],
      },
      experience: {
        years: 2,
        relevant_years: 1,
      },
      education: "Associate's Degree",
      applied_date: '2023-06-01',
      resume_url: '#',
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '(555) 234-5678',
      status: 'accepted',
      match_score: 95,
      skills: {
        matched: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML/CSS', 'GraphQL', 'AWS', 'Docker'],
        missing: [],
      },
      experience: {
        years: 8,
        relevant_years: 6,
      },
      education: "Master's Degree",
      applied_date: '2023-05-28',
      resume_url: '#',
    },
  ];

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  // Status badge color mapping
  const statusColors = {
    pending: 'yellow',
    reviewing: 'blue',
    interviewing: 'purple',
    rejected: 'red',
    accepted: 'green',
  };

  // Status icon mapping
  const statusIcons = {
    pending: FaUserClock,
    reviewing: FaUserCheck,
    interviewing: FaUserCheck,
    rejected: FaUserTimes,
    accepted: FaUserCheck,
  };

  // Filter candidates
  const filteredCandidates = candidatesList.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'match_score') {
      comparison = a.match_score - b.match_score;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'applied_date') {
      comparison = new Date(a.applied_date) - new Date(b.applied_date);
    } else if (sortBy === 'experience') {
      comparison = a.experience.relevant_years - b.experience.relevant_years;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Toggle candidate selection
  const toggleCandidateSelection = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Background colors
  const tableBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  return (
    <Box>
      <Heading size="lg" mb={6}>Candidate Comparison</Heading>
      
      {/* Filters and Actions */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'stretch', md: 'center' }}
        mb={4}
        gap={4}
      >
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Search candidates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            maxW="200px" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            icon={<FaFilter />}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </Select>
        </HStack>
        
        <HStack spacing={4}>
          <Menu>
            <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="outline">
              Sort By: {sortBy.replace('_', ' ').charAt(0).toUpperCase() + sortBy.replace('_', ' ').slice(1)}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSortBy('match_score')}>Match Score</MenuItem>
              <MenuItem onClick={() => setSortBy('name')}>Name</MenuItem>
              <MenuItem onClick={() => setSortBy('applied_date')}>Application Date</MenuItem>
              <MenuItem onClick={() => setSortBy('experience')}>Experience</MenuItem>
            </MenuList>
          </Menu>
          
          <Button 
            variant="ghost" 
            onClick={toggleSortOrder}
            aria-label="Toggle sort order"
          >
            <Icon as={sortOrder === 'desc' ? FaSortAmountDown : FaSortAmountUp} />
          </Button>
          
          {selectedCandidates.length > 0 && (
            <Menu>
              <MenuButton as={Button} colorScheme="blue">
                Actions ({selectedCandidates.length})
              </MenuButton>
              <MenuList>
                <MenuItem icon={<Icon as={FaEnvelope} />}>Email Selected</MenuItem>
                <MenuItem icon={<Icon as={FaDownload} />}>Export Selected</MenuItem>
                <Divider />
                <MenuItem icon={<Icon as={FaUserCheck} />} color="green.500">Move to Interviewing</MenuItem>
                <MenuItem icon={<Icon as={FaUserTimes} />} color="red.500">Reject Selected</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
      
      {/* Candidates Table */}
      <Box overflowX="auto">
        <Table variant="simple" bg={tableBg} borderRadius="lg" boxShadow="md">
          <Thead>
            <Tr>
              <Th width="40px">
                <Checkbox 
                  isChecked={selectedCandidates.length === sortedCandidates.length && sortedCandidates.length > 0}
                  isIndeterminate={selectedCandidates.length > 0 && selectedCandidates.length < sortedCandidates.length}
                  onChange={() => {
                    if (selectedCandidates.length === sortedCandidates.length) {
                      setSelectedCandidates([]);
                    } else {
                      setSelectedCandidates(sortedCandidates.map(c => c.id));
                    }
                  }}
                />
              </Th>
              <Th>Candidate</Th>
              <Th>Match Score</Th>
              <Th>Skills</Th>
              <Th>Experience</Th>
              <Th>Status</Th>
              <Th>Applied</Th>
              <Th width="100px">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedCandidates.map(candidate => (
              <Tr 
                key={candidate.id}
                _hover={{ bg: hoverBg }}
                bg={selectedCandidates.includes(candidate.id) ? selectedBg : 'inherit'}
              >
                <Td>
                  <Checkbox 
                    isChecked={selectedCandidates.includes(candidate.id)}
                    onChange={() => toggleCandidateSelection(candidate.id)}
                  />
                </Td>
                <Td>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={candidate.name} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{candidate.name}</Text>
                      <Text fontSize="sm" color="gray.500">{candidate.email}</Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <HStack>
                    <Progress 
                      value={candidate.match_score} 
                      colorScheme={
                        candidate.match_score >= 80 ? 'green' : 
                        candidate.match_score >= 60 ? 'yellow' : 'red'
                      } 
                      size="sm" 
                      borderRadius="full" 
                      width="100px"
                    />
                    <Badge 
                      colorScheme={
                        candidate.match_score >= 80 ? 'green' : 
                        candidate.match_score >= 60 ? 'yellow' : 'red'
                      }
                    >
                      {candidate.match_score}%
                    </Badge>
                  </HStack>
                </Td>
                <Td>
                  <HStack>
                    <Badge colorScheme="green">{candidate.skills.matched.length}</Badge>
                    <Text>/</Text>
                    <Badge colorScheme={candidate.skills.missing.length > 0 ? 'red' : 'green'}>
                      {candidate.skills.missing.length}
                    </Badge>
                    <Tooltip 
                      label={
                        <>
                          <Text fontWeight="bold">Matched Skills:</Text>
                          {candidate.skills.matched.map(skill => (
                            <Text key={skill}>{skill}</Text>
                          ))}
                          {candidate.skills.missing.length > 0 && (
                            <>
                              <Text fontWeight="bold" mt={2}>Missing Skills:</Text>
                              {candidate.skills.missing.map(skill => (
                                <Text key={skill}>{skill}</Text>
                              ))}
                            </>
                          )}
                        </>
                      } 
                      hasArrow
                      placement="top"
                    >
                      <Text fontSize="sm" color="blue.500" cursor="help">
                        Details
                      </Text>
                    </Tooltip>
                  </HStack>
                </Td>
                <Td>
                  <Text>{candidate.experience.relevant_years} years relevant</Text>
                  <Text fontSize="sm" color="gray.500">
                    {candidate.education}
                  </Text>
                </Td>
                <Td>
                  <Badge 
                    colorScheme={statusColors[candidate.status]} 
                    display="flex"
                    alignItems="center"
                    px={2}
                    py={1}
                  >
                    <Icon as={statusIcons[candidate.status]} mr={1} />
                    <Text>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </Text>
                  </Badge>
                </Td>
                <Td>
                  {new Date(candidate.applied_date).toLocaleDateString()}
                </Td>
                <Td>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    variant="outline"
                    onClick={() => onSelectCandidate && onSelectCandidate(candidate.id)}
                  >
                    View
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        
        {sortedCandidates.length === 0 && (
          <Box textAlign="center" py={10} bg={tableBg} borderRadius="lg">
            <Text fontSize="lg" color="gray.500">No candidates found</Text>
          </Box>
        )}
      </Box>
      
      {/* Selected Candidates Comparison */}
      {selectedCandidates.length > 1 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>Detailed Comparison</Heading>
          <SimpleGrid columns={{ base: 1, md: selectedCandidates.length > 3 ? 3 : selectedCandidates.length }} spacing={4}>
            {selectedCandidates.map(id => {
              const candidate = candidatesList.find(c => c.id === id);
              return (
                <Box 
                  key={id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  boxShadow="md"
                  bg={tableBg}
                >
                  <VStack align="start" spacing={3}>
                    <HStack spacing={3}>
                      <Avatar size="md" name={candidate.name} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{candidate.name}</Text>
                        <Badge colorScheme={statusColors[candidate.status]}>
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </Badge>
                      </VStack>
                    </HStack>
                    
                    <Divider />
                    
                    <Box w="full">
                      <Text fontWeight="medium">Match Score</Text>
                      <Flex align="center" mt={1}>
                        <Progress 
                          value={candidate.match_score} 
                          colorScheme={
                            candidate.match_score >= 80 ? 'green' : 
                            candidate.match_score >= 60 ? 'yellow' : 'red'
                          } 
                          size="sm" 
                          borderRadius="full" 
                          flex="1" 
                          mr={2} 
                        />
                        <Badge 
                          colorScheme={
                            candidate.match_score >= 80 ? 'green' : 
                            candidate.match_score >= 60 ? 'yellow' : 'red'
                          }
                        >
                          {candidate.match_score}%
                        </Badge>
                      </Flex>
                    </Box>
                    
                    <Box w="full">
                      <Text fontWeight="medium">Skills</Text>
                      <Text mt={1}>
                        <Badge colorScheme="green">{candidate.skills.matched.length}</Badge> matched, 
                        <Badge ml={1} colorScheme={candidate.skills.missing.length > 0 ? 'red' : 'green'}>
                          {candidate.skills.missing.length}
                        </Badge> missing
                      </Text>
                    </Box>
                    
                    <Box w="full">
                      <Text fontWeight="medium">Experience</Text>
                      <Text mt={1}>{candidate.experience.relevant_years} years relevant</Text>
                      <Text fontSize="sm">{candidate.education}</Text>
                    </Box>
                    
                    <Box w="full">
                      <Text fontWeight="medium">Contact</Text>
                      <Text fontSize="sm" mt={1}>{candidate.email}</Text>
                      <Text fontSize="sm">{candidate.phone}</Text>
                    </Box>
                    
                    <Button 
                      colorScheme="blue" 
                      size="sm" 
                      w="full"
                      onClick={() => onSelectCandidate && onSelectCandidate(candidate.id)}
                    >
                      View Full Profile
                    </Button>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default CandidateComparison;
