const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h3>
            <p className="text-sm text-red-700 mb-6">{message || 'An unexpected error occurred. Please try again later.'}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
