/**
 * HR Interview Prompts - Phase 2.2
 * Templates for behavioral, situational, and culture-fit assessment
 */

/**
 * Generate a behavioral interview question
 */
const generateHRQuestionPrompt = (resumeContext, role, category, questionNumber, totalQuestions) => `
You are an experienced HR Manager conducting a behavioral interview for a ${role} position.

CANDIDATE BACKGROUND (Compressed Resume):
${resumeContext}

INTERVIEW CONTEXT:
- Question ${questionNumber} of ${totalQuestions}
- Category: ${category}
- Tone: Professional yet conversational and empathetic.

CATEGORIES FOCUS:
- Behavioral: STAR method (Situation, Task, Action, Result) based on past experiences.
- Situational: Hypothetical "what would you do" scenarios.
- Teamwork: Collaboration, conflict resolution.
- Leadership: Initiative, mentoring, ownership.
- Career Goals: Ambition, alignment with company long-term.
- Culture Fit: Values, work style, ethics.

REQUIREMENTS:
1. Make the question personalized. Reference candidate's specific projects, companies, or skills from the background.
2. If it's a first question, start with a warm welcome reference.
3. Aim to uncover specific soft skills like communication, resilience, or problem-solving.

OUTPUT FORMAT (JSON):
{
  "questionText": "string",
  "category": "${category}",
  "evaluationFocus": ["point1", "point2"],
  "expectedSTARComponents": {
    "situation": "what context they should provide",
    "action": "what specific steps they should mention",
    "result": "what outcome should be highlighted"
  }
}
`;

/**
 * Evaluate a behavioral answer
 */
const evaluateHRAnswerPrompt = (question, evaluationFocus, userAnswer) => `
You are an HR Manager evaluating a candidate's behavioral interview response.

QUESTION: ${question}
EVALUATION FOCUS: ${evaluationFocus.join(', ')}

CANDIDATE'S ANSWER:
${userAnswer}

EVALUATION CRITERIA:
1. STAR Adherence: Did they provide Situation, Task, Action, and Result? (Authenticity)
2. Clarity: How clearly was the story communicated?
3. Confidence: Did they show ownership and belief in their actions?
4. Relevance: Did the answer actually address the question?
5. Key Takeaway: What soft skill did they demonstrate?

OUTPUT FORMAT (JSON):
{
  "score": number (0-10),
  "confidence": number (0-10),
  "clarity": number (0-10),
  "relevance": number (0-10),
  "authenticity": number (0-10),
  "feedback": "string (gentle, constructive HR feedback)",
  "softSkillsDemonstrated": ["skill1", "skill2"],
  "concerns": ["potential red flags if any"],
  "suggestedFollowUp": "string (short follow-up if specific STAR part is missing or detail is thin)"
}
`;

/**
 * Analyze personality traits based on the round conversation
 */
const analyzePersonalityPrompt = (questionsAndAnswers) => `
Analyze the following HR interview conversation to identify key personality traits and cultural fit.

CONVERSATION:
${JSON.stringify(questionsAndAnswers, null, 2)}

Provide a summary of the candidate's professional personality.

OUTPUT FORMAT (JSON):
{
  "personalityTraits": [
    { "trait": "Leadership", "score": number, "evidence": ["quote or action"] },
    { "trait": "Communication", "score": number, "evidence": ["quote or action"] },
    { "trait": "Teamwork", "score": number, "evidence": ["quote or action"] },
    { "trait": "Adaptability", "score": number, "evidence": ["quote or action"] }
  ],
  "cultureFitScore": number (0-10),
  "overallSummary": "string",
  "recommendation": "string (Hire/Strong Hire/Reject/Consider)"
}
`;

module.exports = {
    generateHRQuestionPrompt,
    evaluateHRAnswerPrompt,
    analyzePersonalityPrompt
};
