/**
 * AI Interview Service - Phase 2.1
 * Handles AI-powered question generation and answer evaluation
 */

const geminiClient = require('../utils/geminiClient');
const openaiClient = require('../utils/openaiClient');
const {
    generateQuestionPrompt,
    evaluateAnswerPrompt,
    generateFollowUpPrompt
} = require('../prompts/technicalPrompts');
const {
    generateHRQuestionPrompt,
    evaluateHRAnswerPrompt,
    analyzePersonalityPrompt
} = require('../prompts/hrPrompts');
const logger = require('../utils/logger');

/**
 * Generate Technical Question using AI
 * @param {Object} params -Question generation parameters
 * @returns {Promise<Object>} - Generated question with rubric
 */
async function generateTechnicalQuestion({ resumeContext, role, category, difficulty, questionNumber, previousQuestions = [] }) {
    try {
        const prompt = generateQuestionPrompt({
            resumeContext,
            role,
            category,
            difficulty,
            questionNumber,
            previousQuestions
        });

        logger.info(`Generating ${difficulty} ${category} question for ${role} - Question #${questionNumber}`);

        // Try Gemini first (faster and cheaper)
        try {
            const result = await geminiClient.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            // Parse JSON response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from Gemini');
            }

            const questionData = JSON.parse(jsonMatch[0]);

            logger.info(`✅ Question generated successfully via Gemini`);
            return questionData;

        } catch (geminiError) {
            logger.warn(`Gemini failed, falling back to OpenAI: ${geminiError.message}`);

            // Fallback to OpenAI
            try {
                const completion = await openaiClient.chat.completions.create({
                    model: 'gpt-4o-mini', // Upgraded to gpt-4o-mini
                    messages: [
                        { role: 'system', content: 'You are a senior software engineer conducting technical interviews.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                    response_format: { type: "json_object" }
                });

                const responseText = completion.choices[0].message.content;
                const questionData = JSON.parse(responseText);

                logger.info(`✅ Question generated successfully via OpenAI`);
                return questionData;
            } catch (openaiError) {
                logger.error(`❌ OpenAI also failed: ${openaiError.message}`);

                // FINAL FALLBACK: Hardcoded question to prevent total failure
                return {
                    questionText: `Could you tell me about a challenging technical project you've worked on recently and the specific hurdles you faced?`,
                    category: category,
                    difficulty: difficulty,
                    expectedAnswer: "Details about technical challenges, problem-solving approach, and technologies used.",
                    evaluationRubric: [
                        { point: "Complexity of the challenge", weight: 0.4 },
                        { point: "Clarity of explanation", weight: 0.3 },
                        { point: "Result or outcome", weight: 0.3 }
                    ]
                };
            }
        }

    } catch (error) {
        logger.error('❌ Failed to generate question:', error);
        throw new Error(`AI question generation failed: ${error.message}`);
    }
}

/**
 * Evaluate Technical Answer using AI
 * @param {Object} params - Evaluation parameters
 * @returns {Promise<Object>} - Evaluation with score and feedback
 */
async function evaluateTechnicalAnswer({ question, expectedAnswer, userAnswer, rubric }) {
    try {
        const prompt = evaluateAnswerPrompt({
            question,
            expectedAnswer,
            userAnswer,
            rubric
        });

        logger.info(`Evaluating answer for question: ${question.substring(0, 50)}...`);

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            // Parse JSON response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from Gemini');
            }

            const evaluation = JSON.parse(jsonMatch[0]);

            logger.info(`✅ Answer evaluated: Score ${evaluation.score}/10`);
            return evaluation;

        } catch (geminiError) {
            logger.warn(`Gemini failed, falling back to OpenAI: ${geminiError.message}`);

            // Fallback to OpenAI
            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a senior software engineer evaluating technical interview answers.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3, // Lower temperature for consistent evaluation
                max_tokens: 600
            });

            const responseText = completion.choices[0].message.content;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('Invalid JSON response from OpenAI');
            }

            const evaluation = JSON.parse(jsonMatch[0]);

            logger.info(`✅ Answer evaluated: Score ${evaluation.score}/10`);
            return evaluation;
        }

    } catch (error) {
        logger.error('❌ Failed to evaluate answer:', error);
        throw new Error(`AI evaluation failed: ${error.message}`);
    }
}

/**
 * Generate Follow-up Question
 * @param {Object} params - Follow-up generation parameters
 * @returns {Promise<String>} - Follow-up question text
 */
async function generateFollowUp({ originalQuestion, userAnswer, evaluation }) {
    try {
        // Only generate follow-up if score is low
        if (evaluation.score >= 7) {
            return null;
        }

        const prompt = generateFollowUpPrompt({
            originalQuestion,
            userAnswer,
            evaluation
        });

        logger.info(`Generating follow-up question (score was ${evaluation.score}/10)`);

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from Gemini');
            }

            const followUpData = JSON.parse(jsonMatch[0]);

            logger.info(`✅ Follow-up question generated`);
            return followUpData.followUpQuestion;

        } catch (geminiError) {
            logger.warn(`Gemini failed, falling back to OpenAI: ${geminiError.message}`);

            // Fallback to OpenAI
            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a senior software engineer conducting technical interviews.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 200
            });

            const responseText = completion.choices[0].message.content;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('Invalid JSON response from OpenAI');
            }

            const followUpData = JSON.parse(jsonMatch[0]);

            logger.info(`✅ Follow-up question generated`);
            return followUpData.followUpQuestion;
        }

    } catch (error) {
        logger.error('❌ Failed to generate follow-up:', error);
        // Don't throw - follow-up is optional
        return null;
    }
}

