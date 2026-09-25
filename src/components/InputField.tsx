import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  suffix?: string;
  helperText?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  error,
  suffix,
  helperText,
  required,
  className = '',
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
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
        {label}
        {required && <span style={{ color: 'var(--color-error, #B02020)', fontSize: '15px' }}>*</span>}
      </label>

      <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          style={{
            width: '100%',
            height: '42px',
            padding: suffix ? '0 40px 0 12px' : '0 12px',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error ? 'var(--color-error-border, #D18282)' : 'var(--color-border-box, #C8C8C8)'}`,
            borderRadius: 'var(--radius-box, 3px)',
            color: 'var(--color-text-dark, #1F1F1F)',
            fontSize: '15px',
            outline: 'none',
          }}
          className={`gov-input ${className}`}
          {...props}
        />
        {suffix && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary, #555555)',
              fontSize: '14px',
              fontWeight: 500,
              pointerEvents: 'none',
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {helperText && !error && (
        <span 
          id={`${id}-helper`} 
          style={{ 
            fontSize: '13px', 
            color: 'var(--color-text-secondary, #555555)',
            marginTop: '2px' 
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
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
