'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useInterview } from '../../../lib/contexts/AppContext';
import api from '../../../lib/api';

type Question = {
  id: string;
  text: string;
  type: 'technical' | 'behavioral';
  order_index: number;
};

type RecordingState = 'idle' | 'recording' | 'stopped' | 'playing' | 'processing';

export default function InterviewSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentInterview, setCurrentInterview } = useInterview();
  
  const interviewId = searchParams.get('id') || currentInterview?.id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const processingTimer = useRef<NodeJS.Timeout | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Fetch interview questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!interviewId) {
        setError('No interview ID provided. Please start a new interview.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const response = await api.interviews.getQuestions(interviewId);
        
        // Sort questions by order_index
        const sortedQuestions = [...response.data].sort((a, b) => a.order_index - b.order_index);
        setQuestions(sortedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load interview questions. Please try again.');
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [interviewId]);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (processingTimer.current) {
        clearInterval(processingTimer.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecordingState('recording');
      setRecordingTime(0);
      
      // Start a timer to track recording duration
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');
      
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioPlayer.current && audioUrl) {
      setRecordingState('playing');
      audioPlayer.current.play();
    }
  };

  const handleAudioEnded = () => {
    setRecordingState('stopped');
  };

  const submitAnswer = async () => {
    if (!audioBlob || !questions[currentQuestionIndex]) {
      setError('No recording available. Please record your answer first.');
      return;
    }
    
    setRecordingState('processing');
    setProcessingProgress(0);
    setError(null);
    
    // Increment the progress bar to show activity
    processingTimer.current = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          // Max out at 90% until we get the actual result
          return 90;
        }
        return prev + 5;
      });
    }, 500);
    
    try {
      // Submit the audio recording
      await api.interviews.submitAnswer(
        interviewId!,
        questions[currentQuestionIndex].id,
        audioBlob
      );
      
      // Set progress to 100%
      setProcessingProgress(100);
      
      // Clear the interval
      if (processingTimer.current) {
        clearInterval(processingTimer.current);
        processingTimer.current = null;
      }
      
      // Check if this was the last question
      if (currentQuestionIndex < questions.length - 1) {
        // Move to the next question
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setRecordingState('idle');
          setAudioBlob(null);
          setAudioUrl(null);
          setProcessingProgress(0);
        }, 1000);
      } else {
        // Interview complete, redirect to results
        setTimeout(() => {
          router.push(`/interview/results?id=${interviewId}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit your answer. Please try again.');
      setRecordingState('stopped');
      
      if (processingTimer.current) {
        clearInterval(processingTimer.current);
        processingTimer.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderRecordingControls = () => {
    switch (recordingState) {
      case 'idle':
        return (
          <Box textAlign="center">
            <Tooltip title="Start recording your answer">
              <IconButton 
                onClick={startRecording} 
                color="primary" 
                aria-label="start recording"
                sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  }
                }}
              >
                <MicIcon sx={{ fontSize: 40, color: 'white' }} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Click to start recording
            </Typography>
          </Box>
        );
      
      case 'recording':
        return (
          <Box textAlign="center">
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" component="div" color="error">
                {formatTime(recordingTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recording...
              </Typography>
            </Box>
            <Tooltip title="Stop recording">
              <IconButton 
                onClick={stopRecording} 
                color="error" 
                aria-label="stop recording"
                sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: 'error.light',
                  '&:hover': {
                    backgroundColor: 'error.main',
                  }
                }}
              >
                <StopIcon sx={{ fontSize: 40, color: 'white' }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      
      case 'stopped':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <audio 
                ref={audioPlayer} 
                src={audioUrl || undefined} 
                onEnded={handleAudioEnded}
                style={{ display: 'none' }}
              />
              
              <Tooltip title="Play recording">
                <IconButton 
                  onClick={playRecording} 
                  color="primary" 
                  aria-label="play recording"
                  sx={{ mr: 2 }}
                >
                  <PlayArrowIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Record again">
                <IconButton 
                  onClick={startRecording} 
                  color="primary" 
                  aria-label="record again"
                  sx={{ ml: 2 }}
                >
                  <MicIcon sx={{ fontSize: 30 }} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={submitAnswer}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Submit Answer
            </Button>
          </Box>
        );
        
      case 'playing':
        return (
          <Box textAlign="center">
            <Typography variant="body1" sx={{ mb: 2 }}>
              Playing your recording...
            </Typography>
            <audio 
              ref={audioPlayer} 
              src={audioUrl || undefined} 
              onEnded={handleAudioEnded}
              style={{ display: 'none' }}
            />
            <Tooltip title="Stop playback">
              <IconButton 
                onClick={() => {
                  if (audioPlayer.current) {
                    audioPlayer.current.pause();
                    setRecordingState('stopped');
                  }
                }} 
                color="primary" 
                aria-label="stop playback"
              >
                <StopIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
        
      case 'processing':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress variant="determinate" value={processingProgress} size={60} sx={{ mb: 2 }} />
            <Typography variant="body1">
              Analyzing your response...
            </Typography>
          </Box>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6">
          Loading your interview...
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
          onClick={() => router.push('/interview/start')}
        >
          Start a New Interview
        </Button>
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          No questions available. The system may still be generating questions for your interview.
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Interview in Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentQuestionIndex / questions.length) * 100} 
              sx={{ width: 100, height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>
        <Divider sx={{ mb: 4 }} />
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0} 
            sx={{ 
              mb: 4, 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'primary.light',
              backgroundColor: 'primary.50'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Avatar 
                  alt="Giselle AI" 
                  src="/images/giselle-avatar.svg" 
                  sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
                >
                  G
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Giselle AI Interviewer
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Question {currentQuestionIndex + 1}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" component="p" sx={{ my: 2 }}>
                {questions[currentQuestionIndex]?.text}
              </Typography>
            </CardContent>
          </Card>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'grey.200',
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {renderRecordingControls()}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'grey.200',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Tips for Success
              </Typography>
              <InfoOutlinedIcon color="primary" fontSize="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Typography variant="body2">
                <strong>Be concise</strong> - Focus on clear, direct answers
              </Typography>
              <Typography variant="body2">
                <strong>Use examples</strong> - Share specific instances from your experience
              </Typography>
              <Typography variant="body2">
                <strong>Structure answers</strong> - Present your thoughts in a logical order
              </Typography>
              <Typography variant="body2">
                <strong>Speak clearly</strong> - Maintain a steady pace and enunciate words
              </Typography>
              <Typography variant="body2">
                <strong>Stay relevant</strong> - Address the question directly
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// MUI Grid component for layout
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
          flexBasis: md === 8 ? '66.666667%' : md === 4 ? '33.333333%' : `${(md / 12) * 100}%`,
          maxWidth: md === 8 ? '66.666667%' : md === 4 ? '33.333333%' : `${(md / 12) * 100}%`,
        },
        ...sx
      }}
    >
      {children}
    </Box>
  );
}