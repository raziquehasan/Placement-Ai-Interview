/**
 * Technical Interview Prompt Templates - Phase 2.1
 * Production-grade AI prompts for resume-aware interview simulation
 */

/**
 * Generate Resume-Aware Technical Question
 * @param {Object} params - Question generation parameters
 * @returns {String} - AI prompt for question generation
 */
function generateQuestionPrompt({ resumeContext, role, category, difficulty, questionNumber, previousQuestions = [] }) {
    const previousQuestionsContext = previousQuestions.length > 0
        ? `PREVIOUS QUESTIONS ASKED (DO NOT REPEAT THESE OR ASK SIMILAR ONES):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
        : 'No previous questions asked yet.';

    return `You are a Senior Software Engineer conducting a technical interview for the role of ${role}.

CANDIDATE RESUME SUMMARY:
${resumeContext}

INTERVIEW CONTEXT:
- Question Number: ${questionNumber}/10
- Category: ${category}
- Difficulty: ${difficulty}
- Role: ${role}

${previousQuestionsContext}

CATEGORY DEFINITIONS & EXAMPLES:
- "Core CS": Operating Systems, Networks, DBMS, OOP, Memory Management, Concurrency
  Examples: "Explain virtual memory", "Difference between TCP and UDP", "How does deadlock occur?"
  
- "DSA": Data Structures, Algorithms, Complexity Analysis, Problem-Solving
  Examples: "Implement binary search", "Find time complexity of QuickSort", "Reverse a linked list"
  
- "System Design": Architecture, Scalability, Trade-offs, Distributed Systems
  Examples: "Design a URL shortener", "How would you scale a chat application?", "CAP theorem trade-offs"
  
- "Framework": React, Node.js, Django, etc. (based on resume skills)
  Examples: "Explain React hooks lifecycle", "How does Express middleware work?", "Optimize React rendering"
  
- "Projects": Deep dive into candidate's resume projects, ask specific implementation questions
  Examples: "In your [project], how did you handle [challenge]?", "Why did you choose [technology]?"

CRITICAL INSTRUCTIONS:
1. Generate ONE focused technical question STRICTLY for the "${category}" category
2. Make it ${difficulty} difficulty level
3. DO NOT ask generic project questions for Core CS, DSA, or System Design categories
4. For "${category}" category, ask a SPECIFIC technical question related to that domain
5. ${previousQuestionsContext ? 'IMPORTANT: DO NOT repeat or ask similar questions to those already asked above' : ''}
6. The question MUST be different from any previous questions
7. Avoid generic questions like "tell me about a project" - be specific to the category

EXAMPLES OF GOOD QUESTIONS FOR ${category}:
${getCategoryExamples(category)}

OUTPUT FORMAT (JSON):
{
  "questionText": "string - The actual interview question (MUST be specific to ${category})",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "expectedAnswer": "string - Key points the candidate should cover in a good answer",
  "evaluationRubric": [
    { "point": "string - First key concept to look for", "weight": number (0-1) },
    { "point": "string - Second key concept", "weight": number (0-1) },
    { "point": "string - Third key concept", "weight": number (0-1) }
  ]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`;
}

/**
 * Get category-specific examples
 */
function getCategoryExamples(category) {
    const examples = {
        'Core CS': `
- "Explain the difference between process and thread with examples"
- "How does virtual memory work in modern operating systems?"
- "What is the difference between stack and heap memory?"
- "Explain how a database index works internally"`,
        'DSA': `
- "Implement a function to reverse a linked list"
- "Find the time complexity of merge sort and explain why"
- "How would you detect a cycle in a linked list?"
- "Implement binary search and analyze its complexity"`,
        'System Design': `
- "Design a URL shortening service like bit.ly"
- "How would you design a rate limiter for an API?"
- "Explain the trade-offs between SQL and NoSQL databases"
- "Design a notification system for a social media platform"`,
        'Framework': `
- "Explain how React's virtual DOM works"
- "What are the differences between useEffect and useLayoutEffect?"
- "How does middleware work in Express.js?"
- "Explain the event loop in Node.js"`,
        'Projects': `
- "In your [specific project], how did you handle [specific challenge]?"
- "What was the most difficult bug you encountered in [project]?"
- "How did you optimize performance in [project]?"
- "Why did you choose [technology] for [project]?"`
    };

    return examples[category] || 'Ask a specific technical question for this category';
}

/**
 * Evaluate Technical Answer with Rubric
 * @param {Object} params - Evaluation parameters
 * @returns {String} - AI prompt for answer evaluation
 */
function evaluateAnswerPrompt({ question, expectedAnswer, userAnswer, rubric }) {
    return `You are a Senior Software Engineer evaluating a candidate's technical interview answer.

QUESTION ASKED:
${question}

EXPECTED KEY POINTS:
${expectedAnswer}

EVALUATION RUBRIC:
${JSON.stringify(rubric, null, 2)}

CANDIDATE'S ANSWER:
${userAnswer}

EVALUATION CRITERIA:
1. **Accuracy** (0-10): Are the concepts technically correct?
2. **Completeness** (0-10): Did they cover all key points from the rubric?
3. **Clarity** (0-10): Is the explanation clear and well-structured?
4. **Depth** (0-10): Do they demonstrate deep understanding or surface-level knowledge?

SCORING GUIDELINES:
- 9-10: Excellent answer, covers all points with deep understanding
- 7-8: Good answer, covers most points clearly
- 5-6: Satisfactory, covers some points but missing key concepts
- 3-4: Weak answer, major gaps in understanding
- 1-2: Poor answer, fundamental misunderstanding
- 0: Completely wrong or irrelevant

OUTPUT FORMAT (JSON):
{
  "score": number (0-10),
  "strengths": ["Array of 2-3 specific strengths from the answer"],
  "weaknesses": ["Array of 2-3 areas that could be improved"],
  "missingPoints": ["Array of key concepts from rubric that were not mentioned"],
  "feedback": "string - Constructive feedback in 2-3 sentences, as if speaking to the candidate",
  "suggestedFollowUp": "string - If score < 7, suggest a follow-up question to probe deeper. Otherwise null."
}

IMPORTANT: 
- Be fair but realistic - this should match how a real interviewer would evaluate
- Feedback should be constructive and professional
- Return ONLY valid JSON, no additional text or markdown formatting.`;
}

/**
 * Generate Follow-up Question
 * @param {Object} params - Follow-up generation parameters
 * @returns {String} - AI prompt for follow-up question
 */
function generateFollowUpPrompt({ originalQuestion, userAnswer, evaluation }) {
    return `You are a Senior Software Engineer conducting a technical interview.

ORIGINAL QUESTION:
${originalQuestion}

CANDIDATE'S ANSWER:
${userAnswer}

YOUR EVALUATION:
Score: ${evaluation.score}/10
Weaknesses: ${evaluation.weaknesses.join(', ')}
Missing Points: ${evaluation.missingPoints.join(', ')}

TASK:
The candidate scored below 7/10. Generate a follow-up question to:
1. Probe deeper into areas they missed
2. Give them a chance to demonstrate better understanding
3. Focus on ONE specific gap from the missing points

The follow-up should be:
- Specific and focused
- Related to the original question
- Easier than the original (to help them recover)
- Encourages them to elaborate on weak areas

OUTPUT FORMAT (JSON):
{
  "followUpQuestion": "string - The follow-up question to ask"
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`;
}

/**
 * Generate Resume Context Compression
 * Compress resume data for AI context injection
 * @param {Object} resume - Full resume data from database
 * @returns {String} - Compressed resume summary for AI
 */
function compressResumeContext(resume) {
    const skills = resume.parsedData?.skills || [];
    const education = resume.parsedData?.education || [];
    const experience = resume.parsedData?.experience || [];

    let context = `SKILLS: ${skills.slice(0, 15).join(', ')}\n\n`;

    if (education.length > 0) {
        context += `EDUCATION:\n`;
        education.slice(0, 2).forEach(edu => {
            context += `- ${edu.degree} in ${edu.field} from ${edu.institution}\n`;
        });
        context += '\n';
    }

    if (experience.length > 0) {
        context += `EXPERIENCE:\n`;
        experience.slice(0, 3).forEach(exp => {
            context += `- ${exp.position} at ${exp.company}\n`;
            if (exp.description) {
                context += `  ${exp.description.substring(0, 150)}...\n`;
            }
        });
    }

    return context.trim();
}

module.exports = {
    generateQuestionPrompt,
    evaluateAnswerPrompt,
    generateFollowUpPrompt,
    compressResumeContext
};
