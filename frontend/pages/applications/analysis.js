import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  Button,
  HStack,
  Select,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react';
import {
  FaChartPie,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaChartLine,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
} from 'react-icons/fa';
import { withAuth } from '../../context/AuthContext';
import CandidateComparison from '../../components/CandidateComparison';
import ResumeAnalysis from '../../components/ResumeAnalysis';
import InterviewScheduler from '../../components/InterviewScheduler';
import dynamic from 'next/dynamic';

// Import charts dynamically to avoid SSR issues
const Chart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

const ApplicationAnalysisPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobFilter, setJobFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  
  // Mock jobs data
  const jobs = [
    { id: 'all', title: 'All Jobs' },
    { id: '1', title: 'Software Engineer' },
    { id: '2', title: 'Product Manager' },
    { id: '3', title: 'UX Designer' },
    { id: '4', title: 'Data Scientist' },
    { id: '5', title: 'Marketing Specialist' },
  ];
  
  // Mock analytics data
  const analyticsData = {
    total_applications: 143,
    new_applications: 28,
    in_review: 45,
    interviewing: 32,
    rejected: 28,
    hired: 10,
    average_score: 76,
    application_sources: [
      { source: 'Company Website', count: 65 },
      { source: 'LinkedIn', count: 42 },
      { source: 'Indeed', count: 23 },
      { source: 'Referral', count: 8 },
      { source: 'Other', count: 5 },
    ],
    application_trends: [
      { date: '2023-05-01', count: 12 },
      { date: '2023-05-08', count: 18 },
      { date: '2023-05-15', count: 15 },
      { date: '2023-05-22', count: 22 },
      { date: '2023-05-29', count: 28 },
      { date: '2023-06-05', count: 25 },
      { date: '2023-06-12', count: 23 },
    ],
    skill_distribution: [
      { skill: 'JavaScript', count: 95 },
      { skill: 'React', count: 78 },
      { skill: 'Node.js', count: 62 },
      { skill: 'TypeScript', count: 45 },
      { skill: 'Python', count: 38 },
      { skill: 'SQL', count: 72 },
      { skill: 'AWS', count: 35 },
      { skill: 'Docker', count: 28 },
    ],
    experience_distribution: [
      { range: '0-1 years', count: 25 },
      { range: '1-3 years', count: 48 },
      { range: '3-5 years', count: 35 },
      { range: '5-7 years', count: 22 },
      { range: '7+ years', count: 13 },
    ],
    education_distribution: [
      { level: "High School", count: 5 },
      { level: "Associate's Degree", count: 12 },
      { level: "Bachelor's Degree", count: 85 },
      { level: "Master's Degree", count: 35 },
      { level: "PhD", count: 6 },
    ],
    match_score_distribution: [
      { range: '90-100%', count: 15 },
      { range: '80-89%', count: 28 },
      { range: '70-79%', count: 42 },
      { range: '60-69%', count: 35 },
      { range: 'Below 60%', count: 23 },
    ],
  };
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, we would call the API
        // const data = await getApplicationAnalytics(jobFilter, timeFilter);
        
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set analytics data
        setAnalysisData(analyticsData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobFilter, timeFilter]);
  
  // Handle candidate selection
  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidate(candidateId);
  };
  
  // Chart options and series
  const applicationSourcesChart = {
    options: {
      chart: {
        type: 'pie',
        fontFamily: 'inherit',
      },
      labels: analyticsData.application_sources.map(item => item.source),
      legend: {
        position: 'bottom',
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      colors: ['#4299E1', '#805AD5', '#38A169', '#DD6B20', '#E53E3E'],
    },
    series: analyticsData.application_sources.map(item => item.count),
  };
  
  const applicationTrendsChart = {
    options: {
      chart: {
        type: 'area',
        fontFamily: 'inherit',
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: analyticsData.application_trends.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        labels: {
          style: {
            colors: '#718096',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#718096',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
        },
      },
      colors: ['#4299E1'],
      tooltip: {
        y: {
          formatter: function(val) {
            return val + " applications";
          }
        }
      },
    },
    series: [{
      name: 'Applications',
      data: analyticsData.application_trends.map(item => item.count),
    }],
  };
  
  const skillDistributionChart = {
    options: {
      chart: {
        type: 'bar',
        fontFamily: 'inherit',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: analyticsData.skill_distribution.map(item => item.skill),
        labels: {
          style: {
            colors: '#718096',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#718096',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ['#805AD5'],
      tooltip: {
        y: {
          formatter: function(val) {
            return val + " candidates";
          }
        }
      },
    },
    series: [{
      name: 'Candidates',
      data: analyticsData.skill_distribution.map(item => item.count),
    }],
  };
  
  const experienceDistributionChart = {
    options: {
      chart: {
        type: 'donut',
        fontFamily: 'inherit',
      },
      labels: analyticsData.experience_distribution.map(item => item.range),
      legend: {
        position: 'bottom',
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      colors: ['#38A169', '#4299E1', '#805AD5', '#DD6B20', '#E53E3E'],
    },
    series: analyticsData.experience_distribution.map(item => item.count),
  };
  
  const educationDistributionChart = {
    options: {
      chart: {
        type: 'donut',
        fontFamily: 'inherit',
      },
      labels: analyticsData.education_distribution.map(item => item.level),
      legend: {
        position: 'bottom',
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      colors: ['#E53E3E', '#DD6B20', '#4299E1', '#805AD5', '#38A169'],
    },
    series: analyticsData.education_distribution.map(item => item.count),
  };
  
  const matchScoreDistributionChart = {
    options: {
      chart: {
        type: 'bar',
        fontFamily: 'inherit',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          distributed: true,
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: analyticsData.match_score_distribution.map(item => item.range),
        labels: {
          style: {
            colors: '#718096',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#718096',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ['#38A169', '#68D391', '#F6E05E', '#F6AD55', '#FC8181'],
      tooltip: {
        y: {
          formatter: function(val) {
            return val + " candidates";
          }
        }
      },
    },
    series: [{
      name: 'Candidates',
      data: analyticsData.match_score_distribution.map(item => item.count),
    }],
  };
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={2}>Application Analysis</Heading>
      <Text color="gray.600" mb={6}>
        Analyze and compare candidates for your job listings
      </Text>
      
      {/* Filters */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'stretch', md: 'center' }}
        mb={6}
        gap={4}
      >
        <HStack spacing={4}>
          <Select 
            maxW="300px" 
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            icon={<FaFilter />}
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </Select>
          
          <Select 
            maxW="200px" 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            icon={<FaCalendarAlt />}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </Select>
        </HStack>
        
        <Button 
          leftIcon={<FaDownload />} 
          colorScheme="blue" 
          variant="outline"
        >
          Export Report
        </Button>
      </Flex>
      
      {/* Loading State */}
      {loading && (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text ml={4} fontSize="lg">Loading analytics data...</Text>
        </Flex>
      )}
      
      {/* Error State */}
      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Content */}
      {!loading && !error && analysisData && (
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab><Icon as={FaChartPie} mr={2} /> Overview</Tab>
            <Tab><Icon as={FaUsers} mr={2} /> Candidates</Tab>
            {selectedCandidate && (
              <Tab><Icon as={FaUserCheck} mr={2} /> Candidate Analysis</Tab>
            )}
          </TabList>
          
          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0}>
              {/* Stats Cards */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                <Stat
                  px={4}
                  py={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                  borderLeft="4px solid"
                  borderColor="blue.400"
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel fontWeight="medium">Total Applications</StatLabel>
                      <StatNumber fontSize="3xl" fontWeight="medium">
                        {analysisData.total_applications}
                      </StatNumber>
                      <StatHelpText mb={0}>
                        <Text as="span" color="green.500">+{analysisData.new_applications}</Text> new
                      </StatHelpText>
                    </Box>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      rounded="full"
                      bg="blue.100"
                      color="blue.600"
                      h={12}
                      w={12}
                    >
                      <Icon as={FaUsers} boxSize={6} />
                    </Flex>
                  </Flex>
                </Stat>
                
                <Stat
                  px={4}
                  py={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                  borderLeft="4px solid"
                  borderColor="purple.400"
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel fontWeight="medium">In Review</StatLabel>
                      <StatNumber fontSize="3xl" fontWeight="medium">
                        {analysisData.in_review}
                      </StatNumber>
                      <StatHelpText mb={0}>
                        {Math.round((analysisData.in_review / analysisData.total_applications) * 100)}% of total
                      </StatHelpText>
                    </Box>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      rounded="full"
                      bg="purple.100"
                      color="purple.600"
                      h={12}
                      w={12}
                    >
                      <Icon as={FaUserClock} boxSize={6} />
                    </Flex>
                  </Flex>
                </Stat>
                
                <Stat
                  px={4}
                  py={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                  borderLeft="4px solid"
                  borderColor="green.400"
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel fontWeight="medium">Hired</StatLabel>
                      <StatNumber fontSize="3xl" fontWeight="medium">
                        {analysisData.hired}
                      </StatNumber>
                      <StatHelpText mb={0}>
                        {Math.round((analysisData.hired / analysisData.total_applications) * 100)}% conversion rate
                      </StatHelpText>
                    </Box>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      rounded="full"
                      bg="green.100"
                      color="green.600"
                      h={12}
                      w={12}
                    >
                      <Icon as={FaUserCheck} boxSize={6} />
                    </Flex>
                  </Flex>
                </Stat>
                
                <Stat
                  px={4}
                  py={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                  borderLeft="4px solid"
                  borderColor="orange.400"
                >
                  <Flex justifyContent="space-between">
                    <Box>
                      <StatLabel fontWeight="medium">Average Match Score</StatLabel>
                      <StatNumber fontSize="3xl" fontWeight="medium">
                        {analysisData.average_score}%
                      </StatNumber>
                      <StatHelpText mb={0}>
                        Across all applications
                      </StatHelpText>
                    </Box>
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      rounded="full"
                      bg="orange.100"
                      color="orange.600"
                      h={12}
                      w={12}
                    >
                      <Icon as={FaChartLine} boxSize={6} />
                    </Flex>
                  </Flex>
                </Stat>
              </SimpleGrid>
              
              {/* Charts */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
                <Box
                  p={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                >
                  <Heading size="md" mb={4}>Application Trends</Heading>
                  <Chart
                    options={applicationTrendsChart.options}
                    series={applicationTrendsChart.series}
                    type="area"
                    height={300}
                  />
                </Box>
                
                <Box
                  p={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                >
                  <Heading size="md" mb={4}>Application Sources</Heading>
                  <Chart
                    options={applicationSourcesChart.options}
                    series={applicationSourcesChart.series}
                    type="pie"
                    height={300}
                  />
                </Box>
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
                <Box
                  p={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                >
                  <Heading size="md" mb={4}>Skill Distribution</Heading>
                  <Chart
                    options={skillDistributionChart.options}
                    series={skillDistributionChart.series}
                    type="bar"
                    height={350}
                  />
                </Box>
                
                <Box
                  p={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                >
                  <Heading size="md" mb={4}>Match Score Distribution</Heading>
                  <Chart
                    options={matchScoreDistributionChart.options}
                    series={matchScoreDistributionChart.series}
                    type="bar"
                    height={350}
                  />
                </Box>
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box
                  p={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                >
                  <Heading size="md" mb={4}>Experience Distribution</Heading>
                  <Chart
                    options={experienceDistributionChart.options}
                    series={experienceDistributionChart.series}
                    type="donut"
                    height={300}
                  />
                </Box>
                
                <Box
                  p={5}
                  bg={cardBg}
                  shadow="base"
                  rounded="lg"
                >
                  <Heading size="md" mb={4}>Education Distribution</Heading>
                  <Chart
                    options={educationDistributionChart.options}
                    series={educationDistributionChart.series}
                    type="donut"
                    height={300}
                  />
                </Box>
              </SimpleGrid>
            </TabPanel>
            
            {/* Candidates Tab */}
            <TabPanel px={0}>
              <CandidateComparison onSelectCandidate={handleSelectCandidate} />
            </TabPanel>
            
            {/* Candidate Analysis Tab */}
            {selectedCandidate && (
              <TabPanel px={0}>
                <Box mb={8}>
                  <InterviewScheduler />
                </Box>
                
                <Divider mb={8} />
                
                <ResumeAnalysis />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      )}
    </Container>
  );
};

export default withAuth(ApplicationAnalysisPage, { requiredRole: 'employer' });
