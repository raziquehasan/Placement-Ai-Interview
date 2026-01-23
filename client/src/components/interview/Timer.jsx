/**
 * Timer Component - Phase 2.1
 * Tracks question and overall round time
 */

import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ onTimeUpdate, isPaused = false, label = "Time" }) => {
    const [seconds, setSeconds] = useState(0);
    const callbackRef = useRef(onTimeUpdate);

    // Update ref when callback changes
    useEffect(() => {
        callbackRef.current = onTimeUpdate;
    }, [onTimeUpdate]);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setSeconds(s => {
                const newTime = s + 1;
                // Call via ref to avoid dependency issues
                if (callbackRef.current) {
                    callbackRef.current(newTime);
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isWarning = seconds >= 240; // 4 minutes

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isWarning ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
            <Clock className="w-5 h-5" />
            <div>
                <div className="text-xs font-medium">{label}</div>
                <div className="text-lg font-bold">{formatTime(seconds)}</div>
            </div>
        </div>
    );
};

export default Timer;
