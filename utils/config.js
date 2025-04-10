// Configuration file for environment variables
const config = {
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  resumeParserApiUrl: process.env.NEXT_PUBLIC_RESUME_PARSER_API_URL || 'http://localhost:3002/api/resume',
  
  // API Keys
  resumeParserApiKey: process.env.NEXT_PUBLIC_RESUME_PARSER_API_KEY || '',
  
  // Environment
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' || !process.env.NEXT_PUBLIC_ENVIRONMENT,
  isTest: process.env.NEXT_PUBLIC_ENVIRONMENT === 'test',
  
  // Feature flags
  features: {
    enableResumeParser: true,
    enableJobMatching: true,
    enableAnalytics: process.env.NEXT_PUBLIC_ENVIRONMENT !== 'test',
  },
  
  // Authentication
  auth: {
    tokenStorageKey: 'token',
    userStorageKey: 'user',
    tokenExpiryDays: 7,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 50,
  },
};

export default config;
