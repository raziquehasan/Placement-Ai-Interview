/**
 * Resume Service
 * Business logic for resume parsing and processing
 */

const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const model = require('../utils/geminiClient');
const logger = require('../utils/logger');

/**
 * Create initial resume record in database
 * @param {Object} file - Uploaded file object
 * @param {String} userId - User ID
 * @returns {Object} Created resume
 */
const createInitialResume = async (file, userId) => {
    return await Resume.create({
        userId,
        fileName: file.originalname,
        fileUrl: file.path,
        parsedData: {
            skills: [],
            education: [],
            experience: [],
            atsAnalysis: {
                atsScore: 0,
                status: 'Pending',
                jobReadiness: 'TBD'
            }
        }
    });
};

/**
 * Parse resume and extract information
 * @param {Object} file - Uploaded file object
 * @param {String} userId - User ID
 * @param {String} resumeId - Existing Resume ID
 * @returns {Object} Updated resume data
 */
const parseResume = async (file, userId, resumeId = null) => {
    try {
        // Read file buffer (using absolute path)
        const absolutePath = path.resolve(process.cwd(), file.path);
        const dataBuffer = await fs.readFile(absolutePath);

        // Parse PDF
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        // Extract information
        const skills = extractSkills(text);
        const education = extractEducation(text);
        const experience = extractExperience(text);

        // Update existing resume or create new one
        let resume;
        if (resumeId) {
            resume = await Resume.findByIdAndUpdate(resumeId, {
                parsedData: {
                    skills,
                    education,
                    experience,
                    atsAnalysis: {
                        atsScore: 0,
                        status: 'Pending',
                        jobReadiness: 'TBD'
                    }
                }
            }, { new: true });
        } else {
            resume = await Resume.create({
                userId,
                fileName: file.originalname,
                fileUrl: file.path,
                parsedData: {
                    skills,
                    education,
                    experience
                }
            });
        }

        if (!resume) throw new Error('Resume record not found to update');

        // Trigger AI analysis (now updating the same record)
        await analyzeResume(resume._id);

        // Fetch final updated resume
        return await Resume.findById(resume._id);

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
 * Delete a resume
 * @param {String} resumeId - Resume ID
 * @param {String} userId - User ID
 * @returns {Boolean} Success status
 */
const deleteResume = async (resumeId, userId) => {
    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
        throw new Error('Resume not found or unauthorized');
    }

    // Delete file from filesystem
    try {
        await fs.unlink(resume.fileUrl);
    } catch (error) {
        // Log error but continue with DB deletion
        console.error(`Failed to delete file ${resume.fileUrl}:`, error.message);
    }

    await Resume.findByIdAndDelete(resumeId);
    return true;
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

/**
 * Analyze resume using AI for ATS scoring
 * @param {String} resumeId - Resume ID
 * @returns {Object} Updated resume with analysis
 */
const analyzeResume = async (resumeId) => {
    try {
        const resume = await Resume.findById(resumeId);
        if (!resume) throw new Error('Resume not found');

        // Prepare context from parsed data
        const skills = resume.parsedData.skills.join(', ') || 'Not specified';
        const exp = JSON.stringify(resume.parsedData.experience);
        const edu = JSON.stringify(resume.parsedData.education);

        const prompt = `You are a Senior Technical Recruiter and ATS (Applicant Tracking System) Specialist at a top-tier tech company (like Google, Meta, or Amazon).
Evaluate this resume specfically for a "Software Engineer" role.

Resume Details:
- Skills: ${skills}
- Experience: ${exp}
- Education: ${edu}

SCORING CRITERIA (Strict Evaluation):
1. **Technical Stack (40%)**: Proficiency in modern languages (JavaScript, Python, Java, etc.) and frameworks (React, Node, etc.).
2. **Experience Impact (30%)**: Clear evidence of contributions, internships, or relevant projects. Use of action verbs.
3. **Keyword Optimization (20%)**: Presence of industry-standard technical keywords.
4. **Professionalism & Structure (10%)**: ATS friendliness and clarity.

YOU MUST RETURN THE DATA IN THIS EXACT JSON FORMAT ONLY:
{
  "atsScore": <number 0-100>,
  "status": "Shortlisted" | "Not Shortlisted",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvementSuggestions": ["string"],
  "jobReadiness": "High" | "Medium" | "Low"
}

RULE: Score >= 60 is "Shortlisted".

Return ONLY the JSON. No markdown, no pre-amble, no explanation.`;

        logger.info(`🤖 Analyzing resume ${resumeId} with Gemini...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text();

        // Handle markdown-wrapped JSON
        if (responseText.includes('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (responseText.includes('```')) {
            responseText = responseText.replace(/```\n?/g, '').trim();
        }

        const rawAnalysis = JSON.parse(responseText);

        // Robust Normalization of Keys (Handle variations Gemini might return)
        const analysis = {
            atsScore: Number(rawAnalysis.atsScore || rawAnalysis.score || rawAnalysis.ats_score || 0),
            status: rawAnalysis.status || (rawAnalysis.atsScore >= 60 ? 'Shortlisted' : 'Not Shortlisted'),
            strengths: Array.isArray(rawAnalysis.strengths) ? rawAnalysis.strengths : [],
            weaknesses: Array.isArray(rawAnalysis.weaknesses) ? rawAnalysis.weaknesses : [],
            improvementSuggestions: Array.isArray(rawAnalysis.improvementSuggestions || rawAnalysis.suggestions) ? (rawAnalysis.improvementSuggestions || rawAnalysis.suggestions) : [],
            jobReadiness: rawAnalysis.jobReadiness || 'Medium'
        };

        // Update resume with analysis
        resume.parsedData.atsAnalysis = {
            ...analysis,
            analyzedAt: new Date()
        };

        // CRITICAL: Mongoose doesn't always detect deep nested changes. Mark 'parsedData' as modified.
        resume.markModified('parsedData');
        await resume.save();

        logger.info(`✅ Resume ${resumeId} analyzed successfully. Score: ${analysis.atsScore}, Status: ${analysis.status}`);
        return resume;

    } catch (error) {
        logger.error(`❌ Resume analysis failed: ${error.message}`);
        logger.debug(`Raw analysis error context:`, error);
        throw error;
    }
};

module.exports = {
    parseResume,
    extractSkills,
    extractEducation,
    extractExperience,
    getResumeById,
    getUserResumes,
    deleteResume,
    analyzeResume,
    createInitialResume
};
