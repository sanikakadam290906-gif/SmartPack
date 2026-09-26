import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidthOnMobile?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidthOnMobile = false,
  children,
  className = '',
  disabled,
  style,
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
    transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    textDecoration: 'none',
    userSelect: 'none',
    minHeight: '44px',
    boxSizing: 'border-box',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '6px 14px',
      fontSize: '14px',
      minHeight: '38px',
    },
    md: {
      padding: '8px 20px',
      fontSize: '15px',
      minHeight: '44px',
    },
    lg: {
      padding: '10px 24px',
      fontSize: '16px',
      minHeight: '48px',
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

  const mobileClass = fullWidthOnMobile ? 'gov-btn-mobile-full' : '';

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyle,
        ...style,
      }}
      className={`gov-btn gov-btn-${variant} ${mobileClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
