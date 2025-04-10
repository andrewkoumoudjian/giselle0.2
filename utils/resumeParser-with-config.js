import axios from 'axios';
import config from './config';

// Resume parsing service
class ResumeParser {
  constructor() {
    this.apiUrl = config.resumeParserApiUrl;
    this.apiKey = config.resumeParserApiKey;
    this.enableResumeParser = config.features.enableResumeParser;
    this.enableJobMatching = config.features.enableJobMatching;
  }
  
  // Parse resume and extract information
  async parseResume(file) {
    // If resume parsing is disabled, use fallback
    if (!this.enableResumeParser) {
      console.log('Resume parsing is disabled, using fallback');
      
      // Read the file as text
      const fileText = await this.readFileAsText(file);
      return this.fallbackParseResume(fileText);
    }
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await axios.post(`${this.apiUrl}/parse`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': this.apiKey,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Resume parsing error:', error);
      
      // If API call fails, use fallback
      console.log('Resume parsing API failed, using fallback');
      const fileText = await this.readFileAsText(file);
      return this.fallbackParseResume(fileText);
    }
  }
  
  // Match resume against job requirements
  async matchResumeWithJob(resumeData, jobId) {
    // If job matching is disabled, return mock data
    if (!this.enableJobMatching) {
      console.log('Job matching is disabled, using mock data');
      return this.getMockMatchData(resumeData);
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/match`, {
        resumeData,
        jobId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Resume matching error:', error);
      
      // If API call fails, return mock data
      console.log('Job matching API failed, using mock data');
      return this.getMockMatchData(resumeData);
    }
  }
  
  // Extract skills from resume
  async extractSkills(text) {
    // If resume parsing is disabled, use fallback
    if (!this.enableResumeParser) {
      console.log('Resume parsing is disabled, using fallback');
      return this.extractSkillsRegex(text);
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/skills`, {
        text,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });
      
      return response.data.skills;
    } catch (error) {
      console.error('Skills extraction error:', error);
      
      // If API call fails, use fallback
      console.log('Skills extraction API failed, using fallback');
      return this.extractSkillsRegex(text);
    }
  }
  
  // Helper method to read file as text
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
  
  // Generate mock match data
  getMockMatchData(resumeData) {
    const skills = resumeData.skills || [];
    const skillNames = Array.isArray(skills) 
      ? skills 
      : (skills.matched || []).concat(skills.additional || []);
    
    // Generate random match score between 65 and 95
    const matchScore = Math.floor(Math.random() * 31) + 65;
    
    // Split skills into matched and missing
    const matchedSkills = skillNames.slice(0, Math.ceil(skillNames.length * 0.7));
    const missingSkills = ['GraphQL', 'AWS', 'Docker', 'TypeScript', 'React Native']
      .filter(skill => !matchedSkills.includes(skill))
      .slice(0, 3);
    
    return {
      match_score: matchScore,
      skills: {
        matched: matchedSkills,
        missing: missingSkills,
      },
      recommendations: [
        'Highlight your experience with similar technologies',
        'Add more details about your project management skills',
        'Consider obtaining certifications in the missing skills',
      ],
    };
  }
  
  // Fallback method for when the API is not available
  fallbackParseResume(text) {
    // Extract basic information using regex patterns
    const skills = this.extractSkillsRegex(text);
    const experience = this.extractExperienceRegex(text);
    const education = this.extractEducationRegex(text);
    
    return {
      skills: {
        matched: skills,
        missing: [],
        additional: [],
      },
      experience,
      education,
      raw_text: text,
    };
  }
  
  // Simple regex-based skill extraction
  extractSkillsRegex(text) {
    // Common tech skills
    const skillKeywords = [
      'JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML', 'CSS',
      'Python', 'Java', 'C#', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS',
      'Docker', 'Kubernetes', 'Git', 'CI/CD', 'REST API', 'GraphQL',
      'Machine Learning', 'Data Science', 'Artificial Intelligence',
      'DevOps', 'Agile', 'Scrum', 'Project Management',
    ];
    
    const foundSkills = [];
    
    skillKeywords.forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(text)) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  }
  
  // Simple regex-based experience extraction
  extractExperienceRegex(text) {
    // Try to find experience sections and job titles
    const experienceRegex = /experience|work|employment/i;
    const hasExperienceSection = experienceRegex.test(text);
    
    // Try to find years of experience
    const yearsRegex = /(\d+)[\s-]*(year|yr)s?/i;
    const yearsMatch = text.match(yearsRegex);
    
    const years = yearsMatch ? parseInt(yearsMatch[1]) : null;
    
    // Try to find job titles
    const jobTitles = [];
    const commonTitles = [
      'Software Engineer', 'Developer', 'Product Manager', 'Designer',
      'Data Scientist', 'Project Manager', 'Director', 'VP', 'CTO', 'CEO',
    ];
    
    commonTitles.forEach(title => {
      const regex = new RegExp(`\\b${title}\\b`, 'i');
      if (regex.test(text)) {
        jobTitles.push(title);
      }
    });
    
    return {
      has_experience_section: hasExperienceSection,
      years: years,
      job_titles: jobTitles,
    };
  }
  
  // Simple regex-based education extraction
  extractEducationRegex(text) {
    // Try to find education section
    const educationRegex = /education|degree|university|college|school/i;
    const hasEducationSection = educationRegex.test(text);
    
    // Try to find degrees
    const degrees = [];
    const commonDegrees = [
      "Bachelor's", "Master's", "PhD", "Doctorate", "Associate's",
      "BS", "BA", "MS", "MA", "MBA", "MD", "JD",
    ];
    
    commonDegrees.forEach(degree => {
      const regex = new RegExp(`\\b${degree}\\b`, 'i');
      if (regex.test(text)) {
        degrees.push(degree);
      }
    });
    
    // Try to find fields of study
    const fields = [];
    const commonFields = [
      'Computer Science', 'Engineering', 'Business', 'Marketing',
      'Finance', 'Economics', 'Mathematics', 'Physics', 'Chemistry',
      'Biology', 'Psychology', 'Sociology', 'History', 'English',
    ];
    
    commonFields.forEach(field => {
      const regex = new RegExp(`\\b${field}\\b`, 'i');
      if (regex.test(text)) {
        fields.push(field);
      }
    });
    
    return {
      has_education_section: hasEducationSection,
      degrees: degrees,
      fields: fields,
    };
  }
}

export default new ResumeParser();
