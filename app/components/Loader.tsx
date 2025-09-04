import React from 'react'

interface TransparentLoaderProps {
  show?: boolean;
  message?: string;
  fullScreen?: boolean; // New prop to control full screen vs component scope
}

const Loader: React.FC<TransparentLoaderProps> = ({ 
  show = true, 
  message = "Loading...", 
  fullScreen = true 
}) => {
  if (!show) return null;

  const containerStyle = fullScreen ? {
    // Full screen styles
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
    zIndex: 9999,
    backdropFilter: 'blur(2px)'
  } : {
    // Component-specific styles
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column' as const,
    zIndex: 10,
    backdropFilter: 'blur(2px)'
  };

  return (
    <div style={containerStyle}>
       <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          animation: 'spin 1s linear infinite'
        }}>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#556fa5ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="45"
            />
          </svg>
        </div>

        <p style={{ 
          fontWeight: 600, 
          fontSize: '16px', 
          margin: 0,
          color: '#556fa5ff'
        }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loader