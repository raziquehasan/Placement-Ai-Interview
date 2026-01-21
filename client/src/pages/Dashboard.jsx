import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as resumeAPI from '../api/resume';
import * as interviewAPI from '../api/interview';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [resumes, setResumes] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [starting, setStarting] = useState(false);

    const [interviewForm, setInterviewForm] = useState({
        resumeId: '',
        jobRole: 'Software Engineer',
        difficulty: 'medium'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resumesArray, interviewsArray] = await Promise.all([
                    resumeAPI.getResumes(),
                    interviewAPI.getUserInterviews()
                ]);

                setResumes(resumesArray || []);
                setInterviews(interviewsArray || []);

                if (resumesArray?.length > 0) {
                    setInterviewForm(prev => ({ ...prev, resumeId: resumesArray[0]._id }));
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        try {
            setUploading(true);
            const result = await resumeAPI.uploadResume(file);
            alert(result.message || 'Resume uploaded and is being processed!');
            // Refresh resumes list after a short delay
            setTimeout(async () => {
                const updatedResumes = await resumeAPI.getResumes();
                setResumes(updatedResumes || []);
            }, 3000);
        } catch (err) {
            alert(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteResume = async (e, resumeId) => {
        e.stopPropagation(); // Prevent card selection when clicking delete
        if (!window.confirm('Are you sure you want to delete this resume?')) return;

        try {
            await resumeAPI.deleteResume(resumeId);
            setResumes(prev => prev.filter(r => r._id !== resumeId));
            if (interviewForm.resumeId === resumeId) {
                setInterviewForm(prev => ({ ...prev, resumeId: '' }));
            }
        } catch (err) {
            alert(err.message || 'Delete failed');
        }
    };

    const handleStartInterview = async (e) => {
        e.preventDefault();
        if (!interviewForm.resumeId) {
            alert('Please upload/select a resume first');
            return;
        }

        try {
            const selectedResume = resumes.find(r => r._id === interviewForm.resumeId);
            const atsScore = selectedResume?.parsedData?.atsAnalysis?.atsScore || 0;

            if (atsScore < 60) {
                alert(`Your resume ATS score is ${atsScore}%. You need at least 60% to unlock interviews. Please improve your resume first.`);
                navigate(`/resume-analysis/${interviewForm.resumeId}`);
                return;
            }

            setStarting(true);
            const interview = await interviewAPI.startInterview(interviewForm);
            navigate(`/interview/${interview._id}`);
        } catch (err) {
            alert(err.message || 'Failed to start interview');
        } finally {
            setStarting(false);
        }
    };

    if (loading) return <div className="p-8"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
                <p className="text-gray-600">Prepare for your next adventure with AI-powered interviews.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Actions */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Resume Upload */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Resumes</h2>
                        <div className="space-y-4">
                            {resumes.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-4">No resumes uploaded yet</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current.click()}
                                        loading={uploading}
                                    >
                                        Upload First Resume
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {resumes.map(resume => (
                                        <div
                                            key={resume._id}
                                            onClick={() => setInterviewForm(prev => ({ ...prev, resumeId: resume._id }))}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${interviewForm.resumeId === resume._id
                                                ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                                                : 'border-gray-100 bg-white hover:border-primary-200 hover:shadow-xs'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3 truncate">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${interviewForm.resumeId === resume._id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-400'}`}>
                                                    <span className="text-xl">📄</span>
                                                </div>
                                                <div className="truncate">
                                                    <p className={`text-sm font-semibold truncate ${interviewForm.resumeId === resume._id ? 'text-primary-900' : 'text-gray-700'}`}>
                                                        {resume.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Uploaded {new Date(resume.uploadedAt || Date.now()).toLocaleDateString()}
                                                    </p>
                                                    {resume.parsedData?.atsAnalysis && (
                                                        <div className="mt-1 flex items-center space-x-2">
                                                            {resume.parsedData.atsAnalysis.status === 'Pending' ? (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-amber-50 text-amber-600 animate-pulse">
                                                                    Analyzing...
                                                                </span>
                                                            ) : (
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${resume.parsedData.atsAnalysis.atsScore >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                    ATS: {resume.parsedData.atsAnalysis.atsScore}%
                                                                </span>
                                                            )}
                                                            <Link
                                                                to={`/resume-analysis/${resume._id}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-[10px] text-primary-600 hover:underline font-medium"
                                                            >
                                                                View Analysis
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => handleDeleteResume(e, resume._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group/delete"
                                                    title="Delete Resume"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                {interviewForm.resumeId === resume._id ? (
                                                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 border-2 border-gray-200 rounded-full group-hover:border-primary-300"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-2 border-dashed border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-500 hover:text-primary-600"
                                        onClick={() => fileInputRef.current.click()}
                                        loading={uploading}
                                    >
                                        + Add Another Resume
                                    </Button>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </Card>

                    {/* New Interview Form */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Start New Interview</h2>
                        <form onSubmit={handleStartInterview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Role</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={interviewForm.jobRole}
                                    onChange={(e) => setInterviewForm({ ...interviewForm, jobRole: e.target.value })}
                                >
                                    <option>Software Engineer</option>
                                    <option>Frontend Developer</option>
                                    <option>Backend Developer</option>
                                    <option>Full Stack Developer</option>
                                    <option>Data Scientist</option>
                                    <option>Product Manager</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['easy', 'medium', 'hard'].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            className={`py-2 text-sm font-medium rounded-lg border capitalize transition-all ${interviewForm.difficulty === level
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                                                }`}
                                            onClick={() => setInterviewForm({ ...interviewForm, difficulty: level })}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" variant="primary" className="w-full mt-2" loading={starting}>
                                Launch AI Interview
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-2">
                    <Card className="p-6 h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Interview History</h2>
                        {interviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl text-gray-400">⏱️</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No sessions yet</h3>
                                <p className="text-gray-500">Your practice sessions will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 italic text-sm text-gray-500 uppercase tracking-wider">
                                            <th className="pb-3 font-semibold">Job Role</th>
                                            <th className="pb-3 font-semibold">Date</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                            <th className="pb-3 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {interviews.map(interview => (
                                            <tr key={interview._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4">
                                                    <div className="font-medium text-gray-900">{interview.jobRole}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{interview.difficulty}</div>
                                                </td>
                                                <td className="py-4 text-sm text-gray-600">
                                                    {new Date(interview.startedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${interview.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (interview.status === 'completed') {
                                                                navigate(`/feedback/${interview._id}`);
                                                            } else {
                                                                navigate(`/interview/${interview._id}`);
                                                            }
                                                        }}
                                                    >
                                                        {interview.status === 'completed' ? 'View Results' : 'Resume'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
