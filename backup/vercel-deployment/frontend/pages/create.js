import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDropzone } from 'react-dropzone';

// API base URL from environment or default for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Step labels
const steps = ['Candidate Information', 'Job Selection', 'Confirmation'];

export default function CreateInterview() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [jobs, setJobs] = useState([]);
  
  // Form state
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
  });
  
  const [selectedJob, setSelectedJob] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [createdInterview, setCreatedInterview] = useState(null);
  
  // Load jobs on component mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/jobs`);
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load job positions. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, []);
  
  // Handle form field changes
  const handleCandidateChange = (e) => {
    const { name, value } = e.target;
    setCandidate({
      ...candidate,
      [name]: value
    });
  };
  
  const handleJobChange = (e) => {
    setSelectedJob(e.target.value);
  };
  
  // File dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setResumeFile(acceptedFiles[0]);
    }
  });
  
  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0 && !validateCandidateForm()) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (activeStep === 1 && !selectedJob) {
      setError('Please select a job position');
      return;
    }
    
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
    
    if (activeStep === steps.length - 2) {
      createInterview();
    }
  };
  
  const handleBack = () => {
    setError(null);
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleCancel = () => {
    router.push('/');
  };
  
  const validateCandidateForm = () => {
    return candidate.name && candidate.email;
  };
  
  // Create candidate and upload resume
  const uploadResume = async (candidateId) => {
    if (!resumeFile) return null;
    
    const formData = new FormData();
    formData.append('file', resumeFile);
    
    try {
      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadResponse.data && uploadResponse.data.url) {
        // Update candidate with resume URL
        await axios.put(`${API_URL}/candidates/${candidateId}/resume`, {
          resumeUrl: uploadResponse.data.url
        });
        
        return uploadResponse.data.url;
      }
      
      return null;
    } catch (err) {
      console.error('Error uploading resume:', err);
      return null;
    }
  };
  
  // Create interview
  const createInterview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create candidate
      const candidateResponse = await axios.post(`${API_URL}/candidates`, candidate);
      const candidateId = candidateResponse.data.id;
      
      // Upload resume if provided
      if (resumeFile) {
        await uploadResume(candidateId);
      }
      
      // Create interview
      const interviewResponse = await axios.post(`${API_URL}/interviews`, {
        candidateId,
        jobId: selectedJob
      });
      
      setCreatedInterview(interviewResponse.data);
      setSuccess('Interview created successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error creating interview:', err);
      setError('Failed to create interview. Please try again.');
      setLoading(false);
      setActiveStep(0);
    }
  };
  
  // Handle starting the interview
  const handleStartInterview = () => {
    if (createdInterview && createdInterview.interview) {
      router.push(`/interview/session?id=${createdInterview.interview.id}`);
    }
  };
  
  // Render different step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={candidate.name}
                  onChange={handleCandidateChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={candidate.email}
                  onChange={handleCandidateChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={candidate.phone}
                  onChange={handleCandidateChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Position"
                  name="position"
                  value={candidate.position}
                  onChange={handleCandidateChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Paper
                  {...getRootProps()}
                  sx={{
                    padding: 2,
                    border: '2px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                    cursor: 'pointer',
                    my: 2
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadFileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {resumeFile ? `Selected: ${resumeFile.name}` : 'Drag and drop a resume, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Supports PDF, DOC, DOCX (Optional)
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel id="job-select-label">Select Job Position</InputLabel>
              <Select
                labelId="job-select-label"
                id="job-select"
                value={selectedJob}
                label="Select Job Position"
                onChange={handleJobChange}
              >
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title} - {job.company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedJob && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Job Details
                </Typography>
                
                {jobs.find(job => job.id === selectedJob) && (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Title:</strong> {jobs.find(job => job.id === selectedJob).title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Company:</strong> {jobs.find(job => job.id === selectedJob).company}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Description:</strong> {jobs.find(job => job.id === selectedJob).description}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Requirements:</strong>
                    </Typography>
                    <ul>
                      {jobs.find(job => job.id === selectedJob).requirements.map((req, index) => (
                        <li key={index}>
                          <Typography variant="body2">{req}</Typography>
                        </li>
                      ))}
                    </ul>
                    
                    <Typography variant="body1" sx={{ mb: 1, mt: 2 }}>
                      <strong>Responsibilities:</strong>
                    </Typography>
                    <ul>
                      {jobs.find(job => job.id === selectedJob).responsibilities.map((resp, index) => (
                        <li key={index}>
                          <Typography variant="body2">{resp}</Typography>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Paper>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Creating interview...
                </Typography>
              </Box>
            ) : success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Your interview is ready!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleStartInterview}
                >
                  Start Interview
                </Button>
              </Box>
            ) : (
              <Typography variant="body1">
                Please review your information before creating the interview.
              </Typography>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Create New Interview
        </Typography>
      </Box>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {renderStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={activeStep === 0 ? handleCancel : handleBack}
          disabled={loading}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={loading}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
} 