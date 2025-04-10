import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Stack,
  Heading,
  Text,
  Flex,
  HStack,
  VStack,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Radio,
  RadioGroup,
  Icon,
  SimpleGrid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaPhone,
  FaBuilding,
  FaUserTie,
  FaUsers,
  FaCheckCircle,
  FaInfoCircle,
} from 'react-icons/fa';

// This component allows scheduling interviews with candidates
const InterviewScheduler = ({ candidate, interviewers, onSchedule }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Use mock data if real data is not provided
  const candidateData = candidate || {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    status: 'reviewing',
    match_score: 92,
    position: 'Senior Frontend Developer',
    company: 'Tech Solutions Inc.',
  };
  
  // Use mock interviewers if real data is not provided
  const interviewersList = interviewers || [
    {
      id: '1',
      name: 'Alex Rodriguez',
      position: 'Engineering Manager',
      department: 'Engineering',
      avatar: '',
      availability: [
        { date: '2023-07-10', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
        { date: '2023-07-11', slots: ['11:00 AM', '3:00 PM'] },
        { date: '2023-07-12', slots: ['9:00 AM', '1:00 PM', '5:00 PM'] },
      ],
    },
    {
      id: '2',
      name: 'Jessica Chen',
      position: 'Senior Developer',
      department: 'Engineering',
      avatar: '',
      availability: [
        { date: '2023-07-10', slots: ['9:00 AM', '1:00 PM', '5:00 PM'] },
        { date: '2023-07-11', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
        { date: '2023-07-13', slots: ['11:00 AM', '3:00 PM'] },
      ],
    },
    {
      id: '3',
      name: 'Michael Taylor',
      position: 'HR Manager',
      department: 'Human Resources',
      avatar: '',
      availability: [
        { date: '2023-07-11', slots: ['9:00 AM', '1:00 PM', '5:00 PM'] },
        { date: '2023-07-12', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
        { date: '2023-07-13', slots: ['11:00 AM', '3:00 PM'] },
      ],
    },
  ];
  
  // Interview types
  const interviewTypes = [
    { id: 'phone', name: 'Phone Interview', icon: FaPhone, color: 'blue' },
    { id: 'video', name: 'Video Interview', icon: FaVideo, color: 'purple' },
    { id: 'onsite', name: 'On-site Interview', icon: FaBuilding, color: 'green' },
    { id: 'panel', name: 'Panel Interview', icon: FaUsers, color: 'orange' },
    { id: 'technical', name: 'Technical Interview', icon: FaUserTie, color: 'red' },
  ];
  
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    type: 'video',
    interviewers: [],
    location: '',
    notes: '',
  });
  
  // Selected date state
  const [selectedDate, setSelectedDate] = useState('');
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get available dates from all interviewers
  const availableDates = [...new Set(
    interviewersList.flatMap(interviewer => 
      interviewer.availability.map(a => a.date)
    )
  )].sort();
  
  // Get available time slots for the selected date
  const getAvailableTimeSlots = (date) => {
    if (!date) return [];
    
    // Get all slots from interviewers who are available on the selected date
    const allSlots = interviewersList
      .filter(interviewer => 
        interviewer.availability.some(a => a.date === date)
      )
      .flatMap(interviewer => {
        const availabilityForDate = interviewer.availability.find(a => a.date === date);
        return availabilityForDate ? availabilityForDate.slots : [];
      });
    
    // Count occurrences of each slot
    const slotCounts = allSlots.reduce((acc, slot) => {
      acc[slot] = (acc[slot] || 0) + 1;
      return acc;
    }, {});
    
    // Get interviewers for each slot
    const slotsWithInterviewers = Object.keys(slotCounts).map(slot => {
      const interviewersForSlot = interviewersList.filter(interviewer => {
        const availabilityForDate = interviewer.availability.find(a => a.date === date);
        return availabilityForDate && availabilityForDate.slots.includes(slot);
      });
      
      return {
        time: slot,
        interviewers: interviewersForSlot,
        count: interviewersForSlot.length,
      };
    });
    
    // Sort by time
    return slotsWithInterviewers.sort((a, b) => {
      // Convert to 24-hour format for sorting
      const getHours = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
      };
      
      return getHours(a.time) - getHours(b.time);
    });
  };
  
  // Available time slots for the selected date
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);
  
  // Handle date selection
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setFormData({
      ...formData,
      date,
      time: '',
      interviewers: [],
    });
  };
  
  // Handle time selection
  const handleTimeChange = (e) => {
    const time = e.target.value;
    
    // Get interviewers available at this time
    const availableInterviewers = availableTimeSlots.find(slot => slot.time === time)?.interviewers || [];
    
    setFormData({
      ...formData,
      time,
      interviewers: availableInterviewers.map(i => i.id),
    });
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, we would call the API
      // await scheduleInterview(candidateData.id, formData);
      
      // For demo purposes, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close the modal
      onClose();
      
      // Show success toast
      toast({
        title: 'Interview scheduled',
        description: `Interview with ${candidateData.name} has been scheduled for ${formData.date} at ${formData.time}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Call the onSchedule callback if provided
      if (onSchedule) {
        onSchedule({
          candidate: candidateData,
          interview: {
            ...formData,
            interviewers: interviewersList.filter(i => formData.interviewers.includes(i.id)),
          },
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule interview',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  
  return (
    <>
      <Box
        p={5}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg={cardBg}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', md: 'center' }}
          mb={4}
        >
          <HStack spacing={4}>
            <Avatar size="md" name={candidateData.name} />
            <VStack align="start" spacing={0}>
              <Heading size="md">{candidateData.name}</Heading>
              <Text color="gray.500">{candidateData.position}</Text>
            </VStack>
          </HStack>
          
          <HStack spacing={4} mt={{ base: 4, md: 0 }}>
            <Badge colorScheme="blue" p={2} borderRadius="md">
              <HStack spacing={1}>
                <Icon as={FaCalendarAlt} />
                <Text>Ready for Interview</Text>
              </HStack>
            </Badge>
            <Button 
              colorScheme="blue" 
              leftIcon={<Icon as={FaCalendarAlt} />}
              onClick={onOpen}
            >
              Schedule Interview
            </Button>
          </HStack>
        </Flex>
        
        <Divider mb={4} />
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box>
            <Text fontWeight="medium" mb={1}>Contact Information</Text>
            <Text fontSize="sm">{candidateData.email}</Text>
            <Text fontSize="sm">{candidateData.phone}</Text>
          </Box>
          
          <Box>
            <Text fontWeight="medium" mb={1}>Match Score</Text>
            <Badge 
              colorScheme={
                candidateData.match_score >= 80 ? 'green' : 
                candidateData.match_score >= 60 ? 'yellow' : 'red'
              }
              fontSize="sm"
            >
              {candidateData.match_score}%
            </Badge>
          </Box>
          
          <Box>
            <Text fontWeight="medium" mb={1}>Current Status</Text>
            <Badge 
              colorScheme={
                candidateData.status === 'reviewing' ? 'blue' :
                candidateData.status === 'interviewing' ? 'purple' :
                candidateData.status === 'accepted' ? 'green' :
                candidateData.status === 'rejected' ? 'red' : 'yellow'
              }
              fontSize="sm"
            >
              {candidateData.status.charAt(0).toUpperCase() + candidateData.status.slice(1)}
            </Badge>
          </Box>
        </SimpleGrid>
        
        <Divider my={4} />
        
        <Heading size="sm" mb={4}>Available Interviewers</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {interviewersList.map(interviewer => (
            <Box 
              key={interviewer.id} 
              p={3} 
              borderWidth="1px" 
              borderRadius="md"
              _hover={{ bg: highlightBg }}
              transition="background 0.2s"
            >
              <HStack spacing={3}>
                <Avatar size="sm" name={interviewer.name} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{interviewer.name}</Text>
                  <Text fontSize="xs" color="gray.500">{interviewer.position}</Text>
                  <Text fontSize="xs" color="gray.500">{interviewer.department}</Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      
      {/* Interview Scheduling Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule Interview with {candidateData.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Select a date and time when interviewers are available. The system will automatically show you available time slots.
                  </Text>
                </Alert>
                
                <FormControl isRequired>
                  <FormLabel>Interview Date</FormLabel>
                  <Select
                    name="date"
                    value={formData.date}
                    onChange={handleDateChange}
                    placeholder="Select date"
                  >
                    {availableDates.map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedDate && (
                  <FormControl isRequired>
                    <FormLabel>Interview Time</FormLabel>
                    <Select
                      name="time"
                      value={formData.time}
                      onChange={handleTimeChange}
                      placeholder="Select time"
                    >
                      {availableTimeSlots.map(slot => (
                        <option key={slot.time} value={slot.time}>
                          {slot.time} ({slot.count} interviewer{slot.count !== 1 ? 's' : ''} available)
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                {formData.time && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Duration</FormLabel>
                      <Select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Interview Type</FormLabel>
                      <RadioGroup 
                        value={formData.type}
                        onChange={(value) => setFormData({...formData, type: value})}
                      >
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          {interviewTypes.map(type => (
                            <Radio key={type.id} value={type.id}>
                              <HStack>
                                <Icon as={type.icon} color={`${type.color}.500`} />
                                <Text>{type.name}</Text>
                              </HStack>
                            </Radio>
                          ))}
                        </SimpleGrid>
                      </RadioGroup>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Location / Meeting Link</FormLabel>
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder={
                          formData.type === 'video' ? 'Zoom/Teams link' : 
                          formData.type === 'phone' ? 'Phone number' : 
                          formData.type === 'onsite' ? 'Office address' : 
                          'Location details'
                        }
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Available Interviewers</FormLabel>
                      <Box borderWidth="1px" borderRadius="md" p={3}>
                        {formData.interviewers.length > 0 ? (
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            {interviewersList
                              .filter(i => formData.interviewers.includes(i.id))
                              .map(interviewer => (
                                <HStack key={interviewer.id} spacing={2}>
                                  <Avatar size="xs" name={interviewer.name} />
                                  <Text fontSize="sm">{interviewer.name}</Text>
                                  <Tag size="sm" colorScheme="green" variant="subtle">
                                    <TagLeftIcon as={FaCheckCircle} />
                                    <TagLabel>Available</TagLabel>
                                  </Tag>
                                </HStack>
                              ))
                            }
                          </SimpleGrid>
                        ) : (
                          <Text color="gray.500">No interviewers available at this time</Text>
                        )}
                      </Box>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Notes for Interviewers</FormLabel>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Add any special instructions or topics to cover"
                        rows={3}
                      />
                    </FormControl>
                  </>
                )}
              </Stack>
            </form>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!formData.date || !formData.time || formData.interviewers.length === 0}
            >
              Schedule Interview
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default InterviewScheduler;
