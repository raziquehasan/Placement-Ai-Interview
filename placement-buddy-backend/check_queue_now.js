require('dotenv').config();
const { Queue } = require('bullmq');
const redisConnection = require('./src/config/redis');

async function checkQueue() {
    console.log('Connecting to Redis...');
    const queue = new Queue('resume-parsing', { connection: redisConnection });

    try {
        const counts = await queue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
        console.log('Job Counts:', JSON.stringify(counts, null, 2));

        const activeJobs = await queue.getJobs(['active']);
        if (activeJobs.length > 0) {
            console.log(`\nActive Jobs (${activeJobs.length}):`);
            activeJobs.forEach(job => {
                console.log(`- Job ID: ${job.id}, Data: ${JSON.stringify(job.data.resumeId)}`);
            });
        }

        const waitJobs = await queue.getJobs(['wait']);
        if (waitJobs.length > 0) {
            console.log(`\nWaiting Jobs (${waitJobs.length}):`);
            waitJobs.forEach(job => {
                console.log(`- Job ID: ${job.id}, Data: ${JSON.stringify(job.data.resumeId)}`);
            });
        }

    } catch (error) {
        console.error('Error checking queue:', error);
    } finally {
        await queue.close();
        process.exit();
    }
}

checkQueue();
