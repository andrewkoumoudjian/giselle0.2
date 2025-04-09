import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// API base URL from environment or default for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Recording states
const RecordingState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PLAYING: 'playing',
  SUBMITTED: 'submitted'
};

export default function InterviewSession() {
  const router = useRouter();
  const { id: interviewId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordingState, setRecordingState] = useState(RecordingState.IDLE);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioElementRef = useRef(null);
  
  // Fetch interview and questions
  useEffect(() => {
    async function fetchData() {
      if (!interviewId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch interview
        const interviewResponse = await axios.get(`${API_URL}/interviews/${interviewId}`);
        setInterview(interviewResponse.data);
        
        // Fetch questions
        const questionsResponse = await axios.get(`${API_URL}/interviews/${interviewId}/questions`);
        setQuestions(questionsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching interview data:', err);
        setError('Failed to load interview. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [interviewId]);
  
  // Handle recording start
  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      
      // Setup event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        setRecordingState(RecordingState.IDLE);
        
        // Clean up audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      setRecordingState(RecordingState.RECORDING);
    } catch (err) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access to continue.');
      } else {
        setError('Failed to start recording. Please check your microphone and try again.');
      }
    }
  };
  
  // Handle recording stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === RecordingState.RECORDING) {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Handle audio playback
  const playRecording = () => {
    if (audioUrl && audioElementRef.current) {
      audioElementRef.current.play();
      setRecordingState(RecordingState.PLAYING);
    }
  };
  
  // Handle audio playback ended
  const handlePlaybackEnded = () => {
    setRecordingState(RecordingState.IDLE);
  };
  
  // Submit answer
  const submitAnswer = async () => {
    if (!audioBlob || !interviewId || !questions[currentQuestionIndex]) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      
      // Upload audio file
      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (!uploadResponse.data || !uploadResponse.data.url) {
        throw new Error('Failed to upload audio');
      }
      
      // Submit response
      await axios.post(`${API_URL}/interviews/${interviewId}/responses`, {
        questionId: questions[currentQuestionIndex].id,
        audioUrl: uploadResponse.data.url,
        transcript: '' // In a real app, you might add transcription
      });
      
      // Clean up
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingState(RecordingState.SUBMITTED);
      setSubmitting(false);
      
      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setRecordingState(RecordingState.IDLE);
        }, 1000);
      } else {
        completeInterview();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Complete interview
  const completeInterview = async () => {
    setSubmitting(true);
    
    try {
      await axios.put(`${API_URL}/interviews/${interviewId}/complete`);
      setInterviewComplete(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error completing interview:', err);
      setError('Failed to complete interview. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Return to home
  const handleBack = () => {
    router.push('/');
  };
  
  // Go to results
  const handleViewResults = () => {
    router.push(`/interview/results?id=${interviewId}`);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading interview...</Typography>
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
  
  // Render interview complete state
  if (interviewComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Interview Complete!
          </Typography>
          <Typography variant="body1" paragraph>
            Thank you for completing the interview. Your responses have been submitted and will be analyzed.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleViewResults}
              sx={{ mr: 2 }}
            >
              View Results
            </Button>
            <Button
              variant="outlined"
              onClick={handleBack}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // Render interview session
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Interview Session
        </Typography>
      </Box>
      
      {/* Progress indicator */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={currentQuestionIndex} alternativeLabel>
          {questions.map((question, index) => (
            <Step key={index}>
              <StepLabel>Question {index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      {/* Current question */}
      {questions.length > 0 && currentQuestionIndex < questions.length && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body1" paragraph>
              {questions[currentQuestionIndex].question}
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {/* Recording controls */}
      <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        {recordingState === RecordingState.RECORDING && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Recording in progress...
            </Typography>
            <LinearProgress color="error" />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {recordingState === RecordingState.IDLE && !audioUrl && (
            <IconButton
              color="primary"
              size="large"
              onClick={startRecording}
              sx={{ border: 1, borderColor: 'primary.main', p: 2 }}
            >
              <MicIcon fontSize="large" />
            </IconButton>
          )}
          
          {recordingState === RecordingState.RECORDING && (
            <IconButton
              color="error"
              size="large"
              onClick={stopRecording}
              sx={{ border: 1, borderColor: 'error.main', p: 2 }}
            >
              <StopIcon fontSize="large" />
            </IconButton>
          )}
          
          {audioUrl && recordingState !== RecordingState.PLAYING && (
            <IconButton
              color="primary"
              size="large"
              onClick={playRecording}
              sx={{ border: 1, borderColor: 'primary.main', p: 2 }}
            >
              <PlayArrowIcon fontSize="large" />
            </IconButton>
          )}
        </Box>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          {recordingState === RecordingState.IDLE && !audioUrl && "Click the microphone to start recording"}
          {recordingState === RecordingState.RECORDING && "Click the stop button when you're finished"}
          {recordingState === RecordingState.IDLE && audioUrl && "Review your recording or submit your answer"}
          {recordingState === RecordingState.PLAYING && "Playing recording..."}
          {recordingState === RecordingState.SUBMITTED && "Answer submitted!"}
        </Typography>
        
        {/* Hidden audio element for playback */}
        <audio 
          ref={audioElementRef} 
          src={audioUrl} 
          onEnded={handlePlaybackEnded} 
          style={{ display: 'none' }} 
        />
        
        {audioUrl && recordingState !== RecordingState.SUBMITTED && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={submitAnswer}
              disabled={submitting}
              sx={{ mr: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit Answer'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setAudioBlob(null);
                setAudioUrl(null);
              }}
              disabled={submitting}
            >
              Re-record
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
} 