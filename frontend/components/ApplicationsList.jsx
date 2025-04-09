import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  Text,
  Flex,
  Heading,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

const statusColors = {
  pending: 'yellow',
  reviewing: 'blue',
  interviewing: 'purple',
  rejected: 'red',
  accepted: 'green',
};

const ApplicationsList = ({ jobId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterScore, setFilterScore] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (filterStatus) params.append('status', filterStatus);
        if (filterScore > 0) params.append('minScore', filterScore);
        
        const response = await fetch(
          `/api/jobs/${jobId}/applications${params.toString() ? '?' + params.toString() : ''}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplications();
    }
  }, [jobId, filterStatus, filterScore]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Update the local state
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast({
        title: 'Status updated',
        description: `Application status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateInterview = async (applicationId) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create interview');
      }

      const data = await response.json();

      toast({
        title: 'Interview created',
        description: 'The interview has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update the application status in the local state
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: 'interviewing' } : app
        )
      );
    } catch (err) {
      console.error('Error creating interview:', err);
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading applications...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading applications: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        Job Applications
      </Heading>

      <Flex mb={4} gap={4}>
        <Select
          placeholder="Filter by status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          maxW="200px"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="interviewing">Interviewing</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
        </Select>

        <Select
          placeholder="Filter by match score"
          value={filterScore}
          onChange={(e) => setFilterScore(Number(e.target.value))}
          maxW="200px"
        >
          <option value="0">All scores</option>
          <option value="50">50+ Match</option>
          <option value="70">70+ Match</option>
          <option value="85">85+ Match</option>
        </Select>
      </Flex>

      {applications.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No applications found matching the current filters.
        </Alert>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Candidate</Th>
              <Th>Match Score</Th>
              <Th>Status</Th>
              <Th>Applied</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {applications.map((application) => (
              <Tr key={application.id}>
                <Td>
                  <Text fontWeight="bold">{application.candidates.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {application.candidates.email}
                  </Text>
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      application.match_score >= 85
                        ? 'green'
                        : application.match_score >= 70
                        ? 'blue'
                        : application.match_score >= 50
                        ? 'yellow'
                        : 'red'
                    }
                    fontSize="sm"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {application.match_score}%
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={statusColors[application.status]} px={2} py={1}>
                    {application.status}
                  </Badge>
                </Td>
                <Td>
                  {new Date(application.created_at).toLocaleDateString()}
                </Td>
                <Td>
                  <Flex gap={2}>
                    <Select
                      size="sm"
                      value={application.status}
                      onChange={(e) =>
                        handleStatusChange(application.id, e.target.value)
                      }
                      maxW="120px"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </Select>
                    
                    {application.status !== 'interviewing' && (
                      <Button
                        size="sm"
                        colorScheme="purple"
                        onClick={() => handleCreateInterview(application.id)}
                      >
                        Interview
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => {
                        // View application details
                        // This would typically navigate to a details page
                        console.log('View details for', application.id);
                      }}
                    >
                      View
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default ApplicationsList;
