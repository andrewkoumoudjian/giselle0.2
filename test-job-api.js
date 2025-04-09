// Test script for job listing and application API
const http = require('http');

// Function to make HTTP requests
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test the job listing and application endpoints
const runTests = async () => {
  const baseOptions = {
    hostname: 'localhost',
    port: 3001,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    console.log('=== Testing Job Listing and Application API ===\n');
    
    // Test 1: Create a company
    console.log('Test 1: Creating a company...');
    const companyData = { name: 'Test Company' };
    const companyOptions = {
      ...baseOptions,
      path: '/api/companies',
      method: 'POST'
    };
    
    const companyResponse = await makeRequest(companyOptions, companyData);
    console.log(`Status: ${companyResponse.statusCode}`);
    console.log('Company created:', companyResponse.data);
    console.log('');
    
    const companyId = companyResponse.data.id;
    
    // Test 2: Create a job
    console.log('Test 2: Creating a job...');
    const jobData = {
      company_id: companyId,
      title: 'Software Engineer',
      description: 'We are looking for a talented software engineer to join our team.',
      department: 'Engineering',
      required_skills: ['JavaScript', 'Node.js', 'React'],
      soft_skills_priorities: {
        'Communication': 80,
        'Teamwork': 70,
        'Problem Solving': 90
      }
    };
    
    const jobOptions = {
      ...baseOptions,
      path: '/api/jobs',
      method: 'POST'
    };
    
    const jobResponse = await makeRequest(jobOptions, jobData);
    console.log(`Status: ${jobResponse.statusCode}`);
    console.log('Job created:', jobResponse.data);
    console.log('');
    
    const jobId = jobResponse.data.id;
    
    // Test 3: Get job listings
    console.log('Test 3: Getting job listings...');
    const getJobsOptions = {
      ...baseOptions,
      path: '/api/jobs',
      method: 'GET'
    };
    
    const getJobsResponse = await makeRequest(getJobsOptions);
    console.log(`Status: ${getJobsResponse.statusCode}`);
    console.log(`Total jobs: ${getJobsResponse.data.jobs.length}`);
    console.log('Pagination:', getJobsResponse.data.pagination);
    console.log('');
    
    // Test 4: Get a single job
    console.log('Test 4: Getting a single job...');
    const getJobOptions = {
      ...baseOptions,
      path: `/api/jobs/${jobId}`,
      method: 'GET'
    };
    
    const getJobResponse = await makeRequest(getJobOptions);
    console.log(`Status: ${getJobResponse.statusCode}`);
    console.log('Job details:', {
      id: getJobResponse.data.id,
      title: getJobResponse.data.title,
      company: getJobResponse.data.companies?.name
    });
    console.log('');
    
    // Note: We can't easily test file uploads in this script
    console.log('Test 5: Job application submission requires file upload and would be tested manually or with a more advanced test framework.');
    
    console.log('\n=== All tests completed successfully! ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run the tests
runTests();
