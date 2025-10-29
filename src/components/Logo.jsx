import React from "react";
import "./Logo.css";
import hanLogo from "../assets/Han_digital_logo_4.png";

const Logo = ({ size = "medium", className = "", src, width = 280, height = 70 }) => {
  const imageSrc = src || hanLogo;

  return (
    <div className={`ll-logo ${size} ${className}`}>
      <img
        className="ll-logo-image"
        src={imageSrc}
        alt="Han Digital Logo"
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: "contain",
          display: "block",
        }}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      {/* <span className={`ll-logo-text ${size}`}>Han Digital</span> */}
    </div>
  );
};

export default Logo;
