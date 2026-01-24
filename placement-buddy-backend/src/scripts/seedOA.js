const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('../models/Question');

const seedOA = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected for OA seeding...');

        const questions = [
            // Aptitude
            {
                text: 'A train 120m long passes a pole in 6 seconds. What is its speed?',
                options: [
                    { id: 'a', text: '60 km/hr' },
                    { id: 'b', text: '72 km/hr' },
                    { id: 'c', text: '80 km/hr' },
                    { id: 'd', text: '90 km/hr' }
                ],
                correctOption: 'b',
                category: 'Aptitude',
                difficulty: 'Basic'
            },
            // DSA
            {
                text: 'What is the time complexity of searching in a Balanced Binary Search Tree?',
                options: [
                    { id: 'a', text: 'O(1)' },
                    { id: 'b', text: 'O(n)' },
                    { id: 'c', text: 'O(log n)' },
                    { id: 'd', text: 'O(n log n)' }
                ],
                correctOption: 'c',
                category: 'DSA',
                difficulty: 'Intermediate'
            },
            // Logic
            {
                text: 'If A is the son of B. C, B\'s sister has a son D and a daughter E. F is the maternal uncle of C. How is A related to D?',
                options: [
                    { id: 'a', text: 'Cousin' },
                    { id: 'b', text: 'Nephew' },
                    { id: 'c', text: 'Uncle' },
                    { id: 'd', text: 'Brother' }
                ],
                correctOption: 'a',
                category: 'Logic',
                difficulty: 'Intermediate'
            }
        ];

        await Question.deleteMany({ category: { $in: ['Aptitude', 'DSA', 'Logic'] } });
        await Question.insertMany(questions);

        console.log('✅ OA Questions seeded!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedOA();
