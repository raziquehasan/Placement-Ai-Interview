/**
 * Test script to verify OpenAI API integration
 * Run: node test_openai.js
 */

require('dotenv').config();
const openai = require('./src/utils/openaiClient');

async function testOpenAI() {
    try {
        console.log('🔍 Testing OpenAI API connection...\n');

        // Test with a simple chat completion
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant for interview preparation."
                },
                {
                    role: "user",
                    content: "Generate one technical interview question for a React developer."
                }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        console.log('✅ OpenAI API Connection Successful!\n');
        console.log('📝 Sample Response:');
        console.log(response.choices[0].message.content);
        console.log('\n✨ OpenAI integration is working correctly!');

    } catch (error) {
        console.error('❌ OpenAI API Test Failed:');
        console.error('Error:', error.message);

        if (error.code === 'invalid_api_key') {
            console.error('\n⚠️ Please check your OPENAI_API_KEY in the .env file');
        }
    }
}

// Run the test
testOpenAI();
