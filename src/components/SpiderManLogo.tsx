import React from 'react';

const SpiderManLogo = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`spider-logo-container ${className}`}>
      <svg
        width="300"
        height="400"
        viewBox="0 0 300 400"
        className="spider-logo"
        style={{
          filter: 'drop-shadow(0 0 30px rgba(218, 80, 71, 0.9)) drop-shadow(0 0 15px rgba(6, 72, 169, 0.6))',
        }}
      >
        {/* Web line from top */}
        <line
          x1="150"
          y1="0"
          x2="150"
          y2="80"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
        
        {/* Miles Morales hanging upside down */}
        {/* Head/Mask */}
        <ellipse
          cx="150"
          cy="90"
          rx="22"
          ry="28"
          fill="#000000"
          stroke="#333333"
          strokeWidth="1"
        />
        
        {/* Futuristic mask eyes */}
        <g>
          {/* Left eye - red segments */}
          <rect x="130" y="80" width="8" height="3" fill="#da5047" opacity="0.9" />
          <rect x="140" y="78" width="8" height="3" fill="#da5047" opacity="0.9" />
          <rect x="130" y="86" width="8" height="3" fill="#da5047" opacity="0.9" />
          <rect x="140" y="88" width="8" height="3" fill="#da5047" opacity="0.9" />
          
          {/* Right eye - blue segments */}
          <rect x="152" y="80" width="8" height="3" fill="#0648a9" opacity="0.9" />
          <rect x="162" y="78" width="8" height="3" fill="#0648a9" opacity="0.9" />
          <rect x="152" y="86" width="8" height="3" fill="#0648a9" opacity="0.9" />
          <rect x="162" y="88" width="8" height="3" fill="#0648a9" opacity="0.9" />
        </g>
        
        {/* Torso - black jacket with red accents */}
        <ellipse
          cx="150"
          cy="140"
          rx="35"
          ry="45"
          fill="#000000"
          stroke="#333333"
          strokeWidth="1"
        />
        
        {/* Red jacket stripes */}
        <rect x="115" y="120" width="70" height="8" fill="#da5047" opacity="0.8" />
        <rect x="115" y="140" width="70" height="6" fill="#da5047" opacity="0.8" />
        <rect x="115" y="155" width="70" height="6" fill="#da5047" opacity="0.8" />
        
        {/* Chest web pattern (glowing red) */}
        <g opacity="0.7">
          <circle cx="150" cy="130" r="15" fill="none" stroke="#da5047" strokeWidth="2" opacity="0.6" />
          <path d="M 135 130 L 165 130 M 150 115 L 150 145 M 140 120 L 160 140 M 160 120 L 140 140" 
                stroke="#da5047" strokeWidth="1.5" opacity="0.6" />
        </g>
        
        {/* Arms - bent and holding web */}
        {/* Left arm holding web */}
        <path
          d="M 115 130 Q 100 120 95 140"
          stroke="#000000"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 115 130 Q 100 120 95 140"
          stroke="#da5047"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Right arm holding device */}
        <path
          d="M 185 130 Q 200 120 205 140"
          stroke="#000000"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 185 130 Q 200 120 205 140"
          stroke="#0648a9"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Glowing fingertips */}
        <circle cx="95" cy="140" r="4" fill="#da5047" opacity="0.9" />
        <circle cx="205" cy="140" r="4" fill="#da5047" opacity="0.9" />
        
        {/* Tech device in right hand */}
        <rect x="200" y="135" width="12" height="8" fill="#000000" stroke="#ffffff" strokeWidth="1" />
        <rect x="202" y="137" width="8" height="4" fill="#ffffff" opacity="0.8" />
        
        {/* Cable from device */}
        <line x1="206" y1="143" x2="200" y2="150" stroke="#abadbf" strokeWidth="2" opacity="0.7" />
        
        {/* Legs - bent at knees, spread apart */}
        {/* Left leg */}
        <path
          d="M 135 185 Q 125 200 120 220 Q 115 240 120 260"
          stroke="#000000"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 135 185 Q 125 200 120 220 Q 115 240 120 260"
          stroke="#da5047"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Right leg */}
        <path
          d="M 165 185 Q 175 200 180 220 Q 185 240 180 260"
          stroke="#000000"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 165 185 Q 175 200 180 220 Q 185 240 180 260"
          stroke="#0648a9"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Shoes with red accents */}
        <ellipse cx="120" cy="275" rx="12" ry="8" fill="#000000" stroke="#da5047" strokeWidth="2" />
        <ellipse cx="180" cy="275" rx="12" ry="8" fill="#000000" stroke="#0648a9" strokeWidth="2" />
        
        {/* Blue shoe accents */}
        <polygon points="175,270 180,265 185,270 180,275" fill="#0648a9" opacity="0.8" />
        
        {/* Additional web lines for dynamic effect */}
        <path
          d="M 150 80 Q 180 60 210 80"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4,4"
          opacity="0.6"
        />
        <path
          d="M 150 80 Q 120 60 90 80"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4,4"
          opacity="0.6"
        />
        
        {/* Energy glow effects */}
        <g opacity="0.4">
          <circle cx="95" cy="140" r="8" fill="#da5047" opacity="0.3">
            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="205" cy="140" r="8" fill="#0648a9" opacity="0.3">
            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
      
      <style jsx>{`
        .spider-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fade-in-out 3s ease-in-out;
        }
        
        .spider-logo {
          animation: spider-pulse 2s ease-in-out infinite alternate, 
                     spider-hang 4s ease-in-out infinite;
        }
        
        @keyframes spider-pulse {
          0% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 30px rgba(218, 80, 71, 0.9)) drop-shadow(0 0 15px rgba(6, 72, 169, 0.6));
          }
          100% {
            transform: scale(1.05) rotate(1deg);
            filter: drop-shadow(0 0 40px rgba(218, 80, 71, 1)) drop-shadow(0 0 20px rgba(6, 72, 169, 0.8));
          }
        }
        
        @keyframes spider-hang {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(0.5deg);
          }
        }
        
        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: scale(0.8) rotate(-15deg) translateY(20px);
          }
          20% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateY(0px);
          }
          80% {
            opacity: 1;
            transform: scale(1) rotate(0deg) translateY(0px);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) rotate(15deg) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default SpiderManLogo;
