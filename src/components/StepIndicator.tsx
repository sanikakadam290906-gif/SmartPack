import React from 'react';
import { WIZARD_STEPS } from '../data/wizardSteps';

interface StepIndicatorProps {
  currentStep: number;
  maxStepReached: number;
  onStepClick: (stepNumber: number) => void;
}

const STEP_LABELS: Record<number, { short: string; mobileTitle: string }> = {
  1: { short: 'Product', mobileTitle: 'Product Information' },
  2: { short: 'Storage', mobileTitle: 'Storage & Shelf Life' },
  3: { short: 'Transportation', mobileTitle: 'Transportation' },
  4: { short: 'Packaging', mobileTitle: 'Packaging Requirement' },
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  maxStepReached,
  onStepClick,
}) => {
  const currentStepData = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];
  const progressPercent = currentStep === 1 ? 25 : currentStep === 2 ? 50 : currentStep === 3 ? 75 : 100;
  const mobileLabel = STEP_LABELS[currentStep]?.mobileTitle || currentStepData.fullTitle;

  return (
    <div className="wizard-stepper-card">
      {/* Desktop Stepper */}
      <div className="wizard-stepper-desktop-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy, #062B52)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {`Step ${currentStep} of 4`}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-blue, #1E4F85)' }}>
            {`${progressPercent}% Complete`}
          </span>
        </div>

        <nav 
          className="wizard-stepper-desktop" 
          aria-label="Recommendation wizard steps"
        >
          {WIZARD_STEPS.map((s, idx) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            const isClickable = s.step <= maxStepReached;
            const shortName = STEP_LABELS[s.step]?.short || s.label;

            return (
              <React.Fragment key={s.step}>
                {idx > 0 && (
                  <span 
                    className={`wizard-stepper-arrow ${s.step <= currentStep ? 'wizard-stepper-arrow-active' : ''}`} 
                    aria-hidden="true" 
                  >
                    →
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isClickable) {
                      onStepClick(s.step);
                    }
                  }}
                  disabled={!isClickable}
                  className={`wizard-stepper-step ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  title={isClickable ? `Go to Step ${s.step}: ${shortName}` : `Step ${s.step}: ${shortName}`}
                  style={{
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: isClickable || isCurrent ? 1 : 0.6,
                  }}
                >
                  <span 
                    className={`wizard-stepper-num ${
                      isCurrent 
                        ? 'wizard-stepper-num-active' 
                        : isCompleted 
                          ? 'wizard-stepper-num-completed' 
                          : 'wizard-stepper-num-upcoming'
                    }`}
                  >
                    {isCompleted ? (
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      s.step
                    )}
                  </span>
                  <span 
                    className={`wizard-stepper-label ${
                      isCurrent 
                        ? 'wizard-stepper-label-active' 
                        : isCompleted 
                          ? 'wizard-stepper-label-completed' 
                          : 'wizard-stepper-label-upcoming'
                    }`}
                  >
                    {`${s.step} ${shortName}`}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Progress Bar under Desktop Stepper */}
        <div 
          className="wizard-progress-bar desktop-progress" 
          role="progressbar" 
          aria-valuenow={progressPercent} 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-label={`Progress: ${progressPercent}%`}
          style={{ marginTop: '12px' }}
        >
          <div 
            className="wizard-progress-bar-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Mobile Stepper Header */}
      <div 
        className="wizard-stepper-mobile" 
        aria-label={`Step ${currentStep} of 4: ${mobileLabel}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="wizard-mobile-step-tag">
            {`Step ${currentStep} of 4`}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-blue, #1E4F85)' }}>
            {`${progressPercent}%`}
          </span>
        </div>
        <div className="wizard-mobile-step-title">
          {mobileLabel}
        </div>
        <div 
          className="wizard-progress-bar" 
          role="progressbar" 
          aria-valuenow={progressPercent} 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-label={`Progress: ${progressPercent}%`}
        >
          <div 
            className="wizard-progress-bar-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>
    </div>
  );
};
