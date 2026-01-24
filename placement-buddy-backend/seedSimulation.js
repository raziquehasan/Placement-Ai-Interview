const mongoose = require('mongoose');
const Company = require('./src/models/Company');
const SimulationPipeline = require('./src/models/SimulationPipeline');
const Question = require('./src/models/Question');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        // 1. Clear existing
        await Company.deleteMany({});
        await SimulationPipeline.deleteMany({});
        await Question.deleteMany({});

        // 2. Create Companies
        const google = await Company.create({
            name: 'Google',
            category: 'Tech-Giant',
            description: 'Focuses on DSA, System Design, and Googliness.',
            difficultyLevel: 'Hard',
            weightage: { dsa: 50, design: 20, culture: 30, softSkills: 0 }
        });

        const amazon = await Company.create({
            name: 'Amazon',
            category: 'Unicorn',
            description: 'Focused on Leadership Principles and Scalable Systems.',
            difficultyLevel: 'Medium-Hard',
            weightage: { dsa: 40, design: 30, culture: 20, softSkills: 10 }
        });

        const tcs = await Company.create({
            name: 'TCS',
            category: 'Service-Based',
            description: 'General Aptitude and Core Technical concepts.',
            difficultyLevel: 'Easy',
            weightage: { dsa: 20, design: 10, culture: 30, softSkills: 40 }
        });

        // 3. Create Pipelines
        await SimulationPipeline.create({
            companyId: google._id,
            version: '2024.Q1',
            difficultyScale: 'Entry',
            rounds: [
                { title: 'OA: Analytical Reasoning', type: 'OA', order: 1, shortlistThreshold: 80, config: { duration: 30 } },
                { title: 'Tech Round: Data Structures', type: 'Technical', order: 2, shortlistThreshold: 70, config: { difficulty: 'Hard' } },
                { title: 'Panel: System Design & Culture', type: 'Panel', order: 3, shortlistThreshold: 60, config: { agentPersonas: ['lead', 'behavioral'] } }
            ]
        });

        await SimulationPipeline.create({
            companyId: amazon._id,
            version: '2024.V2',
            difficultyScale: 'Entry',
            rounds: [
                { title: 'OA: Code Debugging', type: 'OA', order: 1, shortlistThreshold: 75, config: { duration: 45 } },
                { title: 'Panel: LP & Coding', type: 'Panel', order: 2, shortlistThreshold: 70, config: { agentPersonas: ['behavioral', 'lead'] } }
            ]
        });

        // 4. Create Questions for OA
        await Question.create([
            {
                text: 'What is the time complexity of searching in a Balanced Binary Search Tree?',
                category: 'DSA',
                difficulty: 'Intermediate',
                options: [
                    { id: 'a', text: 'O(n)' },
                    { id: 'b', text: 'O(log n)' },
                    { id: 'c', text: 'O(1)' },
                    { id: 'd', text: 'O(n^2)' }
                ],
                correctOption: 'b',
                explanation: 'Balanced BSTs like AVL or Red-Black trees ensure O(log n) height.'
            },
            {
                text: 'Which principle is part of Amazon\'s Leadership Principles?',
                category: 'Logic',
                difficulty: 'Basic',
                options: [
                    { id: 'a', text: 'Move Fast and Break Things' },
                    { id: 'b', text: 'Customer Obsession' },
                    { id: 'c', text: 'Don\'t be Evil' },
                    { id: 'd', text: 'Radical Candor' }
                ],
                correctOption: 'b',
                explanation: 'Customer Obsession is the first Amazon Leadership Principle.'
            }
        ]);

        console.log('✅ Seeding Complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
