const axios = require('axios');
require('dotenv').config();

// OpenRouter configuration
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const defaultModel = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';

// Create an axios instance for OpenRouter
const openRouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openRouterApiKey}`,
    'HTTP-Referer': 'https://hr-talent-platform.vercel.app', // Replace with your actual domain
    'X-Title': 'HR Talent Platform',
  },
});

/**
 * Generate text using OpenRouter API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - The API response
 */
async function generateText(messages, options = {}) {
  try {
    const model = options.model || defaultModel;
    
    const response = await openRouter.post('/chat/completions', {
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: options.top_p || 1,
      stream: options.stream || false,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error.response?.data || error.message);
    throw new Error('Failed to generate text with OpenRouter');
  }
}

/**
 * Analyze a resume using OpenRouter API
 * @param {string} resumeText - The text content of the resume
 * @param {Object} jobDetails - Details of the job to match against
 * @returns {Promise<Object>} - The analysis results
 */
async function analyzeResume(resumeText, jobDetails = null) {
  try {
    const model = process.env.RESUME_ANALYSIS_MODEL || defaultModel;
    
    let prompt = `Analyze the following resume and extract key information including skills, experience, education, and other relevant details. Format the response as JSON.

Resume:
${resumeText}`;

    if (jobDetails) {
      prompt += `\n\nCompare this resume to the following job description and provide a match score and recommendations:

Job Title: ${jobDetails.title}
Job Description: ${jobDetails.description}
Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}`;
    }
    
    const messages = [
      { role: 'system', content: 'You are an expert HR assistant that specializes in resume analysis and job matching.' },
      { role: 'user', content: prompt }
    ];
    
    const response = await generateText(messages, {
      model,
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 2000, // Allow for detailed analysis
    });
    
    // Parse the response content as JSON
    const content = response.choices[0].message.content;
    let analysisResult;
    
    try {
      // Try to parse the entire response as JSON
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      // If that fails, try to extract JSON from the text
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (nestedParseError) {
          console.error('Error parsing JSON from response:', nestedParseError);
          throw new Error('Failed to parse resume analysis results');
        }
      } else {
        // If no JSON found, create a structured result from the text
        analysisResult = {
          raw_text: content,
          skills: extractSkillsFromText(content),
          match_score: jobDetails ? extractMatchScoreFromText(content) : null,
        };
      }
    }
    
    return analysisResult;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
}

// Helper function to extract skills from text
function extractSkillsFromText(text) {
  const skillsMatch = text.match(/skills:?\s*([\w\s,\-\+\/]+)/i) || 
                      text.match(/skills[\s\S]*?:[\s\S]*?([\w\s,\-\+\/]+)/i);
  
  if (skillsMatch) {
    return skillsMatch[1]
      .split(/,|\n/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }
  
  return [];
}

// Helper function to extract match score from text
function extractMatchScoreFromText(text) {
  const scoreMatch = text.match(/match\s*score:?\s*(\d+)/i) || 
                     text.match(/(\d+)%\s*match/i);
  
  if (scoreMatch) {
    return parseInt(scoreMatch[1]);
  }
  
  return 70; // Default score
}

module.exports = {
  generateText,
  analyzeResume,
};
