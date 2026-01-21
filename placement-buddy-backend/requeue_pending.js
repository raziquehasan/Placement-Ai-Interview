const mongoose = require('mongoose');
const { Queue } = require('bullmq');
require('dotenv').config();
const redisConnection = require('./src/config/redis');

async function requeuePending() {
    await mongoose.connect(process.env.MONGO_URI);
    const Resume = require('./src/models/Resume');
    const resumeQueue = new Queue('resume-parsing', { connection: redisConnection });

    const pendingResumes = await Resume.find({ 'parsedData.atsAnalysis.status': 'Pending' });
    console.log(`Found ${pendingResumes.length} pending resumes to re-queue.`);

    for (const resume of pendingResumes) {
        console.log(`Re-queuing resume: ${resume._id} (${resume.fileName})`);

        // Construct the file object expected by the worker
        // Note: Multer info might be lost if we don't store it, 
        // but we have fileUrl which is the path.
        const fileData = {
            path: resume.fileUrl,
            originalname: resume.fileName
        };

        await resumeQueue.add('parse-resume', {
            resumeId: resume._id,
            file: fileData,
            userId: resume.userId
        });
    }

    console.log('All pending resumes re-queued.');
    await resumeQueue.close();
    process.exit();
}

requeuePending();
