import React from 'react';
import { cn } from '../../lib/utils';

const GradientText = ({ children, className, from = "from-primary-600", via = "via-secondary-500", to = "to-primary-500" }) => {
    return (
        <span className={cn(
            "bg-clip-text text-transparent bg-gradient-to-r",
            from, via, to,
            className
        )}>
            {children}
        </span>
    );
};

export default GradientText;
