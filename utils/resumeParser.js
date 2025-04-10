import axios from 'axios';

// Resume parsing service
class ResumeParser {
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_RESUME_PARSER_API_URL || 'http://localhost:3002/api/resume';
    this.apiKey = process.env.NEXT_PUBLIC_RESUME_PARSER_API_KEY;
  }
  
  // Parse resume and extract information
  async parseResume(file) {
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
      throw new Error(error.response?.data?.message || 'Failed to parse resume');
    }
  }
  
  // Match resume against job requirements
  async matchResumeWithJob(resumeData, jobId) {
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
      throw new Error(error.response?.data?.message || 'Failed to match resume with job');
    }
  }
  
  // Extract skills from resume
  async extractSkills(text) {
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
      throw new Error(error.response?.data?.message || 'Failed to extract skills');
    }
  }
  
  // Extract work experience from resume
  async extractExperience(text) {
    try {
      const response = await axios.post(`${this.apiUrl}/experience`, {
        text,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });
      
      return response.data.experience;
    } catch (error) {
      console.error('Experience extraction error:', error);
      throw new Error(error.response?.data?.message || 'Failed to extract experience');
    }
  }
  
  // Extract education from resume
  async extractEducation(text) {
    try {
      const response = await axios.post(`${this.apiUrl}/education`, {
        text,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });
      
      return response.data.education;
    } catch (error) {
      console.error('Education extraction error:', error);
      throw new Error(error.response?.data?.message || 'Failed to extract education');
    }
  }
  
  // Generate recommendations based on resume and job
  async generateRecommendations(resumeData, jobData) {
    try {
      const response = await axios.post(`${this.apiUrl}/recommendations`, {
        resumeData,
        jobData,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });
      
      return response.data.recommendations;
    } catch (error) {
      console.error('Recommendations generation error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate recommendations');
    }
  }
  
  // Fallback method for when the API is not available
  // This uses a simple keyword matching approach
  fallbackParseResume(text) {
    // Extract basic information using regex patterns
    const skills = this.extractSkillsRegex(text);
    const experience = this.extractExperienceRegex(text);
    const education = this.extractEducationRegex(text);
    
    return {
      skills,
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
