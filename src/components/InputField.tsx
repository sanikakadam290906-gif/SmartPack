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

      <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          style={{
            width: '100%',
            minHeight: '44px',
            padding: suffix ? '0 40px 0 12px' : '0 12px',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error ? 'var(--color-error-border, #D18282)' : 'var(--color-border-box, #C8C8C8)'}`,
            borderRadius: 'var(--radius-box, 3px)',
            color: 'var(--color-text-dark, #1F1F1F)',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box',
            ...style,
          }}
          className={`gov-input ${className}`.trim()}
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
              fontWeight: 600,
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
