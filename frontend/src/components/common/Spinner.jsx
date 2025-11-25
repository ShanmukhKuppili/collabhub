import React from 'react';

/**
 * Loading spinner component
 */
const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };
  
  return (
    <div
      className={`${sizes[size]} border-gray-200 border-t-primary-600 rounded-full animate-spin ${className}`}
    />
  );
};

/**
 * Full page loading component
 */
export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default Spinner;
