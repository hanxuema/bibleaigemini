import React from 'react';

interface LogoProps {
  className?: string;
  fill?: string;
  stroke?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-8 h-8", 
  fill = "currentColor",
  stroke = "currentColor"
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Background shape (Optional usage depending on context, keeping transparent for main logo) */}
      
      {/* Open Book Outline */}
      <path 
        d="M15 30C15 30 30 30 50 22C70 30 85 30 85 30V85C85 85 70 85 50 77C30 85 15 85 15 85V30Z" 
        stroke={stroke} 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Center Spine */}
      <path 
        d="M50 22V77" 
        stroke={stroke} 
        strokeWidth="6" 
        strokeLinecap="round"
      />

      {/* The Cross / Light Symbol in the center */}
      <path 
        d="M50 35V65" 
        stroke={stroke} 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      <path 
        d="M38 48H62" 
        stroke={stroke} 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export const LogoIcon: React.FC<LogoProps> = ({ className = "w-6 h-6", fill = "white" }) => (
    <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-bible-600 to-bible-800 text-white shadow-sm ${className}`}>
         <svg viewBox="0 0 100 100" className="w-[60%] h-[60%]" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 30C10 30 30 30 50 20C70 30 90 30 90 30V85C90 85 70 85 50 75C30 85 10 85 10 85V30Z" />
            <path d="M50 20V75" />
            <path d="M50 35V60M40 48H60" />
         </svg>
    </div>
);