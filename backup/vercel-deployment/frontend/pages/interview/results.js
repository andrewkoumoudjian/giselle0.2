import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import StarIcon from '@mui/icons-material/Star';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// API base URL from environment or default for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function InterviewResults() {
  const router = useRouter();
  const { id: interviewId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [interview, setInterview] = useState(null);
  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  
  // Fetch results data
  useEffect(() => {
    async function fetchResults() {
      if (!interviewId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch interview details
        const interviewResponse = await axios.get(`${API_URL}/interviews/${interviewId}`);
        const interviewData = interviewResponse.data;
        setInterview(interviewData);
        
        // Fetch job details
        const jobResponse = await axios.get(`${API_URL}/jobs/${interviewData.job_id}`);
        setJob(jobResponse.data);
        
        // Fetch candidate details
        const candidateResponse = await axios.get(`${API_URL}/candidates/${interviewData.candidate_id}`);
        setCandidate(candidateResponse.data);
        
        // Fetch assessment results
        const assessmentResponse = await axios.get(`${API_URL}/interviews/${interviewId}/assessment`);
        const assessmentData = assessmentResponse.data;
        
        setAssessmentData({
          overallAssessment: assessmentData.overall_assessment || "Assessment not available",
          skills: (assessmentData.skill_scores || []).map(skill => ({
            name: skill.name || "Unnamed skill",
            score: skill.score || 0
          })),
          responseQuality: {
            clarity: 4.2,
            relevance: 4.5,
            depth: 3.8
          },
          jobMatch: {
            percentage: assessmentData.job_match_percentage || 0,
            subjects: (assessmentData.job_match_subjects || []).map(subj => ({
              name: subj.name || "Unknown",
              score: subj.score || 0
            }))
          },
          strengths: assessmentData.strengths || [],
          improvements: assessmentData.improvements || [],
          questionFeedback: (assessmentData.question_feedback || []).map(feedback => ({
            questionId: feedback.question_id,
            feedback: feedback.feedback || "No feedback available"
          }))
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load assessment results. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchResults();
  }, [interviewId]);
  
  // Return to home
  const handleBack = () => {
    router.push('/');
  };
  
  // Calculate color based on score
  const getScoreColor = (score) => {
    if (score >= 4) return 'success.main';
    if (score >= 3) return 'info.main';
    if (score >= 2) return 'warning.main';
    return 'error.main';
  };
  
  // Format percentage for display
  const formatPercentage = (value) => {
    return `${Math.round(value)}%`;
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading assessment results...</Typography>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Home
        </Button>
      </Container>
    );
  }
  
  // Render results being generated state
  if (assessmentData && assessmentData.overallAssessment === "Assessment is being generated...") {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <CircularProgress sx={{ mb: 3 }} />
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            Your results are being generated
          </Typography>
          <Typography variant="body1" paragraph>
            Please check back in a few minutes. The AI is analyzing your interview responses.
          </Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Prepare chart data
  const skillChartData = assessmentData?.skills.map(skill => ({
    subject: skill.name,
    score: skill.score,
    fullMark: 5
  }));
  
  const responseQualityData = [
    { name: 'Clarity', value: assessmentData?.responseQuality.clarity || 0 },
    { name: 'Relevance', value: assessmentData?.responseQuality.relevance || 0 },
    { name: 'Depth', value: assessmentData?.responseQuality.depth || 0 }
  ];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Interview Assessment
        </Typography>
      </Box>
      
      {/* Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Overall Assessment
            </Typography>
            <Typography variant="body1" paragraph>
              {assessmentData?.overallAssessment}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                Job Match
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={assessmentData?.jobMatch.percentage || 0}
                    size={80}
                    thickness={4}
                    sx={{ color: getScoreColor(assessmentData?.jobMatch.percentage / 20) }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" component="div" color="text.secondary">
                      {formatPercentage(assessmentData?.jobMatch.percentage || 0)}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    {job?.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job?.company}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Candidate
            </Typography>
            <Typography variant="subtitle1">
              {candidate?.name}
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              {candidate?.email}
            </Typography>
            
            {candidate?.position && (
              <Typography variant="body2" color="text.secondary">
                Current Position: {candidate.position}
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Interview Date: {interview ? new Date(interview.completed_at).toLocaleDateString() : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Skills Assessment */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Skills Assessment
              </Typography>
              
              <Box sx={{ height: 300 }}>
                {skillChartData && skillChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} />
                      <Radar name="Skills" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      No skills data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Response Quality
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value) => [value.toFixed(1), 'Score']} />
                    <Legend />
                    <Bar dataKey="value" name="Score" fill="#3f51b5" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Strengths & Improvements */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                Strengths
              </Typography>
              
              {assessmentData?.strengths && assessmentData.strengths.length > 0 ? (
                <List>
                  {assessmentData.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No strengths identified
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                Areas for Improvement
              </Typography>
              
              {assessmentData?.improvements && assessmentData.improvements.length > 0 ? (
                <List>
                  {assessmentData.improvements.map((improvement, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <PriorityHighIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={improvement} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No improvement areas identified
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Question Feedback */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Question-by-Question Feedback
        </Typography>
        
        {assessmentData?.questionFeedback && assessmentData.questionFeedback.length > 0 ? (
          assessmentData.questionFeedback.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Question {index + 1}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {item.feedback}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            No detailed feedback available
          </Typography>
        )}
      </Paper>
    </Container>
  );
} 