import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const GlassCard = ({ children, className, hoverGlow = true, ...props }) => {
    return (
        <motion.div
            whileHover={hoverGlow ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={cn(
                "glass-card group relative p-6 rounded-2xl transition-all duration-300",
                hoverGlow && "hover:shadow-primary/20 hover:border-primary/30",
                className
            )}
            {...props}
        >
            {/* Subtle background glow effect if enabled */}
            {hoverGlow && (
                <div className="absolute inset-0 -z-10 bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            )}
            {children}
        </motion.div>
    );
};

export default GlassCard;
