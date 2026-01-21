/**
 * Phase 2.1 Technical Interview System - E2E Test Script
 * Tests complete interview flow from creation to results
 */

const API_BASE = 'http://localhost:5000/api/v1';

// Test configuration
const TEST_CONFIG = {
    // You'll need to get these from your system
    authToken: 'YOUR_JWT_TOKEN', // Get from login
    resumeId: 'YOUR_RESUME_ID',  // Resume with ATS >= 60
    role: 'Full Stack Developer',
    difficulty: 'Medium'
};

/**
 * Test 1: Create Interview
 */
async function testCreateInterview() {
    console.log('\n=== Test 1: Create Interview ===');

    const response = await fetch(`${API_BASE}/interviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`
        },
        body: JSON.stringify({
            resumeId: TEST_CONFIG.resumeId,
            role: TEST_CONFIG.role,
            difficulty: TEST_CONFIG.difficulty
        })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
        console.log('✅ Interview created successfully!');
        return data.data.interview.id;
    } else {
        console.log('❌ Failed to create interview');
        return null;
    }
}

/**
 * Test 2: Start Technical Round
 */
async function testStartTechnicalRound(interviewId) {
    console.log('\n=== Test 2: Start Technical Round ===');

    const response = await fetch(`${API_BASE}/interviews/${interviewId}/technical/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`
        }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
        console.log('✅ Technical round started!');
        console.log('First question:', data.data.firstQuestion.questionText);
        return data.data;
    } else {
        console.log('❌ Failed to start technical round');
        return null;
    }
}

/**
 * Test 3: Submit Answer
 */
async function testSubmitAnswer(interviewId, questionId) {
    console.log('\n=== Test 3: Submit Answer ===');

    const sampleAnswer = "A process is an instance of a program in execution. It has its own memory space and resources. A thread is a lightweight unit of execution within a process. Multiple threads can exist within a single process and share the same memory space. The main difference is that processes are isolated while threads share resources, making threads more efficient for concurrent operations.";

    const response = await fetch(`${API_BASE}/interviews/${interviewId}/technical/answer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`
        },
        body: JSON.stringify({
            questionId,
            answer: sampleAnswer,
            timeSpent: 120 // 2 minutes
        })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
        console.log('✅ Answer submitted!');
        if (data.data.nextQuestion) {
            console.log('Next question:', data.data.nextQuestion.questionText);
        }
        return data.data;
    } else {
        console.log('❌ Failed to submit answer');
        return null;
    }
}

/**
 * Test 4: Poll for Evaluation
 */
async function testGetEvaluation(interviewId, questionId, maxAttempts = 10) {
    console.log('\n=== Test 4: Get Evaluation (Polling) ===');

    for (let i = 0; i < maxAttempts; i++) {
        console.log(`Polling attempt ${i + 1}/${maxAttempts}...`);

        const response = await fetch(`${API_BASE}/interviews/${interviewId}/technical/evaluation/${questionId}`, {
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.authToken}`
            }
        });

        const data = await response.json();

        if (data.data.evaluated) {
            console.log('✅ Evaluation received!');
            console.log('Score:', data.data.evaluation.score, '/10');
            console.log('Feedback:', data.data.evaluation.feedback);
            console.log('Strengths:', data.data.evaluation.strengths);
            console.log('Weaknesses:', data.data.evaluation.weaknesses);
            return data.data.evaluation;
        }

        console.log('Still evaluating...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s
    }

    console.log('❌ Evaluation timeout');
    return null;
}

/**
 * Test 5: Get Technical Status
 */
async function testGetTechnicalStatus(interviewId) {
    console.log('\n=== Test 5: Get Technical Status ===');

    const response = await fetch(`${API_BASE}/interviews/${interviewId}/technical/status`, {
        headers: {
            'Authorization': `Bearer ${TEST_CONFIG.authToken}`
        }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
        console.log('✅ Status retrieved!');
        console.log('Progress:', data.data.progress);
        console.log('Scores:', data.data.scores);
        return data.data;
    } else {
        console.log('❌ Failed to get status');
        return null;
    }
}

/**
 * Run Complete E2E Test
 */
async function runCompleteTest() {
    console.log('🚀 Starting Phase 2.1 E2E Test');
    console.log('=====================================');

    try {
        // Test 1: Create Interview
        const interviewId = await testCreateInterview();
        if (!interviewId) process.exit(1);

        // Test 2: Start Technical Round
        const roundData = await testStartTechnicalRound(interviewId);
        if (!roundData) process.exit(1);

        const firstQuestionId = roundData.firstQuestion.questionId;

        // Test 3: Submit Answer
        const submitResult = await testSubmitAnswer(interviewId, firstQuestionId);
        if (!submitResult) process.exit(1);

        // Test 4: Poll for Evaluation
        const evaluation = await testGetEvaluation(interviewId, firstQuestionId);
        if (!evaluation) console.log('⚠️ Evaluation polling timed out (check BullMQ worker)');

        // Test 5: Get Status
        await testGetTechnicalStatus(interviewId);

        console.log('\n=====================================');
        console.log('✅ All tests completed successfully!');
        console.log('=====================================');
        console.log('\n📝 Manual Testing URLs:');
        console.log(`Frontend: http://localhost:5173`);
        console.log(`Technical Round: http://localhost:5173/interview/${interviewId}/technical`);
        console.log(`Results: http://localhost:5173/interview/${interviewId}/results`);

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        process.exit(1);
    }
}

// Instructions
console.log(`
📋 SETUP INSTRUCTIONS:

1. Get your JWT token:
   - Login at: http://localhost:5173/login
   - Open DevTools → Application → Local Storage
   - Copy the 'token' value
   
2. Get your Resume ID:
   - Upload a resume with ATS >= 60
   - Check the API response or database
   
3. Update TEST_CONFIG in this file:
   - Set authToken
   - Set resumeId
   
4. Run: node test_interview_e2e.js

Press any key to continue or Ctrl+C to edit config...
`);

// Uncomment to auto-run (after config is set)
// runCompleteTest();
