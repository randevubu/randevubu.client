import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'relative w-full rounded-lg border p-4';
    
    const variantClasses = {
      default: 'bg-white text-gray-900 border-gray-200',
      destructive: 'border-red-200 bg-red-50 text-red-800',
      success: 'border-green-200 bg-green-50 text-green-800',
      warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    const combinedClasses = `text-sm [&_p]:leading-relaxed ${className}`.trim();
    
    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };
