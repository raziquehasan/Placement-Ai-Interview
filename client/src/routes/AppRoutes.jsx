import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Interview from '../pages/Interview';
import Feedback from '../pages/Feedback';
import ResumeAnalysis from '../pages/ResumeAnalysis';
import TechnicalRound from '../pages/TechnicalRound'; // Phase 2.1
import HRRound from '../pages/HRRound'; // Phase 2.2
import CodingRound from '../pages/CodingRound'; // Phase 2.3+
import InterviewResults from '../pages/InterviewResults'; // Phase 2.1
import HiringReport from '../pages/HiringReport'; // Phase 2.4
import SimulationDashboard from '../pages/SimulationDashboard'; // Phase 2.5
import SimulationJourney from '../pages/SimulationJourney'; // Phase 2.5
import OnlineAssessment from '../pages/OnlineAssessment'; // Phase 2.5
import SimulationInterview from '../pages/SimulationInterview'; // Phase 2.5
import SimulationReport from '../pages/SimulationReport'; // Phase 2.5
import RecruiterDashboard from '../pages/RecruiterDashboard'; // Phase 2.5
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();

    // Show nothing while checking authentication
    if (loading) {
        return null;
    }

    return (
        <Routes>
            {/* Public Routes - Redirect to dashboard if already logged in */}
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
            />
            <Route
                path="/home"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
            />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Phase 1: Legacy Interview Route */}
            <Route
                path="/interview/:id"
                element={
                    <ProtectedRoute>
                        <Interview />
                    </ProtectedRoute>
                }
            />

            {/* Phase 2.1: Technical Round */}
            <Route
                path="/interview/:id/technical"
                element={
                    <ProtectedRoute>
                        <TechnicalRound />
                    </ProtectedRoute>
                }
            />

            {/* Phase 2.1: Interview Results */}
            <Route
                path="/interview/:id/results"
                element={
                    <ProtectedRoute>
                        <InterviewResults />
                    </ProtectedRoute>
                }
            />

            {/* Phase 2.2: HR Round */}
            <Route
                path="/interview/:id/hr"
                element={
                    <ProtectedRoute>
                        <HRRound />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/interview/:id/coding"
                element={
                    <ProtectedRoute>
                        <CodingRound />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/resume-analysis/:id"
                element={
                    <ProtectedRoute>
                        <ResumeAnalysis />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/feedback/:id"
                element={
                    <ProtectedRoute>
                        <Feedback />
                    </ProtectedRoute>
                }
            />

            {/* Phase 2.5: Hiring Simulations */}
            <Route
                path="/simulation"
                element={
                    <ProtectedRoute>
                        <SimulationDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/simulation/:id/journey"
                element={
                    <ProtectedRoute>
                        <SimulationJourney />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/simulation/session/:id/oa"
                element={
                    <ProtectedRoute>
                        <OnlineAssessment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/simulation/session/:id/panel"
                element={
                    <ProtectedRoute>
                        <SimulationInterview />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/simulation/session/:id/report"
                element={
                    <ProtectedRoute>
                        <SimulationReport />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/simulation/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <RecruiterDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/report/:id"
                element={
                    <ProtectedRoute>
                        <HiringReport />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
