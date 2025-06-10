import {User} from "../models/user.model.js"; // Fix this import - remove curly braces
import AsyncHandler from "express-async-handler";
import { searchJobs, calculateSkillMatch } from '../utils/JobService.js';
import savedJobModel from "../models/savedJob.model.js";

// Get job recommendations based on user skills
export const getJobRecommendations = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const location = req.query.location || '';
    const page = parseInt(req.query.page) || 1;
    
    // Get user with parsed resume data
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if parsedResumeData exists and has skills
    if (!user.parsedResumeData || !user.parsedResumeData.skills || !user.parsedResumeData.skills.length) {
      return res.status(400).json({
        success: false,
        message: "No skills found in your resume to match jobs"
      });
    }
    
    const userSkills = user.parsedResumeData.skills;
    console.log(`Found ${userSkills.length} skills:`, userSkills);
    
    // Fetch jobs from RapidAPI
    const jobsData = await searchJobs(userSkills, location, page);
    console.log("Raw job data received:", JSON.stringify(jobsData.results.length));
    
    // Debug - check the structure of the first job
    if (jobsData.results && jobsData.results.length > 0) {
      console.log("Sample job data structure:", Object.keys(jobsData.results[0]));
    }
    
    // Process job results and calculate match scores
    const processedJobs = jobsData.results.map(job => {
      // Check if job description exists
      if (!job.job_description) {
        console.warn("Job missing description:", job.job_id || job.id);
      }
      
      const { percentage: matchPercentage, matchedSkills } = calculateSkillMatch(
        job.job_description || '', // Make sure to handle missing descriptions
        userSkills
      );
      
      // Format for frontend - transform job_* fields to expected names
      return {
        _id: job.job_id || job.id || `mock-${Math.random().toString(36).substring(7)}`,
        title: job.job_title || job.title || 'Job Title Not Available',
        company: job.employer_name || job.company || 'Company Not Specified',
        location: `${job.job_city || ''} ${job.job_state || ''} ${job.job_country || 'India'}`.trim(),
        description: job.job_description || job.description || '',
        salary: {
          min: job.job_min_salary || job.salary_min || null,
          max: job.job_max_salary || job.salary_max || null,
          currency: 'INR'
        },
        type: job.job_employment_type || job.type || 'Full-time',
        datePosted: job.job_posted_at_datetime_utc || job.created || new Date().toISOString(),
        matchPercentage,
        matchingSkills: matchedSkills,
        url: job.job_apply_link || job.redirect_url || null,
        isRemote: job.job_is_remote || false,
        publisher: job.job_publisher || 'Not Specified'
      };
    });
    
    console.log(`Processed ${processedJobs.length} jobs`);
    
    // Sort by match percentage (highest first)
    const sortedJobs = processedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    return res.status(200).json({
      success: true,
      count: sortedJobs.length,
      totalResults: jobsData.count,
      totalPages: Math.ceil(jobsData.count / jobsData.results_per_page) || 1,
      currentPage: page,
      recommendations: sortedJobs
    });
      
  } catch (error) {
    console.error("Error in job recommendations:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating job recommendations",
      error: error.message
    });
  }
});

export const saveJob = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Received job save request:", req.body);
    
    const { 
      jobId, title, company, location, salary, 
      link, description, skills, datePosted, jobType, matchScore 
    } = req.body;
    
    // Validate required fields
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: jobId'
      });
    }
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: title'
      });
    }
    
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: company'
      });
    }
    
    // Check if job is already saved
    const existingJob = await savedJobModel.findOne({ user: userId, jobId });
    
    if (existingJob) {
      return res.status(200).json({
        success: true,
        message: 'Job already saved',
        savedJob: existingJob
      });
    }
    
    // Create new saved job
    const savedJob = await savedJobModel.create({
      user: userId,
      jobId,
      title,
      company,
      location: location || '',
      salary: salary || '',
      link: link || '',
      description: description || '',
      skills: Array.isArray(skills) ? skills : [],
      datePosted: datePosted || '',
      jobType: jobType || '',
      matchScore: matchScore || 0
    });
    
    return res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      savedJob
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving job',
      error: error.message
    });
  }
});

export const unsaveJob = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    
    const result = await savedJobModel.findOneAndDelete({ user: userId, jobId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs'
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing saved job',
      error: error.message
    });
  }
});

export const getSavedJobs = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    const savedJobs = await savedJobModel.find({ user: userId }).sort({ savedAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: savedJobs.length,
      savedJobs
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs',
      error: error.message
    });
  }
});

// In backend/src/controllers/job.controller.js

export const analyzeSkillGaps = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params; // Get the specific job ID to analyze
    
    // Get user with parsed resume data
    const user = await User.findById(userId);
    
    if (!user || !user.parsedResumeData || !user.parsedResumeData.skills) {
      return res.status(400).json({
        success: false,
        message: "No skills found in your resume. Please upload your resume first."
      });
    }
    
    // Get user's current skills (normalize to lowercase for better matching)
    const userSkills = user.parsedResumeData.skills.map(skill => skill.toLowerCase());
    
    // Try to find the job in saved jobs first (most efficient)
    let jobData = await savedJobModel.findOne({ user: userId, jobId });
    
    // If not in saved jobs, fetch it from the API
    if (!jobData) {
      // This would be a new API call to get a specific job by ID
      // Since RapidAPI might not have a direct endpoint for this, we might need to
      // implement client-side caching of recently viewed jobs
      return res.status(404).json({
        success: false,
        message: "Job not found. Please save the job first or try again with a different job."
      });
    }
    
    // Extract required skills from job description
    const requiredSkills = extractSkillsFromJobDescription(jobData.description);
    
    // Find skills the user has that match job requirements
    const matchedSkills = requiredSkills.filter(skill => 
      userSkills.includes(skill.toLowerCase())
    );
    
    // Find skills the user is missing
    const missingSkills = requiredSkills.filter(skill => 
      !userSkills.includes(skill.toLowerCase())
    );
    
    // Calculate match percentage
    const matchPercentage = requiredSkills.length > 0 
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
      : 0;
    
    return res.status(200).json({
      success: true,
      data: {
        job: {
          id: jobData.jobId,
          title: jobData.title,
          company: jobData.company,
          description: jobData.description
        },
        userSkills,
        requiredSkills,
        matchedSkills,
        missingSkills,
        matchPercentage
      }
    });
  } catch (error) {
    console.error('Error analyzing skill gaps:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze skill gaps",
      error: error.message
    });
  }
});

// Function to extract skills from job description
function extractSkillsFromJobDescription(description) {
  if (!description) return [];
  
  // List of common tech skills to look for
  const commonSkills = [
    'javascript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'swift', 'typescript', 'golang',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', '.net',
    'mongodb', 'mysql', 'postgresql', 'sqlite', 'oracle', 'sql', 'nosql', 'firebase', 'redis',
    'aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'webpack', 'babel',
    'rest api', 'graphql', 'microservices', 'ci/cd', 'agile', 'scrum', 'jira', 'confluence',
    'machine learning', 'deep learning', 'ai', 'data science', 'data analysis', 'data visualization',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'r', 'tableau', 'power bi',
    'mobile development', 'ios', 'android', 'react native', 'flutter', 'xamarin',
    'devops', 'sre', 'security', 'blockchain', 'cloud computing'
  ];
  
  const descriptionLower = description.toLowerCase();
  const foundSkills = [];
  
  commonSkills.forEach(skill => {
    if (descriptionLower.includes(skill.toLowerCase())) {
      // Add it if not already in the list (case-insensitive check)
      if (!foundSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
  });
  
  return foundSkills;
}