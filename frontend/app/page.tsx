'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import WorkIcon from '@mui/icons-material/Work';
import Link from 'next/link';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            backgroundImage: 'url(/images/pattern.svg)',
            backgroundSize: 'cover',
            zIndex: 0
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Unbiased AI-Powered Interviews
              </Typography>
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  fontSize: { xs: '1.25rem', md: '1.5rem' }, 
                  fontWeight: 400,
                  mb: 4,
                  maxWidth: '90%'
                }}
              >
                Eliminate bias in hiring with Giselle, the AI interview system designed for fair candidate assessments
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  color="secondary"
                  component={Link}
                  href="/interview/start"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                >
                  Start Interview
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  color="inherit"
                  component={Link}
                  href="/about"
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img"
                src="/images/hero-illustration.svg"
                alt="AI Interview Illustration"
                sx={{ 
                  width: '100%',
                  maxWidth: '500px',
                  display: 'block',
                  ml: 'auto'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            align="center"
            sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 6
            }}
          >
            How Giselle Works
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  }
                }}
              >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h3" align="center" fontWeight={600}>
                    Upload Your Resume
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center">
                    Submit your resume and job description to get customized, unbiased interview questions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  }
                }}
              >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <RecordVoiceOverIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h3" align="center" fontWeight={600}>
                    Complete the Interview
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center">
                    Answer questions through our voice-enabled interface with real-time feedback
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  borderRadius: '12px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  }
                }}
              >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <WorkIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h3" align="center" fontWeight={600}>
                    Get Detailed Results
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center">
                    Receive a comprehensive assessment of your skills and job compatibility
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h2"
                sx={{ 
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  mb: 3
                }}
              >
                Removing Bias from the Hiring Process
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Traditional interviews are often susceptible to unconscious bias. 
                Giselle uses advanced AI algorithms to ensure all candidates are 
                evaluated fairly based on their skills and qualifications.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                component={Link}
                href="/about/methodology"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  py: 1.5, 
                  px: 3,
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
              >
                Our Methodology
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      borderRadius: '12px'
                    }}
                  >
                    <Typography variant="h3" component="p" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                      87%
                    </Typography>
                    <Typography variant="body1">
                      Reduction in hiring bias
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      backgroundColor: 'secondary.light',
                      color: 'secondary.contrastText',
                      borderRadius: '12px'
                    }}
                  >
                    <Typography variant="h3" component="p" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                      94%
                    </Typography>
                    <Typography variant="body1">
                      Candidate satisfaction rate
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      backgroundColor: 'success.light',
                      color: 'success.contrastText',
                      borderRadius: '12px'
                    }}
                  >
                    <Typography variant="h3" component="p" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                      65%
                    </Typography>
                    <Typography variant="body1">
                      Time saved in screening
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      backgroundColor: 'info.light',
                      color: 'info.contrastText',
                      borderRadius: '12px'
                    }}
                  >
                    <Typography variant="h3" component="p" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                      3.5x
                    </Typography>
                    <Typography variant="body1">
                      More diverse candidates
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          backgroundColor: 'secondary.main',
          color: 'white'
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h2"
            sx={{ 
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 700,
              mb: 3
            }}
          >
            Ready to Experience Unbiased Interviews?
          </Typography>
          <Typography variant="h6" component="p" sx={{ mb: 4, fontWeight: 400 }}>
            Join thousands of candidates who have already discovered the fairest way to interview
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            component={Link}
            href="/signup"
            sx={{ 
              py: 2, 
              px: 4,
              fontWeight: 600,
              borderRadius: '8px',
              fontSize: '1.1rem'
            }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>
    </Box>
  );
} 