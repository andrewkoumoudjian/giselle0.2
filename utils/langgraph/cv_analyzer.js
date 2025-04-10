import { defineGraph, StateGraph } from 'langgraph';
import { OpenAI } from 'openai';
import config from '../config';

// Initialize OpenAI client with OpenRouter
const openai = new OpenAI({
  apiKey: config.openRouterApiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://hr-talent-platform.vercel.app',
    'X-Title': 'HR Talent Platform',
  },
});

// Define the state schema
const initialState = {
  resumeText: '',
  jobDescription: null,
  extractedData: null,
  skills: [],
  experience: {},
  education: {},
  matchScore: 0,
  matchedSkills: [],
  missingSkills: [],
  additionalSkills: [],
  recommendations: [],
};

// Define the nodes for our graph
const extractResumeData = async (state) => {
  const { resumeText } = state;
  
  if (!resumeText) {
    return { ...state, error: 'No resume text provided' };
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: config.openRouterModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert HR assistant that specializes in resume analysis. 
          Extract key information from the resume including:
          - Contact information
          - Skills (technical and soft skills)
          - Work experience (company names, job titles, dates, responsibilities)
          - Education (degrees, institutions, dates)
          - Projects
          - Certifications
          
          Format the output as JSON.`
        },
        {
          role: 'user',
          content: `Extract key information from this resume:\n\n${resumeText}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    
    const extractedData = JSON.parse(response.choices[0].message.content);
    
    // Extract skills from the data
    const skills = extractedData.skills || [];
    
    // Extract experience
    const experience = {
      companies: extractedData.experience?.map(exp => exp.company) || [],
      titles: extractedData.experience?.map(exp => exp.title) || [],
      years: calculateTotalYears(extractedData.experience),
    };
    
    // Extract education
    const education = {
      degrees: extractedData.education?.map(edu => edu.degree) || [],
      institutions: extractedData.education?.map(edu => edu.institution) || [],
      highestDegree: findHighestDegree(extractedData.education),
    };
    
    return {
      ...state,
      extractedData,
      skills,
      experience,
      education,
    };
  } catch (error) {
    console.error('Error extracting resume data:', error);
    return { ...state, error: 'Failed to extract resume data' };
  }
};

// Match resume with job description
const matchWithJob = async (state) => {
  const { extractedData, jobDescription, skills } = state;
  
  if (!jobDescription) {
    return state; // No job to match with, return current state
  }
  
  try {
    // Extract required skills from job description
    const requiredSkills = jobDescription.skills || [];
    
    // Find matched and missing skills
    const matchedSkills = [];
    const missingSkills = [];
    
    for (const skill of requiredSkills) {
      const found = skills.some(s => 
        s.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(s.toLowerCase())
      );
      
      if (found) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }
    
    // Find additional skills (skills in resume but not in job requirements)
    const additionalSkills = skills.filter(skill => 
      !requiredSkills.some(req => 
        req.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );
    
    // Calculate match score
    const matchScore = calculateMatchScore(
      matchedSkills.length,
      requiredSkills.length,
      extractedData,
      jobDescription
    );
    
    // Generate recommendations
    const recommendations = await generateRecommendations(
      state,
      matchedSkills,
      missingSkills,
      additionalSkills,
      matchScore
    );
    
    return {
      ...state,
      matchScore,
      matchedSkills,
      missingSkills,
      additionalSkills,
      recommendations,
    };
  } catch (error) {
    console.error('Error matching with job:', error);
    return { ...state, error: 'Failed to match with job' };
  }
};

// Generate recommendations based on the analysis
const generateRecommendations = async (
  state,
  matchedSkills,
  missingSkills,
  additionalSkills,
  matchScore
) => {
  const { extractedData, jobDescription } = state;
  
  if (!jobDescription) {
    return [];
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: config.openRouterModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert HR assistant that specializes in providing career advice and recommendations.`
        },
        {
          role: 'user',
          content: `Based on the resume analysis and job match, provide 3-5 specific recommendations for the candidate.
          
          Job Title: ${jobDescription.title}
          Job Description: ${jobDescription.description}
          Required Skills: ${jobDescription.skills.join(', ')}
          
          Candidate Skills: ${state.skills.join(', ')}
          Matched Skills: ${matchedSkills.join(', ')}
          Missing Skills: ${missingSkills.join(', ')}
          Additional Skills: ${additionalSkills.join(', ')}
          
          Match Score: ${matchScore}%
          
          Provide actionable recommendations to improve the candidate's chances of getting this job.
          Format the output as a JSON array of strings.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// Helper function to calculate total years of experience
const calculateTotalYears = (experience) => {
  if (!experience || !Array.isArray(experience)) {
    return 0;
  }
  
  let totalMonths = 0;
  
  for (const exp of experience) {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate);
      const end = exp.endDate.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += months;
      }
    }
  }
  
  return Math.round(totalMonths / 12);
};

