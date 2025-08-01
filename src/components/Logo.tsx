import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  width = 150, 
  height = 50 
}) => {
  return (
    <img
      src="/nöbetsepeti_logo.png"
      alt="Nöbet Sepeti"
      width={width}
      height={height}
      className={className}
    />
  );
};

export default Logo; 