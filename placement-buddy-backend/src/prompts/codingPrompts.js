/**
 * Coding Interview Prompts - Phase 2.3
 * Templates for coding problem generation and code review
 */

/**
 * Generate a role-specific coding problem with test cases
 */
const generateCodingProblemPrompt = ({ role, difficulty, resumeSkills, questionNumber = 1 }) => `
You are a Senior Software Engineer creating a coding interview problem for a ${role} position.

CANDIDATE SKILLS (from resume):
${resumeSkills}

PROBLEM REQUIREMENTS:
- Difficulty: ${difficulty}
- Should align with ${role} responsibilities
- Must be solvable in 30-45 minutes
- Include clear problem statement, constraints, and examples

DIFFICULTY GUIDELINES:
- Easy: Basic data structures (arrays, strings, hash maps), simple logic
- Medium: Multiple data structures, algorithms (sorting, searching, two pointers)
- Hard: Advanced algorithms (dynamic programming, graphs, trees), optimization

PROBLEM STRUCTURE:
1. Clear problem statement
2. Input/output format specification
3. Constraints (time/space limits, input ranges)
4. 2 sample test cases with explanations
5. 5 hidden test cases for validation
6. Target time and space complexity

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Two Sum",
  "difficulty": "${difficulty}",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
  "inputFormat": "nums: number[], target: number",
  "outputFormat": "number[] (indices of the two numbers)",
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists"
  ],
  "sampleTestCases": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]"
    },
    {
      "input": "nums = [3,2,4], target = 6",
      "output": "[1,2]",
      "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "nums = [3,3], target = 6",
      "output": "[0,1]"
    },
    {
      "input": "nums = [-1,-2,-3,-4,-5], target = -8",
      "output": "[2,4]"
    },
    {
      "input": "nums = [1,2,3,4,5,6,7,8,9,10], target = 19",
      "output": "[8,9]"
    },
    {
      "input": "nums = [0,4,3,0], target = 0",
      "output": "[0,3]"
    },
    {
      "input": "nums = [1000000000,999999999], target = 1999999999",
      "output": "[0,1]"
    }
  ],
  "timeComplexityTarget": "O(n)",
  "spaceComplexityTarget": "O(n)",
  "hints": [
    "Think about using a hash map to store numbers you've seen",
    "For each number, check if target - number exists in your map"
  ]
}

IMPORTANT: 
- Ensure test cases are comprehensive and cover edge cases
- Hidden test cases should include: edge cases, large inputs, negative numbers, zeros
- Return ONLY valid JSON, no additional text or markdown formatting
`;

/**
 * Review and evaluate submitted code
 */
const reviewCodePrompt = ({ problem, code, language, testResults }) => `
You are a Senior Software Engineer reviewing a candidate's coding interview solution.

PROBLEM:
${JSON.stringify(problem, null, 2)}

CANDIDATE'S CODE (${language}):
${code}

TEST EXECUTION RESULTS:
${JSON.stringify(testResults, null, 2)}

EVALUATION CRITERIA (0-10 scale):

1. **Correctness** (0-10):
   - Does the code solve the problem correctly?
   - Are all test cases passing?
   - Are edge cases handled?

2. **Efficiency** (0-10):
   - Time complexity (compare to target: ${problem.timeComplexityTarget})
   - Space complexity (compare to target: ${problem.spaceComplexityTarget})
   - Is the solution optimized?

3. **Readability** (0-10):
   - Variable naming
   - Code structure and organization
   - Comments (if needed for complex logic)
   - Consistent formatting

4. **Edge Cases** (0-10):
   - Null/undefined handling
   - Empty input handling
   - Boundary conditions
   - Error handling

CODE REVIEW FOCUS:
- Identify bugs or logical errors
- Suggest improvements
- Highlight strengths
- Analyze time and space complexity
- Check for best practices

OUTPUT FORMAT (JSON only, no markdown):
{
  "correctness": 8,
  "efficiency": 7,
  "readability": 9,
  "edgeCases": 7,
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "strengths": [
    "Clean and readable code with good variable naming",
    "Efficient hash map approach",
    "Handles the main logic correctly"
  ],
  "improvements": [
    "Add input validation for null/undefined arrays",
    "Consider adding comments for the hash map logic",
    "Could optimize space by checking existence before insertion"
  ],
  "bugs": [],
  "feedback": "Well-structured solution with good time complexity. The hash map approach is optimal for this problem. Consider adding input validation to make the code more robust. Overall, this demonstrates strong problem-solving skills and clean coding practices.",
  "overallScore": 7.75
}

SCORING FORMULA:
overallScore = (correctness * 0.35) + (efficiency * 0.30) + (readability * 0.20) + (edgeCases * 0.15)

IMPORTANT: 
- Be constructive and professional
- Focus on both strengths and areas for improvement
- Return ONLY valid JSON, no additional text or markdown formatting
`;

/**
 * Calculate final coding round score
 */
const calculateCodingScore = (testPassRate, codeQualityScore) => {
    // Test Pass Rate: (passed / total) * 100
    // Code Quality Score: already 0-10 from AI review

    // Final Score = (Test Pass Rate * 0.5) + (Code Quality * 10 * 0.5)
    const finalScore = (testPassRate * 0.5) + (codeQualityScore * 10 * 0.5);

    return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
};

module.exports = {
    generateCodingProblemPrompt,
    reviewCodePrompt,
    calculateCodingScore
};
