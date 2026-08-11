import React from 'react';
import './HeroSmartphone.css';

export const HeroSmartphone = () => {
  return (
    <div className="hero-sm-container">
      {/* 3D Floating Phone Structure */}
      <div className="hero-phone-body">
        
        {/* Frame / Bezel */}
        <div className="hero-phone-frame">
          <div className="hero-phone-screen">
            {/* Ambient Screen Mockup UI */}
            <div className="hero-screen-glow"></div>
            
            <div className="hero-screen-header">
              <div className="hero-camera-island"></div>
            </div>

            <div className="hero-screen-content">
              <div className="screen-widget blur-glass"></div>
              <div className="screen-row">
                <div className="screen-icon glow"></div>
                <div className="screen-icon glow delay-1"></div>
                <div className="screen-icon glow delay-2"></div>
              </div>
              
              <div className="screen-card">
                <div className="line title"></div>
                <div className="line sub"></div>
                <div className="line sub sm"></div>
              </div>
            </div>

            {/* Bottom App Dock */}
            <div className="hero-screen-dock blur-glass">
              <div className="dock-icon"></div>
              <div className="dock-icon"></div>
              <div className="dock-icon"></div>
              <div className="dock-icon"></div>
            </div>
            
          </div>
        </div>

        {/* Outer Edge Lighting / Volume Buttons */}
        <div className="hero-btn-vol up"></div>
        <div className="hero-btn-vol down"></div>
        <div className="hero-btn-pwr"></div>
      </div>

      {/* Floor / Shadow Reflection */}
      <div className="hero-phone-shadow"></div>
    </div>
  );
};
