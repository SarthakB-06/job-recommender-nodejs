import axios from 'axios';
import config from '../config.js';

// Configuration for RapidAPI JSearch
const RAPID_API_KEY = process.env.RAPID_API_KEY || config.rapidApi?.key;
const RAPID_API_HOST = 'jsearch.p.rapidapi.com';

/**
 * Search for jobs using RapidAPI JSearch
 * 
 * @param {Array} skills - Array of skills from user's resume
 * @param {String} location - Location (e.g. "Mumbai", "Bangalore")
 * @param {Number} page - Page number for pagination
 * @param {Number} resultsPerPage - Number of results per page
 * @returns {Object} - Job search results
 */
export const searchJobs = async (skills, location = '', page = 1, resultsPerPage = 10) => {
  try {
    // Check if API key is available
    if (!RAPID_API_KEY) {
      console.log("RapidAPI key missing, using mock data");
      return getMockJobData(skills, location);
    }

    // Format skills for search - create a query string
    const languages = ['javascript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'swift', 'typescript', 'golang'];
    const frameworks = ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', '.net'];
    const databases = ['mongodb', 'mysql', 'postgresql', 'sqlite', 'oracle', 'sql', 'nosql', 'firebase', 'redis'];
    const roles = ['frontend', 'backend', 'fullstack', 'developer', 'engineer', 'programmer', 'architect'];
    
    // Filter user skills into categories
    const userLanguages = skills.filter(skill => 
      languages.some(lang => skill.toLowerCase().includes(lang))
    );
    
    const userFrameworks = skills.filter(skill => 
      frameworks.some(framework => skill.toLowerCase().includes(framework.replace('.', '')))
    );
    
    // Build a smart search query based on their skills
    let searchTerms = [];
    
    // Add up to 2 programming languages if available
    if (userLanguages.length > 0) {
      searchTerms = searchTerms.concat(userLanguages.slice(0, 2));
    }
    
    // Add one framework if available
    if (userFrameworks.length > 0) {
      searchTerms.push(userFrameworks[0]);
    }
    
    // If we have neither languages nor frameworks, use general skills
    if (searchTerms.length === 0) {
      searchTerms = skills.slice(0, 2);
    }

    // Add location to query if provided
    if (location && location.trim() !== '') {
      searchQuery += ` ${location}`;
    }
    const uniqueTerms = [...new Set(searchTerms)];
    
    // Create search query - join skills with spaces (implied AND)
    let searchQuery = uniqueTerms.join(' ') + ' developer jobs';

    // Add "india" to ensure results are from India
    if (!searchQuery.toLowerCase().includes('india')) {
      searchQuery += 'in';
    }

    console.log(`Searching jobs with query: "${searchQuery}"`);

    // Make API request to RapidAPI
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: searchQuery,
        page: page.toString(),
        num_pages: '2',
        date_posted: 'all',
        country: 'in'


      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      }
    };

    const response = await axios.request(options);

    // Transform the response to match our expected format
    const transformedData = {
      count: response.data.data.length,
      results: response.data.data,
      results_per_page: resultsPerPage
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching jobs from RapidAPI:', error.response?.data || error.message);
    // Return mock data instead of throwing error
    return getMockJobData(skills, location);
  }
};

/**
 * Create mock job data that resembles JSearch API structure
 */
function getMockJobData(skills, location = '') {
  // Create mock jobs based on user's skills
  const allMockJobs = [
    {
      job_id: "mock1",
      job_title: "Frontend Developer",
      employer_name: "Tech Solutions",
      employer_logo: "https://example.com/logo1.png",
      job_publisher: "LinkedIn",
      job_employment_type: "FULLTIME",
      job_city: "Bangalore",
      job_state: "Karnataka",
      job_country: "India",
      job_description: `Looking for a developer with React, JavaScript, and HTML/CSS skills to join our team. You'll be building modern web applications and user interfaces.`,
      job_min_salary: 1200000,
      job_max_salary: 2000000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_apply_link: "https://example.com/job1",
      job_is_remote: false
    },
    {
      job_id: "mock2",
      job_title: "Full Stack Developer",
      employer_name: "WebTech India",
      employer_logo: "https://example.com/logo2.png",
      job_publisher: "Naukri",
      job_employment_type: "FULLTIME",
      job_city: "Mumbai",
      job_state: "Maharashtra",
      job_country: "India",
      job_description: `We're looking for a Full Stack Developer with Node.js, Express, MongoDB, and React experience. Must have good understanding of frontend and backend technologies.`,
      job_min_salary: 1500000,
      job_max_salary: 2500000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_apply_link: "https://example.com/job2",
      job_is_remote: false
    },
    {
      job_id: "mock3",
      job_title: "Python Developer",
      employer_name: "AI Solutions",
      employer_logo: "https://example.com/logo3.png",
      job_publisher: "Indeed",
      job_employment_type: "FULLTIME",
      job_city: "Delhi",
      job_state: "Delhi",
      job_country: "India",
      job_description: `Python developer needed for our AI team. Experience with Python, machine learning libraries, and good communication skills required.`,
      job_min_salary: 1600000,
      job_max_salary: 2600000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_apply_link: "https://example.com/job3",
      job_is_remote: false
    },
    {
      job_id: "mock4",
      job_title: "MERN Stack Developer",
      employer_name: "Digital Innovators",
      employer_logo: "https://example.com/logo4.png",
      job_publisher: "LinkedIn",
      job_employment_type: "FULLTIME",
      job_city: "Hyderabad",
      job_state: "Telangana",
      job_country: "India",
      job_description: `Experienced MERN stack developer needed. Must know MongoDB, Express, React and Node.js. Will be working on developing and maintaining modern web applications.`,
      job_min_salary: 1700000,
      job_max_salary: 2700000,
      job_posted_at_datetime_utc: new Date().toISOString(),
      job_apply_link: "https://example.com/job4",
      job_is_remote: false
    }
  ];

  // Filter by location if provided
  let filteredJobs = allMockJobs;
  if (location && location.trim() !== '') {
    filteredJobs = allMockJobs.filter(job =>
      job.job_city.toLowerCase().includes(location.toLowerCase()) ||
      job.job_state.toLowerCase().includes(location.toLowerCase())
    );
  }

  return {
    count: filteredJobs.length,
    results: filteredJobs,
    results_per_page: filteredJobs.length
  };
}

/**
 * Calculate skill match percentage between job and user skills
 */
export const calculateSkillMatch = (jobDescription, userSkills) => {
  if (!jobDescription || !userSkills || userSkills.length === 0) {
    return { percentage: 0, matchedSkills: [] };
  }

  // Convert to lowercase for case-insensitive matching
  const description = jobDescription.toLowerCase();
  let matchedSkills = [];

  userSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (description.includes(skillLower)) {
      matchedSkills.push(skill);
    }
  });

  const percentage = Math.min(Math.round((matchedSkills.length / userSkills.length) * 100), 100);
  return {
    percentage,
    matchedSkills
  };
};