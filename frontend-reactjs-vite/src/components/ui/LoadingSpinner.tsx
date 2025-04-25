import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'var(--highlight)' 
}) => {
  // Determine size values
  const sizeMap = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3'
  };

  const sizeClass = sizeMap[size];

  return (
    <div className="flex justify-center items-center py-8">
      <div 
        className={`${sizeClass} rounded-full animate-spin`}
        style={{ 
          borderColor: `${color} transparent transparent transparent`,
          borderTopColor: color
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner; 