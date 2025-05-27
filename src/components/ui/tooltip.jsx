import { useState } from "react";

export const TooltipProvider = ({ children }) => <div>{children}</div>;

export const Tooltip = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      {children}
    </div>
  );
};

export const TooltipTrigger = ({ children, asChild }) => {
  return <div className="cursor-pointer">{children}</div>;
};

export const TooltipContent = ({ children, side = 'top' }) => {
  return (
    <div className={`absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity ${
      side === 'top' ? 'bottom-full mb-2' : 
      side === 'bottom' ? 'top-full mt-2' : 
      side === 'left' ? 'right-full mr-2' : 
      'left-full ml-2'
    }`}>
      {children}
    </div>
  );
};
