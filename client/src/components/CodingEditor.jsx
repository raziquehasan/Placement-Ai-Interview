import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code, Clock, CheckCircle, XCircle } from 'lucide-react';

const CodingEditor = ({ problem, onSubmit, isSubmitting }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [startTime] = useState(Date.now());

    // Language templates
    const templates = {
        javascript: `// ${problem?.title || 'Solve the problem'}\nfunction solution() {\n    // Write your code here\n    \n}\n\n// Test your solution\nconsole.log(solution());`,
        python: `# ${problem?.title || 'Solve the problem'}\ndef solution():\n    # Write your code here\n    pass\n\n# Test your solution\nprint(solution())`,
        java: `// ${problem?.title || 'Solve the problem'}\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}`,
        cpp: `// ${problem?.title || 'Solve the problem'}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`,
        c: `// ${problem?.title || 'Solve the problem'}\n#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`
    };

    useEffect(() => {
        if (problem) {
            setCode(templates[language]);
        }
    }, [language, problem]);

    const handleSubmit = () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        onSubmit({ code, language, timeSpent });
    };

    const getTimeSpent = () => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!problem) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Problem Statement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{problem.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {problem.difficulty}
                    </span>
                </div>

                <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>

                    {problem.inputFormat && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-900">Input Format:</h4>
                            <p className="text-gray-700">{problem.inputFormat}</p>
                        </div>
                    )}

                    {problem.outputFormat && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-900">Output Format:</h4>
                            <p className="text-gray-700">{problem.outputFormat}</p>
                        </div>
                    )}

                    {problem.constraints && problem.constraints.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-900">Constraints:</h4>
                            <ul className="list-disc list-inside text-gray-700">
                                {problem.constraints.map((constraint, idx) => (
                                    <li key={idx}>{constraint}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Sample Test Cases:</h4>
                            {problem.sampleTestCases.map((testCase, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-4 mb-3">
                                    <div className="mb-2">
                                        <span className="font-medium text-gray-700">Input:</span>
                                        <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                                            {testCase.input}
                                        </pre>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-medium text-gray-700">Output:</span>
                                        <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                                            {testCase.output}
                                        </pre>
                                    </div>
                                    {testCase.explanation && (
                                        <div>
                                            <span className="font-medium text-gray-700">Explanation:</span>
                                            <p className="mt-1 text-sm text-gray-600">{testCase.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {problem.hints && problem.hints.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-900">Hints:</h4>
                            <ul className="list-disc list-inside text-gray-700">
                                {problem.hints.map((hint, idx) => (
                                    <li key={idx}>{hint}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Code className="w-5 h-5 text-gray-600" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            disabled={isSubmitting}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="font-mono">{getTimeSpent()}</span>
                        </div>
                    </div>
                </div>

                <Editor
                    height="500px"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        readOnly: isSubmitting
                    }}
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !code.trim()}
                    className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 mr-2" />
                            Submit Code
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CodingEditor;