/**
 * Generate HR Question using AI
 * @param {Object} params - Question parameters
 * @returns {Promise<Object>} - Generated question
 */
async function generateHRQuestion({ resumeContext, role, category, questionNumber, totalQuestions }) {
    try {
        const prompt = generateHRQuestionPrompt(resumeContext, role, category, questionNumber, totalQuestions);

        logger.info(`Generating HR ${category} question for ${role} - Question #${questionNumber}`);

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from Gemini');

            const questionData = JSON.parse(jsonMatch[0]);
            logger.info(`✅ HR Question generated via Gemini`);
            return questionData;

        } catch (geminiError) {
            logger.warn(`Gemini failed for HR question, falling back: ${geminiError.message}`);

            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an HR Manager conducting behavioral interviews.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const responseText = completion.choices[0].message.content;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from OpenAI');

            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        logger.error('❌ Failed to generate HR question:', error);
        throw new Error(`HR question generation failed: ${error.message}`);
    }
}

/**
 * Evaluate HR Answer using AI
 * @param {Object} params - Evaluation parameters
 * @returns {Promise<Object>} - Soft skills and STAR analysis
 */
async function evaluateHRAnswer({ question, evaluationFocus, userAnswer }) {
    try {
        const prompt = evaluateHRAnswerPrompt(question, evaluationFocus, userAnswer);

        logger.info(`Evaluating HR answer for question: ${question.substring(0, 50)}...`);

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from Gemini');

            const evaluation = JSON.parse(jsonMatch[0]);
            logger.info(`✅ HR Answer evaluated: Score ${evaluation.score}/10`);
            return evaluation;

        } catch (geminiError) {
            logger.warn(`Gemini failed for HR evaluation, falling back: ${geminiError.message}`);

            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an HR Manager evaluating behavioral interview answers using the STAR method.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 600
            });

            const responseText = completion.choices[0].message.content;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from OpenAI');

            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        logger.error('❌ Failed to evaluate HR answer:', error);
        throw new Error(`HR evaluation failed: ${error.message}`);
    }
}

/**
 * Analyze Personality Traits from HR Round
 * @param {Array} questionsAndAnswers - Complete HR conversation
 * @param {String} role - Job role
 * @returns {Promise<Object>} - Personality analysis
 */
async function analyzePersonality(questionsAndAnswers, role) {
    try {
        const prompt = analyzePersonalityPrompt(questionsAndAnswers, role);

        logger.info(`Analyzing personality traits from ${questionsAndAnswers.length} HR responses`);

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from Gemini');

            const analysis = JSON.parse(jsonMatch[0]);
            logger.info(`✅ Personality analysis complete: ${analysis.recommendation}`);
            return analysis;

        } catch (geminiError) {
            logger.warn(`Gemini failed for personality analysis, falling back: ${geminiError.message}`);

            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are an HR psychologist analyzing candidate personality from interview responses.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 1000,
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        }
    } catch (error) {
        logger.error('❌ Failed to analyze personality:', error);
        throw new Error(`Personality analysis failed: ${error.message}`);
    }
}

/**
 * Generate Coding Problem using AI
 * @param {Object} params - Problem generation parameters
 * @returns {Promise<Object>} - Generated coding problem
 */
async function generateCodingProblem({ role, difficulty, resumeSkills, questionNumber = 1 }) {
    try {
        const { generateCodingProblemPrompt } = require('../prompts/codingPrompts');
        const prompt = generateCodingProblemPrompt({ role, difficulty, resumeSkills, questionNumber });

        logger.info(`Generating ${difficulty} coding problem for ${role}`);

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from Gemini');

            const problem = JSON.parse(jsonMatch[0]);
            logger.info(`✅ Coding problem generated: ${problem.title}`);
            return problem;

        } catch (geminiError) {
            logger.warn(`Gemini failed for coding problem, falling back: ${geminiError.message}`);

            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a senior software engineer creating coding interview problems.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        }
    } catch (error) {
        logger.error('❌ Failed to generate coding problem:', error);
        throw new Error(`Coding problem generation failed: ${error.message}`);
    }
}

/**
 * Review Code using AI
 * @param {Object} params - Code review parameters
 * @returns {Promise<Object>} - Code review evaluation
 */
async function reviewCode({ problem, code, language, testResults }) {
    try {
        const { reviewCodePrompt } = require('../prompts/codingPrompts');
        const prompt = reviewCodePrompt({ problem, code, language, testResults });

        logger.info(`Reviewing ${language} code for problem: ${problem.title}`);

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from Gemini');

            const review = JSON.parse(jsonMatch[0]);
            logger.info(`✅ Code review complete: Score ${review.overallScore}/10`);
            return review;

        } catch (geminiError) {
            logger.warn(`Gemini failed for code review, falling back: ${geminiError.message}`);

            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a senior software engineer reviewing code for technical interviews.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1500,
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        }
    } catch (error) {
        logger.error('❌ Failed to review code:', error);
        throw new Error(`Code review failed: ${error.message}`);
    }
}

module.exports = {
    generateTechnicalQuestion,
    evaluateTechnicalAnswer,
    generateFollowUp,
    generateHRQuestion,
    evaluateHRAnswer,
    analyzePersonality,
    generateCodingProblem,
    reviewCode
};
