import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  children?: React.ReactNode; // For select options
  disabled?: boolean;
  isEditing: boolean;
  displayValue?: string; // For non-editing display
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  children,
  disabled = false,
  isEditing,
  displayValue
}: FormFieldProps) {
  const hasError = touched && error;
  
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">
        {label}
      </label>
      {isEditing ? (
        <div>
          {type === 'text' ? (
            <input
              type="text"
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-300 bg-[var(--theme-background)] text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundMuted)] ${
                hasError 
                  ? 'border-[var(--theme-error)] bg-[var(--theme-error)]/10' 
                  : 'border-[var(--theme-border)]'
              } ${disabled ? 'bg-[var(--theme-backgroundSecondary)] cursor-not-allowed' : ''}`}
              placeholder={placeholder}
            />
          ) : (
            <select
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-300 bg-[var(--theme-background)] text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundMuted)] ${
                hasError 
                  ? 'border-[var(--theme-error)] bg-[var(--theme-error)]/10' 
                  : 'border-[var(--theme-border)]'
              } ${disabled ? 'bg-[var(--theme-backgroundSecondary)] cursor-not-allowed' : ''}`}
            >
              {children}
            </select>
          )}
          {hasError && (
            <div className="mt-1 flex items-center">
              <svg className="w-4 h-4 text-[var(--theme-error)] mr-1 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-[var(--theme-error)] text-xs transition-colors duration-300">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 py-2 text-sm bg-[var(--theme-backgroundSecondary)] rounded-lg text-[var(--theme-foreground)] transition-colors duration-300">
          {displayValue || value || 'Belirtilmemiş'}
        </div>
      )}
    </div>
  );
}