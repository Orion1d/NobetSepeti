import React from 'react';

interface LogoProps {
  className?: string;
  size?: number; // Single size prop to maintain aspect ratio
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 150 
}) => {
  // Original aspect ratio: 150:50 = 3:1
  const aspectRatio = 3; // width:height = 3:1
  const width = size;
  const height = size / aspectRatio;

  return (
    <img
      src="/nöbetsepeti_logo.png"
      alt="Nöbet Sepeti"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo; 