import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  options,
  error,
  helperText,
  required,
  placeholder,
  className = '',
  style,
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', boxSizing: 'border-box' }}>
      <label 
        htmlFor={id} 
        style={{ 
          fontSize: '15px', 
          fontWeight: 600, 
          color: 'var(--color-text-dark, #1F1F1F)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span>{label}</span>
        {required && <span style={{ color: 'var(--color-error, #B02020)', fontSize: '15px' }} aria-hidden="true">*</span>}
      </label>

      <div style={{ position: 'relative', width: '100%' }}>
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          style={{
            width: '100%',
            minHeight: '44px',
            padding: '0 36px 0 12px',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error ? 'var(--color-error-border, #D18282)' : 'var(--color-border-box, #C8C8C8)'}`,
            borderRadius: 'var(--radius-box, 3px)',
            color: 'var(--color-text-dark, #1F1F1F)',
            fontSize: '15px',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box',
            ...style,
          }}
          className={`gov-select ${className}`.trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Simple chevron */}
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--color-text-secondary, #555555)',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {helperText && !error && (
        <span 
          id={`${id}-helper`} 
          style={{ 
            fontSize: '13px', 
            color: 'var(--color-text-secondary, #555555)',
            marginTop: '2px',
            lineHeight: 1.4,
          }}
        >
          {helperText}
        </span>
      )}

      {error && (
        <span 
          id={`${id}-error`} 
          style={{ 
            fontSize: '13px', 
            color: 'var(--color-error, #B02020)',
            marginTop: '2px',
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
