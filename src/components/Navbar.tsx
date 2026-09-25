import React, { useState } from 'react';

interface NavbarProps {
  currentPage: 'home' | 'details' | 'results';
  onNavigate: (page: 'home' | 'details' | 'results') => void;
  hasResults: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  hasResults
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (page: 'home' | 'details' | 'results') => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 18px',
    fontSize: '16px',
    fontWeight: isActive ? 700 : 600,
    color: 'var(--color-primary-navy, #062B52)',
    backgroundColor: isActive ? 'var(--color-active-nav-bg, #E8EEF5)' : 'transparent',
    borderBottom: isActive ? '3px solid var(--color-primary-navy, #062B52)' : '3px solid transparent',
    borderRadius: '0',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    height: '100%',
    display: 'inline-flex',
    alignItems: 'center',
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#FFFFFF' }}>
      {/* Level 1: Compact Navy-Blue Government Header */}
      <div 
        style={{
          backgroundColor: 'var(--color-primary-navy, #062B52)',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <div 
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '40px',
            fontSize: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.02em', fontSize: '15px' }}>
              SmartPack
            </span>
          </div>

          <div 
            style={{ 
              color: 'rgba(255, 255, 255, 0.85)', 
              fontSize: '13px',
              fontWeight: 500,
            }}
            className="desktop-nav"
          >
            Packaging Recommendation System
          </div>
        </div>
      </div>

      {/* Level 2: White Main Navigation Bar */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border-grey, #D0D0D0)',
          height: '52px',
        }}
      >
        <div 
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          {/* Main Navigation Links */}
          <nav 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              height: '100%',
              gap: '4px' 
            }}
            className="desktop-nav"
          >
            <button 
              type="button"
              onClick={() => handleLinkClick('home')} 
              style={navLinkStyle(currentPage === 'home')}
            >
              Home
            </button>
            
            <button 
              type="button"
              onClick={() => handleLinkClick('details')} 
              style={navLinkStyle(currentPage === 'details')}
            >
              New Recommendation
            </button>

            {hasResults && (
              <button 
                type="button"
                onClick={() => handleLinkClick('results')} 
                style={navLinkStyle(currentPage === 'results')}
              >
                Results
              </button>
            )}
          </nav>

          {/* Title on Mobile when desktop nav hidden */}
          <div 
            className="mobile-nav-toggle"
            style={{
              display: 'none',
              alignItems: 'center',
              fontWeight: 700,
              color: 'var(--color-primary-navy)',
              fontSize: '16px',
            }}
          >
            Navigation Menu
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-toggle"
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid var(--color-border-grey, #D0D0D0)',
              borderRadius: 'var(--radius-box, 3px)',
              padding: '6px 10px',
              color: 'var(--color-primary-navy)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {mobileMenuOpen ? 'Close Menu' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-drawer"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border-grey, #D0D0D0)',
            padding: '8px 16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <button 
            type="button"
            onClick={() => handleLinkClick('home')} 
            style={{ ...navLinkStyle(currentPage === 'home'), textAlign: 'left', width: '100%', height: '42px' }}
          >
            Home
          </button>
          <button 
            type="button"
            onClick={() => handleLinkClick('details')} 
            style={{ ...navLinkStyle(currentPage === 'details'), textAlign: 'left', width: '100%', height: '42px' }}
          >
            New Recommendation
          </button>
          {hasResults && (
            <button 
              type="button"
              onClick={() => handleLinkClick('results')} 
              style={{ ...navLinkStyle(currentPage === 'results'), textAlign: 'left', width: '100%', height: '42px' }}
            >
              Results
            </button>
          )}
        </div>
      )}
    </header>
  );
};
