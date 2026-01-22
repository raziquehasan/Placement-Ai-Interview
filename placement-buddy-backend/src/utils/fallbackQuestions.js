/**
 * Fallback Questions - Used when AI APIs are unavailable
 * Provides diverse, role-specific questions instead of repeating the same one
 */

const fallbackTechnicalQuestions = {
    'Core CS': [
        {
            questionText: "Explain the difference between process and thread. When would you use one over the other?",
            expectedAnswer: "Processes have separate memory space, threads share memory. Use processes for isolation, threads for lightweight concurrency.",
            evaluationRubric: [
                { point: "Understanding of memory isolation", weight: 0.4 },
                { point: "Practical use cases", weight: 0.3 },
                { point: "Performance considerations", weight: 0.3 }
            ]
        },
        {
            questionText: "What is the difference between stack and heap memory? How does garbage collection work?",
            expectedAnswer: "Stack is for local variables (LIFO), heap for dynamic allocation. GC automatically reclaims unused heap memory.",
            evaluationRubric: [
                { point: "Memory allocation understanding", weight: 0.4 },
                { point: "GC mechanism explanation", weight: 0.4 },
                { point: "Clarity of explanation", weight: 0.2 }
            ]
        },
        {
            questionText: "Explain how HTTP works. What happens when you type a URL in the browser?",
            expectedAnswer: "DNS lookup, TCP connection, HTTP request, server processing, HTTP response, rendering.",
            evaluationRubric: [
                { point: "Complete flow understanding", weight: 0.5 },
                { point: "Technical accuracy", weight: 0.3 },
                { point: "Level of detail", weight: 0.2 }
            ]
        }
    ],
    'DSA': [
        {
            questionText: "Explain the time complexity of common sorting algorithms. When would you use QuickSort vs MergeSort?",
            expectedAnswer: "QuickSort: O(n log n) average, O(n²) worst. MergeSort: O(n log n) guaranteed. Use MergeSort for stability, QuickSort for in-place sorting.",
            evaluationRubric: [
                { point: "Time complexity knowledge", weight: 0.4 },
                { point: "Trade-offs understanding", weight: 0.4 },
                { point: "Practical application", weight: 0.2 }
            ]
        },
        {
            questionText: "How would you detect a cycle in a linked list? Explain the algorithm and its complexity.",
            expectedAnswer: "Floyd's cycle detection (tortoise and hare). Two pointers at different speeds. O(n) time, O(1) space.",
            evaluationRubric: [
                { point: "Algorithm correctness", weight: 0.5 },
                { point: "Complexity analysis", weight: 0.3 },
                { point: "Clear explanation", weight: 0.2 }
            ]
        },
        {
            questionText: "What is a hash table? How do you handle collisions? What's the time complexity?",
            expectedAnswer: "Key-value data structure using hash function. Collisions handled via chaining or open addressing. O(1) average lookup.",
            evaluationRubric: [
                { point: "Hash table understanding", weight: 0.4 },
                { point: "Collision resolution methods", weight: 0.4 },
                { point: "Complexity analysis", weight: 0.2 }
            ]
        }
    ],
    'System Design': [
        {
            questionText: "How would you design a URL shortener like bit.ly? Discuss the database schema and scaling strategy.",
            expectedAnswer: "Hash-based short URL generation, database with URL mappings, caching layer, horizontal scaling with sharding.",
            evaluationRubric: [
                { point: "System architecture", weight: 0.4 },
                { point: "Scalability considerations", weight: 0.4 },
                { point: "Database design", weight: 0.2 }
            ]
        },
        {
            questionText: "Explain the CAP theorem and its implications for distributed systems.",
            expectedAnswer: "Consistency, Availability, Partition tolerance - can only guarantee 2 of 3. Trade-offs based on use case.",
            evaluationRubric: [
                { point: "CAP theorem understanding", weight: 0.5 },
                { point: "Real-world examples", weight: 0.3 },
                { point: "Trade-off analysis", weight: 0.2 }
            ]
        }
    ],
    'Framework': [
        {
            questionText: "Explain the component lifecycle in React. What are useEffect cleanup functions used for?",
            expectedAnswer: "Mount, update, unmount phases. Cleanup functions prevent memory leaks by cleaning up subscriptions/timers.",
            evaluationRubric: [
                { point: "Lifecycle understanding", weight: 0.4 },
                { point: "useEffect knowledge", weight: 0.4 },
                { point: "Best practices", weight: 0.2 }
            ]
        },
        {
            questionText: "What is middleware in Express.js? How does the request-response cycle work?",
            expectedAnswer: "Functions with access to req, res, next. Execute in order, can modify request/response or end cycle.",
            evaluationRubric: [
                { point: "Middleware concept", weight: 0.4 },
                { point: "Request flow understanding", weight: 0.4 },
                { point: "Practical examples", weight: 0.2 }
            ]
        }
    ],
    'Projects': [
        {
            questionText: "Tell me about a challenging technical problem you solved in a recent project. What was your approach?",
            expectedAnswer: "Specific problem, solution approach, technologies used, outcome achieved.",
            evaluationRubric: [
                { point: "Problem complexity", weight: 0.4 },
                { point: "Solution approach", weight: 0.4 },
                { point: "Communication clarity", weight: 0.2 }
            ]
        },
        {
            questionText: "How do you ensure code quality in your projects? What testing strategies do you use?",
            expectedAnswer: "Unit tests, integration tests, code reviews, linting, CI/CD pipelines.",
            evaluationRubric: [
                { point: "Testing knowledge", weight: 0.4 },
                { point: "Quality practices", weight: 0.4 },
                { point: "Real-world application", weight: 0.2 }
            ]
        }
    ]
};

