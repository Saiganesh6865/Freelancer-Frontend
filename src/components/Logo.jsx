import React from 'react';
import './Logo.css';

// If you place your own logo file as /public/lancelink.svg or /public/lancelink.png
// this component will render that image. Otherwise it falls back to the inline SVG mark.
const Logo = ({ size = 'medium', className = '', src, variant = 'white' }) => {
  const imageSrc = src || '/lancelink.svg';
  const renderImage = (
    <img
      className="ll-logo-image"
      src={imageSrc}
      alt="LanceLink logo"
      onError={(e) => {
        // hide image if not found; inline SVG fallback will be shown instead
        e.currentTarget.style.display = 'none';
      }}
    />
  );

  const renderInline = (
    <div className="ll-logo-icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L7.5 7.5L5 10L12 17L19 10L16.5 7.5L12 3Z" />
        <circle cx="12" cy="12" r="1.6" fill="white" />
        <circle cx="7.5" cy="7.5" r="1.6" fill="currentColor" />
        <circle cx="16.5" cy="7.5" r="1.6" fill="currentColor" />
        <path d="M7.5 7.5H16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );

  return (
    <div className={`ll-logo ${size} ${variant} ${className}`}>
      {renderImage}
      {renderInline}
      <span className={`ll-logo-text ${size}`}>LanceLink</span>
    </div>
  );
};

export default Logo;
