/**
 * Judge0 Client - Code Execution Service
 * Handles code submission and execution via Judge0 API
 */

const axios = require('axios');
const logger = require('./logger');

// Language IDs for Judge0
const LANGUAGE_IDS = {
    javascript: 63,  // Node.js
    python: 71,      // Python 3
    java: 62,        // Java
    cpp: 54,         // C++ (GCC 9.2.0)
    c: 50            // C (GCC 9.2.0)
};

class Judge0Client {
    constructor() {
        this.apiKey = process.env.RAPIDAPI_KEY || '90eb202a8cmsh07336a904e045f9p140021jsn7ae924339754';
        this.apiHost = 'judge0-ce.p.rapidapi.com';
        this.baseURL = 'https://judge0-ce.p.rapidapi.com';
    }

    /**
     * Submit code for execution
     * @param {Object} params - Submission parameters
     * @returns {Promise<Object>} - Execution result
     */
    async executeCode({ code, language, input = '', expectedOutput = '' }) {
        try {
            const languageId = LANGUAGE_IDS[language] || LANGUAGE_IDS.javascript;

            logger.info(`Executing ${language} code via Judge0...`);

            const response = await axios.post(
                `${this.baseURL}/submissions?base64_encoded=false&wait=true`,
                {
                    language_id: languageId,
                    source_code: code,
                    stdin: input,
                    expected_output: expectedOutput
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'X-RapidAPI-Key': this.apiKey,
                        'X-RapidAPI-Host': this.apiHost
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            const result = response.data;

            // Parse result
            const executionResult = {
                stdout: result.stdout || '',
                stderr: result.stderr || '',
                status: this.getStatusDescription(result.status.id),
                statusId: result.status.id,
                time: result.time || 0,
                memory: result.memory || 0,
                compilationError: result.compile_output || null,
                runtimeError: result.stderr || null,
                passed: result.status.id === 3, // Status 3 = Accepted
                actualOutput: (result.stdout || '').trim(),
                expectedOutput: expectedOutput.trim()
            };

            logger.info(`✅ Code execution complete: ${executionResult.status}`);
            return executionResult;

        } catch (error) {
            logger.error('❌ Judge0 execution failed:', error.message);

            // Return error result
            return {
                stdout: '',
                stderr: error.message,
                status: 'Error',
                statusId: 0,
                time: 0,
                memory: 0,
                compilationError: null,
                runtimeError: error.message,
                passed: false,
                actualOutput: '',
                expectedOutput: expectedOutput
            };
        }
    }

    /**
     * Execute multiple test cases
     * @param {Object} params - Test execution parameters
     * @returns {Promise<Array>} - Array of test results
     */
    async executeTestCases({ code, language, testCases }) {
        const results = [];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            logger.info(`Running test case ${i + 1}/${testCases.length}...`);

            const result = await this.executeCode({
                code,
                language,
                input: testCase.input,
                expectedOutput: testCase.output
            });

            results.push({
                testCase: `Test ${i + 1}`,
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: result.actualOutput,
                passed: result.passed && result.actualOutput === testCase.output.trim(),
                executionTime: result.time,
                memory: result.memory,
                error: result.runtimeError || result.compilationError || null,
                status: result.status
            });

            // Small delay to avoid rate limiting
            await this.delay(500);
        }

        return results;
    }

    /**
     * Get human-readable status description
     */
    getStatusDescription(statusId) {
        const statuses = {
            1: 'In Queue',
            2: 'Processing',
            3: 'Accepted',
            4: 'Wrong Answer',
            5: 'Time Limit Exceeded',
            6: 'Compilation Error',
            7: 'Runtime Error (SIGSEGV)',
            8: 'Runtime Error (SIGXFSZ)',
            9: 'Runtime Error (SIGFPE)',
            10: 'Runtime Error (SIGABRT)',
            11: 'Runtime Error (NZEC)',
            12: 'Runtime Error (Other)',
            13: 'Internal Error',
            14: 'Exec Format Error'
        };

        return statuses[statusId] || 'Unknown';
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return Object.keys(LANGUAGE_IDS);
    }

    /**
     * Get language ID
     */
    getLanguageId(language) {
        return LANGUAGE_IDS[language] || LANGUAGE_IDS.javascript;
    }
}

// Export singleton instance
module.exports = new Judge0Client();
