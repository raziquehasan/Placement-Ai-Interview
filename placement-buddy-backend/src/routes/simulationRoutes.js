const express = require('express');
const router = express.Router();
const {
    getCompanies,
    startSession,
    getSession,
    startOA,
    submitOA,
    startPanelRound,
    submitPanelRound,
    finalizeSimulation,
    getRecruiterDashboard
} = require('../controllers/simulationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/companies', getCompanies);
router.post('/start', startSession);
router.get('/session/:id', getSession);
router.post('/session/:id/oa/start', startOA);
router.post('/session/:id/oa/submit', submitOA);
router.post('/session/:id/panel/start', startPanelRound);
router.post('/session/:id/panel/submit', submitPanelRound);
router.post('/session/:id/finalize', finalizeSimulation);

// Admin/Recruiter Routes
router.get('/admin/dashboard', getRecruiterDashboard);

module.exports = router;
