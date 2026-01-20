/**
 * Resume Service
 * Business logic for resume parsing and processing
 */

const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Parse resume and extract information
 * @param {Object} file - Uploaded file object
 * @param {String} userId - User ID
 * @returns {Object} Parsed resume data
 */
const parseResume = async (file, userId) => {
    try {
        // Read file buffer
        const dataBuffer = await fs.readFile(file.path);

        // Parse PDF
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        // Extract information
        const skills = extractSkills(text);
        const education = extractEducation(text);
        const experience = extractExperience(text);

        // Save resume to database
        const resume = await Resume.create({
            userId,
            fileName: file.originalname,
            fileUrl: file.path, // In production, upload to S3/Cloudinary
            parsedData: {
                skills,
                education,
                experience
            }
        });

        return resume;

    } catch (error) {
        throw new Error(`Resume parsing failed: ${error.message}`);
    }
};

/**
 * Extract skills from resume text
 * @param {String} text - Resume text
 * @returns {Array} List of skills
 */
const extractSkills = (text) => {
    // Common technical skills keywords
    const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Express',
        'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes',
        'Git', 'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue', 'Django', 'Flask',
        'Spring', 'REST API', 'GraphQL', 'Redis', 'Machine Learning', 'AI',
        'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    skillKeywords.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    });

    return [...new Set(foundSkills)]; // Remove duplicates
};

/**
 * Extract education from resume text
 * @param {String} text - Resume text
 * @returns {Array} List of education entries
 */
const extractEducation = (text) => {
    const education = [];

    // Simple pattern matching for degrees
    const degreePatterns = [
        /B\.?Tech|Bachelor of Technology/gi,
        /B\.?E\.?|Bachelor of Engineering/gi,
        /M\.?Tech|Master of Technology/gi,
        /M\.?S\.?|Master of Science/gi,
        /B\.?Sc|Bachelor of Science/gi,
        /MBA|Master of Business Administration/gi
    ];

    degreePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                education.push({
                    degree: match,
                    institution: 'Not specified', // Enhanced parsing can be added
                    field: 'Not specified',
                    startYear: null,
                    endYear: null
                });
            });
        }
    });

    return education;
};

/**
 * Extract work experience from resume text
 * @param {String} text - Resume text
 * @returns {Array} List of experience entries
 */
const extractExperience = (text) => {
    const experience = [];

    // Look for common job titles
    const jobTitles = [
        'Software Engineer', 'Developer', 'Intern', 'Analyst',
        'Manager', 'Consultant', 'Designer', 'Architect'
    ];

    jobTitles.forEach(title => {
        if (text.toLowerCase().includes(title.toLowerCase())) {
            experience.push({
                position: title,
                company: 'Not specified', // Enhanced parsing can be added
                startDate: null,
                endDate: null,
                description: 'Experience detected',
                current: false
            });
        }
    });

    return experience;
};

/**
 * Get resume by ID
 * @param {String} resumeId - Resume ID
 * @returns {Object} Resume data
 */
const getResumeById = async (resumeId) => {
    const resume = await Resume.findById(resumeId).populate('userId', 'name email');

    if (!resume) {
        throw new Error('Resume not found');
    }

    return resume;
};

/**
 * Get all resumes for a user
 * @param {String} userId - User ID
 * @returns {Array} List of resumes
 */
const getUserResumes = async (userId) => {
    const resumes = await Resume.find({ userId }).sort({ uploadedAt: -1 });
    return resumes;
};

module.exports = {
    parseResume,
    extractSkills,
    extractEducation,
    extractExperience,
    getResumeById,
    getUserResumes
};
