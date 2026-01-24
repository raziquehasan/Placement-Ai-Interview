const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api/v1';
const TEST_TOKEN = 'YOUR_JWT_HERE'; // Manual interaction usually required for token or use a test account

const runE2ETest = async () => {
    try {
        console.log('🚀 Starting Phase 2 E2E Pipeline Test...');

        // 1. Fetch Companies
        const companies = await axios.get(`${BASE_URL}/simulation/companies`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        const google = companies.data.data.find(c => c.name === 'Google');
        console.log(`✅ Found Company: ${google.name}`);

        // 2. Start Session
        const sessionRes = await axios.post(`${BASE_URL}/simulation/start`, {
            companyId: google._id,
            mode: 'Realistic'
        }, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        const sessionId = sessionRes.data.data._id;
        console.log(`✅ Started Session: ${sessionId}`);

        // 3. Submit OA (Mocking high performance)
        const qRes = await axios.post(`${BASE_URL}/simulation/session/${sessionId}/oa/start`, {}, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        const responses = qRes.data.data.questions.map(q => ({
            questionId: q._id,
            selectedOption: 'b' // Assuming 'b' is correct for our seed data
        }));

        await axios.post(`${BASE_URL}/simulation/session/${sessionId}/oa/submit`, { responses }, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ OA Submitted.');

        // 4. Panel Interview (Mocking technical response)
        await axios.post(`${BASE_URL}/simulation/session/${sessionId}/panel/start`, {}, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        const panelRes = await axios.post(`${BASE_URL}/simulation/session/${sessionId}/panel/submit`, {
            response: {
                question: "Explain database concurrency.",
                answer: "I use ACID properties and optimistic locking with version columns to ensure data integrity during high-concurrency writes."
            }
        }, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log(`✅ Panel Shortlisted: ${panelRes.data.data.passed}`);

        // 5. Finalize
        const finalRes = await axios.post(`${BASE_URL}/simulation/session/${sessionId}/finalize`, {}, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Simulation Finalized.');
        console.log('📊 Final Probability:', finalRes.data.data.probability.value + '%');
        console.log('🎓 Mentor Summary:', finalRes.data.data.mentorPlan.summary);

        console.log('\n✨ E2E PIPELINE TEST PASSED! ✨');

    } catch (err) {
        console.error('❌ E2E Test Failed:', err.response?.data || err.message);
    }
};

// Note: This script requires a valid TEST_TOKEN. 
// For automated CI, we would use a service account token.
console.log('Please update TEST_TOKEN in the script to run.');
// runE2ETest();
