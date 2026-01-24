const mongoose = require('mongoose');
require('dotenv').config();
const Company = require('../models/Company');
const SimulationPipeline = require('../models/SimulationPipeline');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for seeding Phase 2...');

        // Clear existing Phase 2 data to avoid duplicates
        await Company.deleteMany({});
        await SimulationPipeline.deleteMany({});

        // 1. Google Blueprint
        const google = await Company.create({
            name: 'Google',
            category: 'Tech-Giant',
            difficultyCurve: [1.5, 1.8, 2.0, 2.2],
            weightage: { dsa: 60, design: 20, culture: 10, softSkills: 10 },
            attemptPolicy: { maxAttempts: 1, cooldownDays: 180 },
            featureFlags: { enableOA: true, enableVideo: true, enablePanel: true },
            version: '2025.1',
            description: 'Focus on DSA, Problem Solving and Googlyness.'
        });

        await SimulationPipeline.create({
            companyId: google._id,
            version: '2025.1',
            difficultyScale: 'Entry',
            rounds: [
                { type: 'OA', title: 'Snapshot Assessment', order: 1, shortlistThreshold: 80 },
                { type: 'Technical', title: 'Coding Round 1', order: 2, shortlistThreshold: 75 },
                { type: 'Technical', title: 'Coding Round 2', order: 3, shortlistThreshold: 75 },
                { type: 'HR', title: 'Googleyness & Leadership', order: 4, shortlistThreshold: 70 }
            ]
        });

        // 2. Amazon Blueprint
        const amazon = await Company.create({
            name: 'Amazon',
            category: 'Tech-Giant',
            difficultyCurve: [1.2, 1.5, 1.8, 1.8],
            weightage: { dsa: 40, design: 20, culture: 30, softSkills: 10 },
            attemptPolicy: { maxAttempts: 1, cooldownDays: 180 },
            featureFlags: { enableOA: true, enableVideo: true, enablePanel: true },
            version: '2025.1',
            description: 'Leadership Principles are as important as Coding.'
        });

        await SimulationPipeline.create({
            companyId: amazon._id,
            version: '2025.1',
            difficultyScale: 'Entry',
            rounds: [
                { type: 'OA', title: 'Online Assessment', order: 1, shortlistThreshold: 70 },
                { type: 'Technical', title: 'Technical Interview 1', order: 2, shortlistThreshold: 70 },
                { type: 'Technical', title: 'Technical Interview 2', order: 3, shortlistThreshold: 70 },
                { type: 'HR', title: 'LP & Bar Raiser Round', order: 4, shortlistThreshold: 80 }
            ]
        });

        // 3. TCS Blueprint
        const tcs = await Company.create({
            name: 'TCS',
            category: 'Service-Based',
            difficultyCurve: [0.8, 1.0, 1.0],
            weightage: { dsa: 30, design: 10, culture: 30, softSkills: 30 },
            attemptPolicy: { maxAttempts: 3, cooldownDays: 90 },
            featureFlags: { enableOA: true, enableVideo: false, enablePanel: false },
            version: '2025.1',
            description: 'Focus on Aptitude, Basics of Engineering and Communication.'
        });

        await SimulationPipeline.create({
            companyId: tcs._id,
            version: '2025.1',
            difficultyScale: 'Entry',
            rounds: [
                { type: 'OA', title: 'NQT Assessment', order: 1, shortlistThreshold: 60 },
                { type: 'Technical', title: 'Basics & Projects', order: 2, shortlistThreshold: 50 },
                { type: 'HR', title: 'Final HR Conversation', order: 3, shortlistThreshold: 50 }
            ]
        });

        console.log('✅ Phase 2 Seeding Complete (Google, Amazon, TCS)');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
