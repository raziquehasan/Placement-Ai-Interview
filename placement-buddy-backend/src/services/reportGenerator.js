/**
 * Report Generator Service - Phase 2.4
 * Generates final hiring reports with scores, decisions, and improvement plans
 */

const logger = require('../utils/logger');
const geminiClient = require('../utils/geminiClient');
const openaiClient = require('../utils/openaiClient');

/**
 * Calculate Overall Score from all rounds
 * Technical: 40%, HR: 25%, Coding: 35%
 */
function calculateOverallScore(technicalScore, hrScore, codingScore) {
    const weights = {
        technical: 0.40,
        hr: 0.25,
        coding: 0.35
    };

    const overall = (
        (technicalScore * weights.technical) +
        (hrScore * weights.hr) +
        (codingScore * weights.coding)
    );

    return Math.round(overall * 100) / 100;
}

/**
 * Determine Hiring Decision based on overall score
 */
function getHiringDecision(overallScore) {
    if (overallScore >= 85) {
        return {
            decision: 'Strong Hire',
            probability: 95,
            roleReadiness: 'Immediately Ready',
            color: '#10b981' // green
        };
    } else if (overallScore >= 70) {
        return {
            decision: 'Hire',
            probability: 80,
            roleReadiness: 'Ready with Minor Onboarding',
            color: '#3b82f6' // blue
        };
    } else if (overallScore >= 55) {
        return {
            decision: 'Consider',
            probability: 50,
            roleReadiness: 'Needs Development',
            color: '#f59e0b' // amber
        };
    } else {
        return {
            decision: 'Reject',
            probability: 20,
            roleReadiness: 'Not Ready',
            color: '#ef4444' // red
        };
    }
}

/**
 * Generate Improvement Plan using AI
 */
async function generateImprovementPlan({
    resume,
    role,
    technicalRound,
    hrRound,
    codingRound,
    overallScore,
    hiringDecision
}) {
    try {
        const prompt = `
You are a Career Development Coach analyzing a candidate's interview performance.

CANDIDATE PROFILE:
- Role Applied: ${role}
- Overall Score: ${overallScore}/100
- Hiring Decision: ${hiringDecision}

ROUND SCORES:
- Technical Round: ${technicalRound.totalScore}/100
- HR Round: ${hrRound.totalScore}/100
- Coding Round: ${codingRound.finalScore}/100

TECHNICAL ROUND ANALYSIS:
- Average Score: ${technicalRound.averageScore}/10
- Score Breakdown: ${JSON.stringify(technicalRound.scoreBreakdown)}
- Evaluated Questions: ${technicalRound.evaluatedQuestions}

HR ROUND ANALYSIS:
- Communication Skills: ${hrRound.communicationSkills}/10
- Culture Fit: ${hrRound.cultureFit}/10
- Leadership Potential: ${hrRound.leadershipPotential}/10
- Strengths: ${hrRound.strengths.join(', ')}
- Concerns: ${hrRound.concerns.join(', ')}

CODING ROUND ANALYSIS:
- Test Pass Rate: ${codingRound.testResults.testPassRate}%
- Code Quality: ${codingRound.codeQualityScore}/10
- Correctness: ${codingRound.codeReview.correctness}/10
- Efficiency: ${codingRound.codeReview.efficiency}/10
- Readability: ${codingRound.codeReview.readability}/10

TASK:
Generate a comprehensive improvement plan with:
1. Skill gaps identification
2. Prioritized learning path
3. Specific resources and milestones
4. Timeline for improvement

OUTPUT FORMAT (JSON only, no markdown):
{
  "overallStrengths": [
    "Strong problem-solving skills demonstrated in coding round",
    "Excellent communication and stakeholder management"
  ],
  "overallWeaknesses": [
    "Needs improvement in system design concepts",
    "Limited experience with behavioral interview techniques"
  ],
  "improvementPlan": {
    "skillGaps": [
      {
        "skill": "Data Structures & Algorithms",
        "currentLevel": 6,
        "targetLevel": 9,
        "priority": "High",
        "reasoning": "Coding round showed gaps in advanced DSA concepts"
      },
      {
        "skill": "System Design",
        "currentLevel": 5,
        "targetLevel": 8,
        "priority": "High",
        "reasoning": "Technical round revealed weak understanding of scalability"
      },
      {
        "skill": "STAR Method for Behavioral Interviews",
        "currentLevel": 6,
        "targetLevel": 9,
        "priority": "Medium",
        "reasoning": "HR round answers lacked clear structure"
      }
    ],
    "learningPath": [
      {
        "phase": "30 Days - Foundation Building",
        "goals": [
          "Master arrays, strings, and hash maps",
          "Learn STAR method framework",
          "Study basic system design patterns"
        ],
        "resources": [
          "LeetCode Easy/Medium problems (50 problems)",
          "Grokking the Coding Interview",
          "System Design Primer on GitHub"
        ],
        "milestones": [
          "Solve 50 LeetCode problems",
          "Complete 5 mock behavioral interviews",
          "Design 3 basic systems (URL shortener, cache, etc.)"
        ]
      },
      {
        "phase": "60 Days - Intermediate Skills",
        "goals": [
          "Advanced DSA (trees, graphs, DP)",
          "Practice system design interviews",
          "Improve code quality and readability"
        ],
        "resources": [
          "LeetCode Medium/Hard problems",
          "Designing Data-Intensive Applications",
          "Clean Code by Robert Martin"
        ],
        "milestones": [
          "Solve 100 total problems",
          "Design 5 complex systems",
          "Complete 10 mock interviews"
        ]
      },
      {
        "phase": "90 Days - Interview Ready",
        "goals": [
          "Master advanced algorithms",
          "Confident in system design discussions",
          "Strong behavioral interview skills"
        ],
        "resources": [
          "Company-specific interview prep",
          "Pramp/Interviewing.io for mocks",
          "Behavioral interview coaching"
        ],
        "milestones": [
          "Pass 3 mock technical interviews",
          "Design 10 real-world systems",
          "Record and review 5 behavioral answers"
        ]
      }
    ],
    "recommendedCourses": [
      "AlgoExpert - Complete DSA Course",
      "Educative - Grokking the System Design Interview",
      "Udemy - Mastering Behavioral Interviews"
    ],
    "estimatedTimeToReady": "90 days with consistent practice"
  }
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.
`;

        logger.info('Generating improvement plan with AI...');

        // Try Gemini first
        try {
            const result = await geminiClient.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid JSON from Gemini');

            const plan = JSON.parse(jsonMatch[0]);
            logger.info('✅ Improvement plan generated via Gemini');
            return plan;

        } catch (geminiError) {
            logger.warn(`Gemini failed, falling back to OpenAI: ${geminiError.message}`);

            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a career development coach creating personalized improvement plans for interview candidates.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2500,
                response_format: { type: "json_object" }
            });

            const plan = JSON.parse(completion.choices[0].message.content);
            logger.info('✅ Improvement plan generated via OpenAI');
            return plan;
        }

    } catch (error) {
        logger.error('❌ Failed to generate improvement plan:', error);

        // Fallback to basic plan
        return {
            overallStrengths: ["Completed all interview rounds"],
            overallWeaknesses: ["Needs improvement across multiple areas"],
            improvementPlan: {
                skillGaps: [
                    {
                        skill: "Technical Skills",
                        currentLevel: Math.round(technicalRound.averageScore),
                        targetLevel: 9,
                        priority: "High",
                        reasoning: "Focus on core technical concepts"
                    }
                ],
                learningPath: [
                    {
                        phase: "90 Days",
                        goals: ["Improve technical and soft skills"],
                        resources: ["LeetCode", "System Design resources", "Mock interviews"],
                        milestones: ["Practice regularly", "Track progress"]
                    }
                ],
                recommendedCourses: ["AlgoExpert", "Grokking the System Design Interview"],
                estimatedTimeToReady: "90 days"
            }
        };
    }
}

