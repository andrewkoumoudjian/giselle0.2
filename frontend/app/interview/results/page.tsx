'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  Card, 
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import GetAppIcon from '@mui/icons-material/GetApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import { useInterview } from '../../../lib/contexts/AppContext';
import api from '../../../lib/api';

// Type definitions for assessment data
type Skill = {
  name: string;
  value: number;
};

type ResponseQuality = {
  name: string;
  clarity: number;
  relevance: number;
  depth: number;
};

type JobMatchData = {
  subject: string;
  A: number;
  fullMark: number;
};

type QuestionFeedback = {
  question: string;
  feedback: string;
};

type AssessmentData = {
  overallAssessment: string;
  skillsData: Skill[];
  responseQualityData: ResponseQuality[];
  jobMatchData: JobMatchData[];
  strengthsWeaknesses: {
    strengths: string[];
    improvements: string[];
  };
  jobMatch: number;
  questionFeedback: QuestionFeedback[];
};

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`interview-tabpanel-${index}`}
      aria-labelledby={`interview-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Custom Grid component for layout
function Grid({ container, item, xs, md, spacing, children, sx }: any) {
  if (container) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          margin: spacing ? -0.5 * spacing : 0,
          ...sx
        }}
      >
        {children}
      </Box>
    );
  }
  
  return (
    <Box 
      sx={{ 
        flexBasis: xs === 12 ? '100%' : xs === 6 ? '50%' : `${(xs / 12) * 100}%`,
        maxWidth: xs === 12 ? '100%' : xs === 6 ? '50%' : `${(xs / 12) * 100}%`,
        padding: spacing ? 0.5 * spacing : 0,
        '@media (min-width: 900px)': {
          flexBasis: md === 8 ? '66.666667%' : md === 4 ? '33.333333%' : md === 6 ? '50%' : `${(md / 12) * 100}%`,
          maxWidth: md === 8 ? '66.666667%' : md === 4 ? '33.333333%' : md === 6 ? '50%' : `${(md / 12) * 100}%`,
        },
        ...sx
      }}
    >
      {children}
    </Box>
  );
}

export default function InterviewResults() {
  const searchParams = useSearchParams();
  const { currentInterview } = useInterview();
  
  const interviewId = searchParams.get('id') || currentInterview?.id;
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!interviewId) {
        setError('No interview ID provided. Please complete an interview first.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch interview details first to get job information
        const interviewResponse = await api.interviews.getById(interviewId);
        const interviewData = interviewResponse.data;
        
        // Fetch job details to get title
        const jobResponse = await api.jobs.getById(interviewData.job_id);
        setJobTitle(jobResponse.data.title);
        
        // Fetch assessment results
        const resultsResponse = await api.interviews.getResults(interviewId);
        
        // Map API response to our component's data format
        const apiData = resultsResponse.data;
        
        setAssessmentData({
          overallAssessment: apiData.overall_assessment,
          skillsData: apiData.skills_assessment.map((skill: any) => ({
            name: skill.name,
            value: skill.score
          })),
          responseQualityData: apiData.response_quality.map((response: any, index: number) => ({
            name: `Q${index + 1}`,
            clarity: response.clarity,
            relevance: response.relevance,
            depth: response.depth
          })),
          jobMatchData: apiData.job_match_radar.map((match: any) => ({
            subject: match.field,
            A: match.score,
            fullMark: 100
          })),
          strengthsWeaknesses: {
            strengths: apiData.strengths,
            improvements: apiData.improvements
          },
          jobMatch: apiData.job_match_percentage,
          questionFeedback: apiData.question_feedback.map((qf: any) => ({
            question: qf.question,
            feedback: qf.feedback
          }))
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to load interview results. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [interviewId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Use mock data as fallback if API data is not available
  const getMockData = (): AssessmentData => {
    return {
      overallAssessment: "Based on your interview responses, you demonstrated strong technical knowledge and excellent problem-solving abilities. Your communication was clear and concise, with good examples to illustrate your points. You could improve in some areas of leadership discussion by providing more concrete examples of your impact.",
      skillsData: [
        { name: 'Technical Knowledge', value: 85 },
        { name: 'Communication', value: 78 },
        { name: 'Problem Solving', value: 92 },
        { name: 'Teamwork', value: 88 },
        { name: 'Leadership', value: 72 }
      ],
      responseQualityData: [
        { name: 'Q1', clarity: 85, relevance: 90, depth: 75 },
        { name: 'Q2', clarity: 78, relevance: 82, depth: 80 },
        { name: 'Q3', clarity: 92, relevance: 88, depth: 90 },
        { name: 'Q4', clarity: 86, relevance: 92, depth: 85 },
        { name: 'Q5', clarity: 90, relevance: 85, depth: 92 }
      ],
      jobMatchData: [
        { subject: 'Tech Skills', A: 85, fullMark: 100 },
        { subject: 'Experience', A: 75, fullMark: 100 },
        { subject: 'Education', A: 90, fullMark: 100 },
        { subject: 'Soft Skills', A: 82, fullMark: 100 },
        { subject: 'Culture Fit', A: 88, fullMark: 100 }
      ],
      strengthsWeaknesses: {
        strengths: [
          "Strong technical knowledge of RESTful APIs and testing methodologies",
          "Excellent problem-solving approach with clear step-by-step thinking",
          "Good communication with concise, well-structured answers"
        ],
        improvements: [
          "Could provide more specific metrics when discussing project impacts",
          "Some leadership examples could be more detailed",
          "Consider expanding on how you handle conflict resolution"
        ]
      },
      jobMatch: 87,
      questionFeedback: [
        {
          question: "Can you describe your experience with developing RESTful APIs?",
          feedback: "You provided a comprehensive overview of your experience, including specific technologies and methodologies used. Your explanation of authentication and security considerations was particularly strong."
        },
        {
          question: "How do you approach testing in your software development process?",
          feedback: "Your answer demonstrated a thorough understanding of testing methodologies, including unit, integration, and end-to-end testing. You could have expanded more on how you prioritize test cases."
        },
        {
          question: "Tell me about a challenging project you worked on and how you overcame obstacles.",
          feedback: "You explained the technical challenges well and your problem-solving approach was clear. Consider adding more details about the specific impact of your solutions and how you measured success."
        },
        {
          question: "How do you stay updated with the latest technologies in your field?",
          feedback: "Your answer showed a proactive approach to learning, with multiple channels for staying updated. The examples of how you&apos;ve applied new knowledge to projects were particularly valuable."
        },
        {
          question: "Can you explain your approach to problem-solving in a team environment?",
          feedback: "Your collaborative approach was well-articulated, with good examples of how you facilitate team problem-solving. You might consider discussing how you handle situations when team members disagree."
        }
      ]
    };
  };
  
  // Use real data or fallback to mock data if not available yet
  const data = assessmentData || getMockData();

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6">
          Generating your interview results...
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          We&apos;re analyzing your responses to provide detailed feedback.
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          component={Link}
          href="/interview/start"
        >
          Start a New Interview
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Your Interview Results
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          Congratulations on completing your interview! Here&apos;s a detailed analysis of your performance.
        </Typography>
        <Chip 
          label={`${data.jobMatch}% Match for ${jobTitle || 'Software Developer'} Role`} 
          color="primary" 
          sx={{ 
            fontSize: '1rem', 
            py: 1.5, 
            px: 2,
            fontWeight: 600 
          }} 
        />
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="interview results tabs"
            sx={{ px: 2 }}
          >
            <Tab label="Overview" />
            <Tab label="Skills Assessment" />
            <Tab label="Question Analysis" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
              Overall Assessment
            </Typography>
            <Typography variant="body1" paragraph>
              {data.overallAssessment}
            </Typography>
            
            <Divider sx={{ my: 4 }} />
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                  Key Strengths
                </Typography>
                <Stack spacing={2}>
                  {data.strengthsWeaknesses.strengths.map((strength, idx) => (
                    <Box 
                      key={`strength-${idx}`} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'success.50',
                        border: '1px solid',
                        borderColor: 'success.200'
                      }}
                    >
                      <Typography variant="body1">
                        {strength}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                  Areas for Improvement
                </Typography>
                <Stack spacing={2}>
                  {data.strengthsWeaknesses.improvements.map((improvement, idx) => (
                    <Box 
                      key={`improvement-${idx}`} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'info.50',
                        border: '1px solid',
                        borderColor: 'info.200'
                      }}
                    >
                      <Typography variant="body1">
                        {improvement}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 6, mb: 4 }}>
              <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
                Job Match Analysis
              </Typography>
              <Typography variant="body1" paragraph>
                Based on your resume and interview responses, we&apos;ve calculated your match with the {jobTitle || 'Software Developer'} role:
              </Typography>
            </Box>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.jobMatchData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Your Profile" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
              Skills Assessment
            </Typography>
            <Typography variant="body1" paragraph>
              This assessment is based on your responses to technical and behavioral questions during the interview.
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                      Skill Distribution
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.skillsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {data.skillsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                      Detailed Skills Breakdown
                    </Typography>
                    
                    <Stack spacing={3}>
                      {data.skillsData.map((skill, index) => (
                        <Box key={`skill-detail-${index}`}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {skill.name}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {skill.value}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={skill.value} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: COLORS[index % COLORS.length],
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
                      Response Quality by Question
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data.responseQualityData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="clarity" stroke="#4F46E5" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="relevance" stroke="#10B981" />
                          <Line type="monotone" dataKey="depth" stroke="#F59E0B" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
              Question Analysis
            </Typography>
            <Typography variant="body1" paragraph>
              Detailed feedback for each question asked during your interview.
            </Typography>
            
            <Stack spacing={4}>
              {data.questionFeedback.map((item, index) => (
                <Card key={`question-${index}`} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Question {index + 1}:
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      &quot;{item.question}&quot;
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Feedback:
                    </Typography>
                    <Typography variant="body1">
                      {item.feedback}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </TabPanel>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<GetAppIcon />}
            sx={{ px: 3, py: 1.5 }}
            onClick={() => {
              // In a real implementation, this would generate a PDF report
              alert('This functionality would generate and download a PDF report of your interview results.');
            }}
          >
            Download Report
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            href="/"
            sx={{ px: 3, py: 1.5 }}
          >
            Back to Home
          </Button>
        </Stack>
      </Box>
    </Container>
  );
} 