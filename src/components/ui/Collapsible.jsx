import { useState ,React, createContext, useContext} from "react";
import { ChevronDown } from "lucide-react";

// Collapsible Context
const CollapsibleContext = createContext();

// Main Collapsible Component
export const Collapsible = ({ children, className, id, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const contextValue = {
    isOpen,
    toggle
  };

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div 
        className={className} 
        id={id}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

// Collapsible Trigger Component
export const CollapsibleTrigger = ({ children, className, onClick, ...props }) => {
  const context = useContext(CollapsibleContext);
  
  if (!context) {
    throw new Error('CollapsibleTrigger must be used within a Collapsible');
  }

  const handleClick = (e) => {
    context.toggle();
    if (onClick) onClick(e);
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      data-state={context.isOpen ? "open" : "closed"}
      style={{ cursor: 'pointer' }}
      {...props}
    >
      {children}
    </div>
  );
};

// Collapsible Content Component
export const CollapsibleContent = ({ children, className, ...props }) => {
  const context = useContext(CollapsibleContext);
  
  if (!context) {
    throw new Error('CollapsibleContent must be used within a Collapsible');
  }

  if (!context.isOpen) return null;

  return (
    <div 
      className={className}
      data-state={context.isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
    </div>
  );
};