/**
 * Generate Complete Hiring Report
 */
async function generateHiringReport(interview) {
    try {
        logger.info(`Generating hiring report for interview ${interview._id}`);

        const technicalRound = interview.technicalRound;
        const hrRound = interview.hrRound;
        const codingRound = interview.codingRound;

        // Calculate overall score
        const overallScore = calculateOverallScore(
            technicalRound.totalScore,
            hrRound.totalScore,
            codingRound.finalScore
        );

        // Determine hiring decision
        const decision = getHiringDecision(overallScore);

        // Generate improvement plan
        const improvementData = await generateImprovementPlan({
            resume: interview.resumeId,
            role: interview.role,
            technicalRound,
            hrRound,
            codingRound,
            overallScore,
            hiringDecision: decision.decision
        });

        // Compile final report
        const report = {
            interviewId: interview._id,
            candidateName: interview.resumeId.parsedData?.personalInfo?.name || 'Candidate',
            role: interview.role,
            difficulty: interview.difficulty,

            // Scores
            scores: {
                technical: technicalRound.totalScore,
                hr: hrRound.totalScore,
                coding: codingRound.finalScore,
                overall: overallScore
            },

            // Decision
            hiringDecision: decision.decision,
            probability: decision.probability,
            roleReadiness: decision.roleReadiness,

            // Round Summaries
            roundSummaries: {
                technical: {
                    questionsAnswered: technicalRound.answeredQuestions,
                    averageScore: technicalRound.averageScore,
                    scoreBreakdown: technicalRound.scoreBreakdown
                },
                hr: {
                    questionsAnswered: hrRound.answeredQuestions,
                    communicationSkills: hrRound.communicationSkills,
                    cultureFit: hrRound.cultureFit,
                    leadershipPotential: hrRound.leadershipPotential,
                    personalityTraits: hrRound.personalityTraits
                },
                coding: {
                    problemTitle: codingRound.problem.title,
                    difficulty: codingRound.problem.difficulty,
                    testPassRate: codingRound.testResults.testPassRate,
                    codeQuality: codingRound.codeQualityScore,
                    timeComplexity: codingRound.codeReview.timeComplexity,
                    spaceComplexity: codingRound.codeReview.spaceComplexity
                }
            },

            // Strengths & Weaknesses
            overallStrengths: improvementData.overallStrengths,
            overallWeaknesses: improvementData.overallWeaknesses,

            // Improvement Plan
            improvementPlan: improvementData.improvementPlan,

            // Metadata
            generatedAt: new Date(),
            interviewDuration: {
                technical: technicalRound.duration,
                hr: hrRound.duration,
                coding: codingRound.duration,
                total: (technicalRound.duration || 0) + (hrRound.duration || 0) + (codingRound.duration || 0)
            }
        };

        logger.info(`✅ Hiring report generated: ${decision.decision} (${overallScore}/100)`);
        return report;

    } catch (error) {
        logger.error('❌ Failed to generate hiring report:', error);
        throw new Error(`Report generation failed: ${error.message}`);
    }
}

module.exports = {
    calculateOverallScore,
    getHiringDecision,
    generateImprovementPlan,
    generateHiringReport
};