// Helper function to find highest degree
const findHighestDegree = (education) => {
  if (!education || !Array.isArray(education) || education.length === 0) {
    return null;
  }
  
  const degreeRanking = {
    'phd': 5,
    'doctorate': 5,
    'doctor': 5,
    'master': 4,
    'mba': 4,
    'bachelor': 3,
    'undergraduate': 3,
    'associate': 2,
    'diploma': 1,
    'certificate': 0,
  };
  
  let highestDegree = null;
  let highestRank = -1;
  
  for (const edu of education) {
    if (edu.degree) {
      const degreeLower = edu.degree.toLowerCase();
      
      // Find the highest ranking degree keyword in the degree string
      for (const [keyword, rank] of Object.entries(degreeRanking)) {
        if (degreeLower.includes(keyword) && rank > highestRank) {
          highestRank = rank;
          highestDegree = edu.degree;
        }
      }
    }
  }
  
  return highestDegree;
};

// Helper function to calculate match score
const calculateMatchScore = (
  matchedSkillsCount,
  requiredSkillsCount,
  extractedData,
  jobDescription
) => {
  if (requiredSkillsCount === 0) {
    return 0;
  }
  
  // Base score from skills match (70% of total score)
  const skillsScore = (matchedSkillsCount / requiredSkillsCount) * 70;
  
  // Experience score (20% of total score)
  let experienceScore = 0;
  if (extractedData.experience && jobDescription.experience_level) {
    const yearsOfExperience = calculateTotalYears(extractedData.experience);
    
    // Map experience level to years
    const experienceLevelMap = {
      'entry': 0,
      'junior': 1,
      'mid-level': 3,
      'senior': 5,
      'lead': 8,
      'executive': 10,
    };
    
    const requiredYears = experienceLevelMap[jobDescription.experience_level.toLowerCase()] || 0;
    
    if (yearsOfExperience >= requiredYears) {
      experienceScore = 20;
    } else if (requiredYears > 0) {
      experienceScore = (yearsOfExperience / requiredYears) * 20;
    }
  }
  
  // Education score (10% of total score)
  let educationScore = 0;
  if (extractedData.education && jobDescription.education) {
    const highestDegree = findHighestDegree(extractedData.education);
    
    if (highestDegree) {
      const highestDegreeLower = highestDegree.toLowerCase();
      const requiredEducationLower = jobDescription.education.toLowerCase();
      
      // Check if education requirement is met
      if (
        (requiredEducationLower.includes('bachelor') && (highestDegreeLower.includes('bachelor') || highestDegreeLower.includes('master') || highestDegreeLower.includes('phd'))) ||
        (requiredEducationLower.includes('master') && (highestDegreeLower.includes('master') || highestDegreeLower.includes('phd'))) ||
        (requiredEducationLower.includes('phd') && highestDegreeLower.includes('phd')) ||
        (requiredEducationLower.includes('high school') && highestDegreeLower.includes('high school'))
      ) {
        educationScore = 10;
      }
    }
  }
  
  // Calculate total score
  const totalScore = Math.min(100, Math.round(skillsScore + experienceScore + educationScore));
  
  return totalScore;
};

// Define the graph
const cvAnalysisGraph = defineGraph({
  nodes: {
    extractResumeData,
    matchWithJob,
  },
  edges: {
    extractResumeData: 'matchWithJob',
    matchWithJob: 'end',
  },
});

// Create the runnable graph
const cvAnalyzer = cvAnalysisGraph.compile();

// Function to analyze a resume
export async function analyzeResume(resumeText, jobDescription = null) {
  try {
    const state = await cvAnalyzer.invoke({
      ...initialState,
      resumeText,
      jobDescription,
    });
    
    return {
      skills: state.skills,
      experience: state.experience,
      education: state.education,
      match_score: state.matchScore,
      skills: {
        matched: state.matchedSkills,
        missing: state.missingSkills,
        additional: state.additionalSkills,
      },
      recommendations: state.recommendations,
      extracted_data: state.extractedData,
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
}

export default analyzeResume;
