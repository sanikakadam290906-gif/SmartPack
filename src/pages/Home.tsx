import React from 'react';
import { Button } from '../components/Button';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <main 
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 0',
      }}
    >
      <div 
        className="container"
        style={{
          maxWidth: '860px',
        }}
      >
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border-grey, #D0D0D0)',
            borderRadius: 'var(--radius-box, 3px)',
            padding: '40px 48px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Main Title */}
          <h1 
            style={{
              fontSize: '34px',
              fontWeight: 700,
              color: 'var(--color-primary-navy, #062B52)',
              marginBottom: '10px',
              letterSpacing: '-0.01em',
            }}
          >
            SmartPack
          </h1>

          {/* Subtitle */}
          <h2 
            style={{
              fontSize: '19px',
              fontWeight: 600,
              color: 'var(--color-secondary-blue, #1E4F85)',
              marginBottom: '20px',
            }}
          >
            Intelligent Food Packaging Material Recommendation System
          </h2>

          {/* Short Description */}
          <p 
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: 'var(--color-text-dark, #1F1F1F)',
              maxWidth: '680px',
              marginBottom: '32px',
            }}
          >
            The system evaluates food commodity and storage parameters to suggest suitable packaging materials based on moisture protection, oxygen protection, mechanical strength, storage conditions, and shelf-life requirements.
          </p>

          {/* Primary Action Button */}
          <div>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onStart}
              id="start-recommendation-btn"
            >
              Start Recommendation
            </Button>
          </div>

          {/* Demonstration Notice */}
          <div 
            style={{
              marginTop: '36px',
              padding: '8px 16px',
              border: '1px solid var(--color-border-grey, #D0D0D0)',
              backgroundColor: 'var(--color-bg-grey, #F3F3F3)',
              borderRadius: 'var(--radius-box, 3px)',
              fontSize: '14px',
              color: 'var(--color-text-secondary, #555555)',
              fontWeight: 500,
            }}
          >
            Prototype Status: Demonstration Version
          </div>
        </div>
      </div>
    </main>
  );
};
