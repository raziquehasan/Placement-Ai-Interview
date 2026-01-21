/**
 * HR Interview Prompts - Phase 2.2 Enhanced
 * Templates for behavioral, situational, and culture-fit assessment
 * Includes STAR evaluation, trait detection, and red flag analysis
 */

/**
 * Generate a behavioral interview question
 */
const generateHRQuestionPrompt = (resumeContext, role, category, questionNumber, totalQuestions) => `
You are a Senior HR Manager conducting a behavioral interview for a ${role} position.

CANDIDATE BACKGROUND (Resume Summary):
${resumeContext}

INTERVIEW CONTEXT:
- Question ${questionNumber} of ${totalQuestions}
- Category: ${category}
- Tone: Professional, conversational, and empathetic

CATEGORY FOCUS:
- Behavioral: Past experiences using STAR method (Situation, Task, Action, Result)
- Situational: Hypothetical "what would you do" scenarios
- Teamwork: Collaboration, conflict resolution, cross-functional work
- Leadership: Initiative, mentoring, ownership, decision-making
- Communication: Clarity, persuasion, active listening
- Career Goals: Ambition, alignment with company vision, growth mindset
- Culture Fit: Values, work style, ethics, adaptability

REQUIREMENTS:
1. Personalize the question based on the candidate's resume (reference specific projects, companies, or skills)
2. For first question, include a warm welcome
3. Design to uncover specific soft skills: communication, resilience, problem-solving, emotional intelligence
4. Frame questions to encourage STAR-format responses

OUTPUT FORMAT (JSON only, no markdown):
{
  "questionText": "Tell me about a time when you had to lead a team through a challenging project deadline. How did you ensure everyone stayed motivated and aligned?",
  "category": "${category}",
  "evaluationFocus": ["Leadership", "Communication", "Stress Management", "Team Motivation"]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.
`;

/**
 * Evaluate a behavioral answer with STAR method and trait detection
 */
const evaluateHRAnswerPrompt = (question, evaluationFocus, userAnswer) => `
You are a Senior HR Manager evaluating a candidate's behavioral interview response.

QUESTION ASKED:
${question}

EVALUATION FOCUS:
${evaluationFocus.join(', ')}

CANDIDATE'S ANSWER:
${userAnswer}

EVALUATION CRITERIA (0-10 scale):

1. **STAR Adherence (Authenticity)**: 
   - Did they provide clear Situation, Task, Action, and Result?
   - Was the story specific and believable?
   
2. **Clarity**: 
   - How clearly was the story communicated?
   - Was it well-structured and easy to follow?
   
3. **Confidence**: 
   - Did they show ownership and belief in their actions?
   - Was the tone assertive without being arrogant?
   
4. **Relevance**: 
   - Did the answer directly address the question?
   - Was the example appropriate for the role?

TRAIT DETECTION:
Identify which soft skills were demonstrated:
- Leadership
- Teamwork
- Communication
- Problem Solving
- Adaptability
- Emotional Intelligence
- Conflict Resolution
- Initiative

RED FLAGS (if any):
- Blaming others without accountability
- Vague or generic answers
- Lack of specific examples
- Negative attitude
- Poor communication skills
- Inconsistencies in the story

OUTPUT FORMAT (JSON only, no markdown):
{
  "score": 8,
  "confidence": 8,
  "clarity": 7,
  "relevance": 9,
  "authenticity": 8,
  "feedback": "Strong answer with clear STAR structure. You demonstrated excellent leadership by proactively addressing team concerns. Consider adding more specific metrics about the project outcome.",
  "detectedTraits": ["Leadership", "Communication", "Problem Solving"],
  "redFlags": [],
  "suggestedFollowUp": "Can you tell me more about how you measured the success of your leadership approach?"
}

IMPORTANT: 
- Be constructive and professional in feedback
- Return ONLY valid JSON, no additional text or markdown formatting
`;

/**
 * Analyze personality traits based on the complete HR round
 */
const analyzePersonalityPrompt = (questionsAndAnswers, role) => `
You are a Senior HR Manager analyzing a candidate's complete behavioral interview for a ${role} position.

COMPLETE INTERVIEW CONVERSATION:
${JSON.stringify(questionsAndAnswers, null, 2)}

ANALYSIS REQUIREMENTS:
1. Identify key personality traits demonstrated across all answers
2. Assess cultural fit for a modern tech company
3. Detect patterns in communication style
4. Evaluate overall professional maturity
5. Provide hiring recommendation

TRAIT SCORING (0-10):
- Leadership: Ability to guide, inspire, and take ownership
- Communication: Clarity, persuasion, active listening
- Teamwork: Collaboration, empathy, conflict resolution
- Adaptability: Flexibility, learning agility, resilience
- Problem Solving: Analytical thinking, creativity, decision-making
- Emotional Intelligence: Self-awareness, empathy, relationship management

OUTPUT FORMAT (JSON only, no markdown):
{
  "personalityTraits": [
    {
      "trait": "Leadership",
      "score": 8,
      "evidence": ["Led team through project deadline", "Mentored junior developers"]
    },
    {
      "trait": "Communication",
      "score": 7,
      "evidence": ["Clear explanation of conflict resolution", "Articulated vision to stakeholders"]
    },
    {
      "trait": "Teamwork",
      "score": 9,
      "evidence": ["Collaborated across departments", "Resolved team conflicts diplomatically"]
    },
    {
      "trait": "Adaptability",
      "score": 8,
      "evidence": ["Pivoted strategy when requirements changed", "Learned new technology quickly"]
    }
  ],
  "cultureFitScore": 8,
  "overallStrengths": [
    "Strong leadership and team management skills",
    "Excellent communication and stakeholder management",
    "Demonstrated growth mindset and learning agility"
  ],
  "overallConcerns": [
    "Limited experience with remote team management",
    "Could improve on handling ambiguity"
  ],
  "overallSummary": "The candidate demonstrates strong soft skills with excellent leadership and communication abilities. They show a clear growth mindset and have successfully navigated complex team dynamics. Their STAR-based responses were authentic and well-structured.",
  "recommendation": "Strong Hire"
}

RECOMMENDATION LEVELS:
- "Strong Hire": Exceptional soft skills, perfect culture fit
- "Hire": Good soft skills, strong culture fit
- "Consider": Adequate skills but some concerns
- "Reject": Significant red flags or poor fit

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.
`;

module.exports = {
  generateHRQuestionPrompt,
  evaluateHRAnswerPrompt,
  analyzePersonalityPrompt
};
