// Configuration file for environment variables
const config = {
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  resumeParserApiUrl: process.env.NEXT_PUBLIC_RESUME_PARSER_API_URL || 'http://localhost:3002/api/resume',

  // API Keys
  resumeParserApiKey: process.env.NEXT_PUBLIC_RESUME_PARSER_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free',

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mzvplggdtercfovvbbmv.supabase.co',
    key: process.env.NEXT_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnBsZ2dkdGVyY2ZvdnZiYm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMTI0MDQsImV4cCI6MjA1ODc4ODQwNH0.MjfP5ilbRrb3awEr45EnKZR6v18CjijgTiL6sfxepCQ',
  },

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
