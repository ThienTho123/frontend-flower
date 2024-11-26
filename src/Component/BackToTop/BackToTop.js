// BackToTop.js
import React, { useState, useEffect } from 'react';
import './BackToTop.css';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {  
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', 
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);  
    return () => window.removeEventListener('scroll', toggleVisibility);  
  }, []);

  return (
    <div>
      <button
        className={`back-to-top ${isVisible ? 'show' : ''}`}  
        onClick={scrollToTop}
      >
        ↑ 
      </button>
    </div>
  );
}
