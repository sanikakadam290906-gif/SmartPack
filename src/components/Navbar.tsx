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
    padding: '0 16px',
    fontSize: '15px',
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

  const mobileNavLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '44px',
    padding: '10px 16px',
    fontSize: '15px',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--color-primary-navy, #062B52)' : 'var(--color-text-dark, #1F1F1F)',
    backgroundColor: isActive ? 'var(--color-active-nav-bg, #E8EEF5)' : 'transparent',
    border: 'none',
    borderLeft: isActive ? '4px solid var(--color-primary-navy, #062B52)' : '4px solid transparent',
    borderRadius: '0',
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#FFFFFF' }}>
      {/* Level 1: Compact Navy Government Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            Food Packaging Recommendation System
          </div>
        </div>
      </div>

      {/* Level 2: Main Navigation Bar */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border-grey, #D0D0D0)',
          height: '50px',
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
          {/* Desktop Navigation */}
          <nav 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              height: '100%',
              gap: '4px' 
            }}
            className="desktop-nav"
            aria-label="Main Navigation"
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

          {/* Mobile Header Bar Items */}
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
            {currentPage === 'home' && 'Home'}
            {currentPage === 'details' && 'Requirements Form'}
            {currentPage === 'results' && 'Recommendations'}
          </div>

          {/* Mobile Hamburger / Toggle Button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-nav-toggle"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: '1px solid var(--color-border-grey, #D0D0D0)',
              borderRadius: 'var(--radius-box, 3px)',
              padding: '6px 12px',
              minHeight: '40px',
              color: 'var(--color-primary-navy)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              gap: '6px',
            }}
          >
            <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-drawer"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '2px solid var(--color-primary-navy, #062B52)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button 
            type="button"
            onClick={() => handleLinkClick('home')} 
            style={mobileNavLinkStyle(currentPage === 'home')}
          >
            Home
          </button>
          <button 
            type="button"
            onClick={() => handleLinkClick('details')} 
            style={mobileNavLinkStyle(currentPage === 'details')}
          >
            New Recommendation
          </button>
          {hasResults && (
            <button 
              type="button"
              onClick={() => handleLinkClick('results')} 
              style={mobileNavLinkStyle(currentPage === 'results')}
            >
              Results
            </button>
          )}
        </div>
      )}
    </header>
  );
};
