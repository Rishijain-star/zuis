
// Card components
export const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {children}
    </div>
  );
  
  export  const CardHeader = ({ children, className = '' }) => (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
  
  export  const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold ${className}`}>
      {children}
    </h3>
  );
  
  export  const CardContent = ({ children, className = '' }) => (
    <div className={`px-6 pb-6 ${className}`}>
      {children}
    </div>
  );