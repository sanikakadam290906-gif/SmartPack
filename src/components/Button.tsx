import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-family, Arial, Helvetica, sans-serif)',
    fontWeight: 600,
    borderRadius: 'var(--radius-box, 3px)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '6px 14px',
      fontSize: '14px',
      height: '36px',
    },
    md: {
      padding: '10px 22px',
      fontSize: '15px',
      height: '42px',
    },
    lg: {
      padding: '12px 28px',
      fontSize: '16px',
      height: '46px',
    }
  };

  let variantStyle: React.CSSProperties = {};

  if (variant === 'primary') {
    variantStyle = {
      backgroundColor: 'var(--color-primary-navy, #062B52)',
      color: '#FFFFFF',
      borderColor: 'var(--color-primary-navy, #062B52)',
    };
  } else if (variant === 'secondary') {
    variantStyle = {
      backgroundColor: '#FFFFFF',
      color: 'var(--color-primary-navy, #062B52)',
      borderColor: 'var(--color-border-box, #C8C8C8)',
    };
  }

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyle,
      }}
      className={`gov-btn gov-btn-${variant} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
