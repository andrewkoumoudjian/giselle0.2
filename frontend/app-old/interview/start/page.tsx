'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Container,
  Typography,
  TextField,
  Button,
  Step,
  StepLabel,
  Stepper,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDropzone } from 'react-dropzone';
import { useAuth, useInterview } from '../../../lib/contexts/AppContext';
import api, { checkApiAvailability } from '../../../lib/api';

const steps = ['Personal Information', 'Resume Upload', 'Job Details'];

export default function InterviewStart() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentInterview } = useInterview();
  
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    resume: null as File | null,
    jobTitle: '',
    jobDescription: '',
    company: '',
    yearsOfExperience: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState('');
  
  // Check API availability when component mounts
  useEffect(() => {
    const checkApi = async () => {
      const isAvailable = await checkApiAvailability();
      setApiAvailable(isAvailable);
    };
    
    checkApi();
  }, []);
  
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFormData({ ...formData, resume: acceptedFiles[0] });
      setFileError('');
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });
  
  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as keyof typeof formData;
    const value = event.target.value;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error once field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSelectChange = (event: SelectChangeEvent) => {
    const name = event.target.name as keyof typeof formData;
    const value = event.target.value;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateStep = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};
    
    if (activeStep === 0) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        valid = false;
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        valid = false;
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        valid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
        valid = false;
      }
    } else if (activeStep === 1) {
      if (!formData.resume) {
        setFileError('Please upload your resume');
        valid = false;
      }
    } else if (activeStep === 2) {
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'Job title is required';
        valid = false;
      }
      if (!formData.jobDescription.trim()) {
        newErrors.jobDescription = 'Job description is required';
        valid = false;
      }
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleSubmit = async () => {
    if (validateStep()) {
      // Check API availability again before submission
      const isAvailable = await checkApiAvailability();
      
      if (!isAvailable) {
        setSubmitError('The API server is not available. Please make sure the backend server is running.');
        return;
      }
      
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        // Step 1: Create or get candidate
        let candidateId = user?.id;
        
        if (!candidateId) {
          // If not logged in, create a new candidate
          const candidateResponse = await api.candidates.create({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone || undefined
          });
          candidateId = candidateResponse.data.id;
        }
        
        // Step 2: Upload resume if provided
        if (formData.resume) {
          await api.candidates.uploadResume(candidateId as string, formData.resume);
        }
        
        // Step 3: Create job description if it doesn't exist
        const jobResponse = await api.jobs.create({
          company_id: "default", // Use the default company
          title: formData.jobTitle,
          description: formData.jobDescription,
          department: formData.company || undefined,
          required_skills: formData.yearsOfExperience ? [formData.yearsOfExperience] : undefined
        });
        
        // Step 4: Create a new interview
        const interviewResponse = await api.interviews.create({
          candidate_id: candidateId,
          job_id: jobResponse.data.id
        });
        
        // Handle different response formats gracefully
        const interviewId = interviewResponse.data.interview?.id || 
                           interviewResponse.data.id || 
                           (typeof interviewResponse.data === 'string' ? interviewResponse.data : null);
        
        if (!interviewId) {
          throw new Error('Invalid response from server: Could not determine interview ID');
        }
        
        // Set the current interview context
        setCurrentInterview({
          id: interviewId,
          status: 'pending',
          candidateId: candidateId as string,
          jobId: jobResponse.data.id,
          createdAt: new Date().toISOString()
        });
        
        // Navigate to the interview session page
        router.push(`/interview/session?id=${interviewId}`);
      } catch (error: any) {
        console.error('Error submitting form:', error);
        
        // Handle structured error responses
        let errorMessage = 'An error occurred while setting up your interview.';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details?.detail) {
          errorMessage = error.details.detail;
        }
        
        setSubmitError(`${errorMessage} Please check if the backend server is running at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                variant="outlined"
                value={formData.firstName}
                onChange={handleTextInputChange}
                error={!!errors.firstName}
                helperText={errors.firstName || ''}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                variant="outlined"
                value={formData.lastName}
                onChange={handleTextInputChange}
                error={!!errors.lastName}
                helperText={errors.lastName || ''}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleTextInputChange}
                error={!!errors.email}
                helperText={errors.email || ''}
                required
                disabled={isSubmitting || !!user}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                variant="outlined"
                value={formData.phone}
                onChange={handleTextInputChange}
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Box 
              {...getRootProps()} 
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : fileError ? 'error.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                mb: 3,
                backgroundColor: isDragActive ? 'primary.50' : 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                },
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <input {...getInputProps()} disabled={isSubmitting} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: PDF, DOC, DOCX
              </Typography>
            </Box>
            
            {fileError && (
              <Alert severity="error" sx={{ mb: 3 }}>{fileError}</Alert>
            )}
            
            {formData.resume && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {`File uploaded: ${formData.resume.name}`}
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary">
              Your resume will be analyzed to create personalized, unbiased interview questions relevant to your skills and experience.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                name="jobTitle"
                variant="outlined"
                value={formData.jobTitle}
                onChange={handleTextInputChange}
                error={!!errors.jobTitle}
                helperText={errors.jobTitle || ''}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company (Optional)"
                name="company"
                variant="outlined"
                value={formData.company}
                onChange={handleTextInputChange}
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel id="experience-label">Years of Experience</InputLabel>
                <Select
                  labelId="experience-label"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  label="Years of Experience"
                  onChange={handleSelectChange}
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  <MenuItem value="0-1">Less than 1 year</MenuItem>
                  <MenuItem value="1-3">1-3 years</MenuItem>
                  <MenuItem value="3-5">3-5 years</MenuItem>
                  <MenuItem value="5-10">5-10 years</MenuItem>
                  <MenuItem value="10+">More than 10 years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                name="jobDescription"
                variant="outlined"
                value={formData.jobDescription}
                onChange={handleTextInputChange}
                multiline
                rows={6}
                error={!!errors.jobDescription}
                helperText={errors.jobDescription || ''}
                required
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Complete the information below to begin your AI-powered interview experience
        </Typography>
        
        {apiAvailable === false && (
          <Alert severity="error" sx={{ mb: 3 }}>
            The backend API is not available. Please make sure the backend server is running at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
        
        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || isSubmitting}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || apiAvailable === false}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Setting Up Interview...
                </>
              ) : (
                'Start Interview'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
} 