import { useEffect, useState } from "react";

export const AnimatedDiv = ({ children, className = '', delay = 0, ...props }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), delay * 100);
      return () => clearTimeout(timer);
    }, [delay]);
    
    return (
      <div 
        className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  };