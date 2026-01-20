/**
 * Swagger Configuration
 * OpenAPI documentation setup
 */

const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Placement Buddy API',
            version: '1.0.0',
            description: 'Production-grade AI Interview Simulator Backend API Documentation',
            contact: {
                name: 'Placement Buddy Team',
                email: 'support@placementbuddy.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${config.port}/api/v1`,
                description: 'Development server (v1)'
            },
            {
                url: `http://localhost:${config.port}/api`,
                description: 'Development server (legacy)'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '65a1b2c3d4e5f6g7h8i9j0k1' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        role: { type: 'string', enum: ['student', 'admin'], example: 'student' },
                        profile: {
                            type: 'object',
                            properties: {
                                phone: { type: 'string', example: '1234567890' },
                                college: { type: 'string', example: 'MIT' },
                                degree: { type: 'string', example: 'B.Tech Computer Science' },
                                year: { type: 'number', example: 3 }
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Resume: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        fileName: { type: 'string', example: 'resume.pdf' },
                        fileUrl: { type: 'string' },
                        parsedData: {
                            type: 'object',
                            properties: {
                                skills: { type: 'array', items: { type: 'string' } },
                                education: { type: 'array', items: { type: 'object' } },
                                experience: { type: 'array', items: { type: 'object' } }
                            }
                        },
                        uploadedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Interview: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        resumeId: { type: 'string' },
                        jobRole: { type: 'string', example: 'Software Engineer' },
                        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                        questions: { type: 'array', items: { type: 'object' } },
                        answers: { type: 'array', items: { type: 'object' } },
                        status: { type: 'string', enum: ['in-progress', 'completed', 'abandoned'] },
                        startedAt: { type: 'string', format: 'date-time' },
                        completedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Feedback: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        interviewId: { type: 'string' },
                        overallScore: { type: 'number', example: 75 },
                        strengths: { type: 'array', items: { type: 'string' } },
                        improvements: { type: 'array', items: { type: 'string' } },
                        detailedFeedback: { type: 'object' },
                        generatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                        errors: { type: 'array', items: { type: 'object' } }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
