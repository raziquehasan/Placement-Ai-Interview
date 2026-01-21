const Card = ({ children, className = '', hover = false, ...props }) => {
    const baseStyles = 'bg-white rounded-lg shadow-soft border border-gray-100';
    const hoverStyles = hover ? 'hover:shadow-lg hover:border-gray-200 transition-all duration-200' : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Card;
