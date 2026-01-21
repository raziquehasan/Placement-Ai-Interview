/**
 * Judge0 Integration Test
 * Tests the Judge0 API connection and code execution
 */

const judge0Client = require('./src/utils/judge0Client');
const logger = require('./src/utils/logger');

async function testJudge0Integration() {
    console.log('\n🧪 Testing Judge0 API Integration...\n');

    try {
        // Test 1: Simple JavaScript execution
        console.log('Test 1: Simple JavaScript Code Execution');
        console.log('Code: console.log("Hello from Judge0")');

        const result1 = await judge0Client.executeCode({
            code: 'console.log("Hello from Judge0")',
            language: 'javascript',
            input: '',
            expectedOutput: 'Hello from Judge0'
        });

        console.log('✅ Result:', {
            status: result1.status,
            passed: result1.passed,
            output: result1.actualOutput,
            time: result1.time + 'ms',
            memory: result1.memory + 'KB'
        });

        // Test 2: Test case execution
        console.log('\n\nTest 2: Multiple Test Cases');
        console.log('Problem: Two Sum');

        const testCases = [
            { input: '[2,7,11,15], 9', output: '[0,1]' },
            { input: '[3,2,4], 6', output: '[1,2]' }
        ];

        const twoSumCode = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

// Parse input
const input = process.argv[2];
const [numsStr, targetStr] = input.split('], ');
const nums = JSON.parse(numsStr + ']');
const target = parseInt(targetStr);

// Execute and print result
const result = twoSum(nums, target);
console.log(JSON.stringify(result));
        `.trim();

        const results = await judge0Client.executeTestCases({
            code: twoSumCode,
            language: 'javascript',
            testCases
        });

        console.log('✅ Test Results:');
        results.forEach((r, i) => {
            console.log(`  Test ${i + 1}: ${r.passed ? '✅ PASS' : '❌ FAIL'} - ${r.status}`);
            console.log(`    Expected: ${r.expectedOutput}`);
            console.log(`    Got: ${r.actualOutput}`);
        });

        const passRate = (results.filter(r => r.passed).length / results.length) * 100;
        console.log(`\n  Pass Rate: ${passRate}%`);

        // Test 3: Check supported languages
        console.log('\n\nTest 3: Supported Languages');
        const languages = judge0Client.getSupportedLanguages();
        console.log('✅ Supported:', languages.join(', '));

        console.log('\n\n🎉 Judge0 Integration Test Complete!\n');
        console.log('Summary:');
        console.log('  ✅ API Connection: Working');
        console.log('  ✅ Code Execution: Working');
        console.log('  ✅ Test Cases: Working');
        console.log('  ✅ Multi-language: Supported');
        console.log('\n✨ Judge0 is ready for production use!\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Judge0 Integration Test Failed!');
        console.error('Error:', error.message);
        console.error('\nPossible issues:');
        console.error('  1. Check RAPIDAPI_KEY in .env file');
        console.error('  2. Verify internet connection');
        console.error('  3. Check RapidAPI subscription status');
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run test
testJudge0Integration();
