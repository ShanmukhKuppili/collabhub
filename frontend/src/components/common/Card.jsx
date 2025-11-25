import React from 'react';

/**
 * Card component for content containers
 */
const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = true,
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-shadow duration-200';
  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : 'hover:shadow-md';
  const paddingClasses = padding ? 'p-6' : '';
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${paddingClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
