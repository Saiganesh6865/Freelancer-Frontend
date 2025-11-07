import React from "react";
import "./Logo.css";
import hanLogo from "../assets/Han Digita-Logo YELLOW.png";

const Logo = ({
  size = "medium",
  className = "",
  src,
  width,
  height,
}) => {
  const imageSrc = src || hanLogo;

  // Set default dimensions based on size
  const sizeMap = {
    small: { width: 120, height: 35 },
    medium: { width: 180, height: 50 },
    large: { width: 260, height: 70 },
    xlarge: { width: 320, height: 90 },
  };

  const finalWidth = width || sizeMap[size].width;
  const finalHeight = height || sizeMap[size].height;

  return (
    <div className={`ll-logo ${size} ${className}`}>
      <img
        className="ll-logo-image"
        src={imageSrc}
        alt="Han Digital Logo"
        width={finalWidth}
        height={finalHeight}
        style={{
          width: `${finalWidth}px`,
          height: `${finalHeight}px`,
          objectFit: "contain",
        }}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    </div>
  );
};

export default Logo;
