/**
 * Verification Script for Interview Start
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const interviewService = require('./src/services/interviewService');
const Resume = require('./src/models/Resume');
const User = require('./src/models/User');

async function verify() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const user = await User.findOne();
        if (!user) throw new Error('No user found');
        console.log('Using user:', user.email);

        const resume = await Resume.findOne({ userId: user._id });
        if (!resume) throw new Error('No resume found for user');
        console.log('Using resume:', resume.fileName);

        console.log('Starting interview...');
        const interview = await interviewService.startInterview(
            user._id,
            resume._id,
            'Software Engineer',
            'medium'
        );

        console.log('✅ Interview started successfully!');
        console.log('Questions:', JSON.stringify(interview.questions, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verify();