const fallbackHRQuestions = {
    'Behavioral': [
        {
            questionText: "Tell me about a time when you had to work under a tight deadline. How did you manage it?",
            evaluationFocus: ["Time Management", "Stress Handling", "Prioritization"]
        },
        {
            questionText: "Describe a situation where you had to learn a new technology quickly. What was your approach?",
            evaluationFocus: ["Learning Agility", "Adaptability", "Self-motivation"]
        }
    ],
    'Teamwork': [
        {
            questionText: "Tell me about a time when you had a disagreement with a team member. How did you resolve it?",
            evaluationFocus: ["Conflict Resolution", "Communication", "Collaboration"]
        },
        {
            questionText: "Describe a successful team project you worked on. What was your role?",
            evaluationFocus: ["Teamwork", "Leadership", "Contribution"]
        }
    ],
    'Leadership': [
        {
            questionText: "Have you ever had to take charge of a project? What challenges did you face?",
            evaluationFocus: ["Leadership", "Decision Making", "Responsibility"]
        }
    ],
    'Career Goals': [
        {
            questionText: "Where do you see yourself in 3-5 years? What are your career aspirations?",
            evaluationFocus: ["Ambition", "Career Planning", "Alignment with Role"]
        }
    ]
};

/**
 * Get a fallback question based on category and question number
 * Ensures variety by cycling through available questions
 */
function getFallbackTechnicalQuestion(category, questionNumber, difficulty) {
    const categoryQuestions = fallbackTechnicalQuestions[category] || fallbackTechnicalQuestions['Core CS'];
    const index = (questionNumber - 1) % categoryQuestions.length;
    const question = categoryQuestions[index];

    return {
        ...question,
        category,
        difficulty: difficulty || 'Medium'
    };
}

function getFallbackHRQuestion(category, questionNumber) {
    const categoryQuestions = fallbackHRQuestions[category] || fallbackHRQuestions['Behavioral'];
    const index = (questionNumber - 1) % categoryQuestions.length;
    const question = categoryQuestions[index];

    return {
        ...question,
        category
    };
}

module.exports = {
    getFallbackTechnicalQuestion,
    getFallbackHRQuestion,
    fallbackTechnicalQuestions,
    fallbackHRQuestions
};
