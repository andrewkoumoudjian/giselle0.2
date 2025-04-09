import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';

// API base URL from environment or default for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviews, setInterviews] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/interviews`);
        setInterviews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setError('Failed to load interviews. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const handleNewInterview = () => {
    router.push('/create');
  };
  
  const handleViewResults = (interviewId) => {
    router.push(`/interview/results?id=${interviewId}`);
  };
  
  const handleContinueInterview = (interviewId) => {
    router.push(`/interview/session?id=${interviewId}`);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Giselle AI Interview System
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleNewInterview}
        >
          New Interview
        </Button>
      </Box>
      
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Recent Interviews
      </Typography>
      
      {interviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1">No interviews found.</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={handleNewInterview}
          >
            Create Your First Interview
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {interviews.map((interview) => (
            <Grid item xs={12} sm={6} md={4} key={interview.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                    Interview {interview.id.substring(0, 8)}...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Status: <Box component="span" sx={{ 
                      color: interview.status === 'completed' ? 'success.main' : 'warning.main',
                      fontWeight: 'bold'
                    }}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(interview.created_at).toLocaleDateString()}
                  </Typography>
                  {interview.completed_at && (
                    <Typography variant="body2" color="text.secondary">
                      Completed: {new Date(interview.completed_at).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  {interview.status === 'completed' ? (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewResults(interview.id)}
                    >
                      View Results
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleContinueInterview(interview.id)}
                    >
                      Continue Interview
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Box sx={{ mt: 6, mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          About Giselle AI Interview System
        </Typography>
        <Typography variant="body1" paragraph>
          Giselle is an AI-powered interview system that helps companies evaluate candidates
          more efficiently. Our platform automates the initial screening process, 
          providing objective assessments of candidates' skills and expertise.
        </Typography>
        <Typography variant="body1">
          Create an interview, select a job position, and get started today!
        </Typography>
      </Box>
    </Container>
  );
} 