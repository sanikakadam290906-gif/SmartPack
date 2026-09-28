import React, { useState, useEffect } from 'react';
import { ILLUSTRATIVE_COMMODITIES } from '../data/commodities';
import { WIZARD_STEPS } from '../data/wizardSteps';
import type { 
  FoodDetailsFormData, 
  MoistureSensitivity, 
  OilFatContent, 
  PrimaryConcern, 
  RespirationRate, 
  ShelfLifeUnit, 
  StorageType, 
  TransportationCondition 
} from '../types/recommendation';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { StepIndicator } from '../components/StepIndicator';

interface FoodDetailsProps {
  initialData: FoodDetailsFormData;
  onSubmit: (data: FoodDetailsFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
  initialStep?: number;
}

interface TransportationOptionConfig {
  value: TransportationCondition;
  displayTitle: string;
  description: string;
}

const TRANSPORTATION_OPTIONS: TransportationOptionConfig[] = [
  {
    value: 'Normal Transportation',
    displayTitle: 'Normal Transportation',
    description: 'Standard distribution and handling conditions.'
  },
  {
    value: 'Refrigerated Transportation',
    displayTitle: 'Refrigerated Transportation',
    description: 'Transportation under refrigerated conditions.'
  },
  {
    value: 'Frozen Transportation',
    displayTitle: 'Frozen Transportation',
    description: 'Transportation under frozen conditions.'
  },
  {
    value: 'Long-Distance Transportation',
    displayTitle: 'Long-Distance Transportation',
    description: 'Suitable when distribution involves longer travel.'
  },
  {
    value: 'High Vibration / Mechanical Stress',
    displayTitle: 'Mechanical Stress / High Vibration',
    description: 'Used when handling or transport may involve increased physical stress.'
  },
  {
    value: 'Not Specified',
    displayTitle: 'Not Specified',
    description: 'No specific transportation condition selected.'
  }
];

interface ConcernOptionConfig {
  value: PrimaryConcern;
  displayTitle: string;
  icon: string;
  description: string;
}

const CONCERN_OPTIONS: ConcernOptionConfig[] = [
  {
    value: 'Moisture Protection',
    displayTitle: 'Moisture Protection',
    icon: '💧',
    description: 'Protect the product from moisture and humidity.'
  },
  {
    value: 'Oxygen Protection',
    displayTitle: 'Oxygen Protection',
    icon: '🫧',
    description: 'Reduce oxygen exposure where needed.'
  },
  {
    value: 'Light Protection',
    displayTitle: 'Light Protection',
    icon: '☀️',
    description: 'Protect products that are sensitive to light.'
  },
  {
    value: 'Mechanical Strength',
    displayTitle: 'Mechanical Protection',
    icon: '📦',
    description: 'Help protect the product during handling and transportation.'
  },
  {
    value: 'Temperature Resistance',
    displayTitle: 'Temperature Protection',
    icon: '🌡️',
    description: 'Support products exposed to temperature changes.'
  },
  {
    value: 'Extended Shelf Life',
    displayTitle: 'Extended Shelf Life',
    icon: '⏳',
    description: 'Prioritize packaging suitable for longer storage requirements.'
  },
  {
    value: 'Cost Efficiency',
    displayTitle: 'Cost Efficiency',
    icon: '💰',
    description: 'Prioritize practical and economical packaging options.'
  },
  {
    value: 'Sustainability',
    displayTitle: 'Sustainability',
    icon: '♻️',
    description: 'Prioritize suitable lower-impact material options.'
  },
  {
    value: 'Gas Exchange / Respiration',
    displayTitle: 'Gas Exchange / Respiration',
    icon: '🌬️',
    description: 'Allow appropriate gas exchange for respiring fresh produce.'
  }
];

interface StorageCardConfig {
  type: StorageType;
  title: string;
  description: string;
}

const STORAGE_CARDS: StorageCardConfig[] = [
  {
    type: 'Ambient',
    title: 'Ambient',
    description: 'Room-temperature storage'
  },
  {
    type: 'Chilled',
    title: 'Chilled',
    description: 'Refrigerated storage'
  },
  {
    type: 'Frozen',
    title: 'Frozen',
    description: 'Frozen storage'
  }
];

export const FoodDetails: React.FC<FoodDetailsProps> = ({
  initialData,
  onSubmit,
  onBack,
  isLoading = false,
  initialStep = 1
}) => {
  const [formData, setFormData] = useState<FoodDetailsFormData>(initialData);
  const [prevInitialData, setPrevInitialData] = useState<FoodDetailsFormData>(initialData);
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [maxStepReached, setMaxStepReached] = useState<number>(() => {
    return initialData.commodityId ? 4 : initialStep;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  // Smooth multi-phase loading progression
  const [loadingPhase, setLoadingPhase] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Synchronize state when initialData prop changes without triggering cascading effect renders
  if (prevInitialData !== initialData) {
    setPrevInitialData(initialData);
    setFormData(initialData);
    if (!initialData.commodityId) {
      setCurrentStep(1);
      setMaxStepReached(1);
    }
  }

  // Handle multi-stage loading progression
  useEffect(() => {
    let t1: any;
    let t2: any;
    let t3: any;

    if (isSubmitting) {
      t1 = setTimeout(() => {
        setLoadingPhase(2); // "Checking available packaging options..."
      }, 350);
      t2 = setTimeout(() => {
        setLoadingPhase(3); // "Preparing recommendations..."
      }, 700);
      t3 = setTimeout(() => {
        onSubmit(formData);
      }, 1050);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isSubmitting, formData, onSubmit]);

  // Auto-populate baseline defaults when selecting a commodity
  const handleCommodityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const commodityId = e.target.value;
    const selected = ILLUSTRATIVE_COMMODITIES.find((c) => c.id === commodityId);
    
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        commodityId: selected.id,
        moistureContent: selected.defaultMoistureContent,
        moistureSensitivity: selected.defaultMoistureSensitivity,
        oilFatContent: selected.defaultOilFatContent,
        ph: selected.defaultPh,
        respirationRate: selected.defaultRespirationRate,
        targetShelfLifeValue: selected.defaultShelfLifeValue,
        targetShelfLifeUnit: selected.defaultShelfLifeUnit,
        storageType: selected.defaultStorageType,
        storageTemperature: selected.defaultTemp,
        relativeHumidity: selected.defaultHumidity,
        transportationCondition: selected.defaultTransportation,
        primaryConcern: selected.defaultConcern,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        commodityId,
      }));
    }

    if (errors.commodityId) {
      setErrors((prev) => ({ ...prev, commodityId: '' }));
      setErrorSummary(null);
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.commodityId) {
      newErrors.commodityId = 'Please select a food commodity.';
    }

    const mc = Number(formData.moistureContent);
    if (formData.moistureContent === '' || isNaN(mc) || mc < 0 || mc > 100) {
      newErrors.moistureContent = 'Enter a valid moisture percentage (0 - 100%).';
    }

    const phVal = Number(formData.ph);
    if (formData.ph === '' || isNaN(phVal) || phVal < 0 || phVal > 14) {
      newErrors.ph = 'Enter a valid pH value between 0.0 and 14.0.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrorSummary('Please fill in all required fields to continue.');
      return false;
    }
    setErrorSummary(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const shelfLife = Number(formData.targetShelfLifeValue);
    if (!formData.targetShelfLifeValue || isNaN(shelfLife) || shelfLife <= 0) {
      newErrors.targetShelfLifeValue = 'Please enter the target shelf life.';
    }

    if (!formData.storageType) {
      newErrors.storageType = 'Please select a storage condition.';
    }

    const temp = Number(formData.storageTemperature);
    if (formData.storageTemperature === '' || isNaN(temp) || temp < -50 || temp > 70) {
      newErrors.storageTemperature = 'Enter a valid temperature between -50°C and 70°C.';
    }

    const rh = Number(formData.relativeHumidity);
    if (formData.relativeHumidity === '' || isNaN(rh) || rh < 0 || rh > 100) {
      newErrors.relativeHumidity = 'Enter a valid relative humidity (0 - 100%).';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrorSummary('Please fill in all required fields in storage parameters to continue.');
      return false;
    }
    setErrorSummary(null);
    return true;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.transportationCondition) {
      newErrors.transportationCondition = 'Please select a transportation condition.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrorSummary('Please select a transportation condition to continue.');
      return false;
    }
    setErrorSummary(null);
    return true;
  };

  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.primaryConcern) {
      newErrors.primaryConcern = 'Please select a packaging requirement.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrorSummary('Please select the packaging requirement for your product.');
      return false;
    }
    setErrorSummary(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        setMaxStepReached((prev) => Math.max(prev, 2));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        setMaxStepReached((prev) => Math.max(prev, 3));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
        setMaxStepReached((prev) => Math.max(prev, 4));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setErrorSummary(null);
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    
    // Going backwards is always allowed and preserves state
    if (targetStep < currentStep) {
      setErrorSummary(null);
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Moving forward requires validating the current step
    let isValid = true;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();

    if (isValid && targetStep <= maxStepReached) {
      setErrorSummary(null);
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 4) {
      if (validateStep4()) {
        setLoadingPhase(1);
        setIsSubmitting(true);
      }
    } else {
      handleNext();
    }
  };

  const sensitivityOptions: MoistureSensitivity[] = ['Low', 'Medium', 'High'];
  const fatOptions: OilFatContent[] = ['Low', 'Medium', 'High'];

  const currentStepMeta = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];
  const selectedCommodity = ILLUSTRATIVE_COMMODITIES.find((c) => c.id === formData.commodityId);
  const commodityDisplayName = selectedCommodity ? selectedCommodity.name : (formData.commodityId || 'Not Selected');

  // Loading text sequence
  const getLoadingMessage = () => {
    if (loadingPhase === 1) return 'Analyzing your requirements...';
    if (loadingPhase === 2) return 'Checking available packaging options...';
    if (loadingPhase >= 3) return 'Preparing recommendations...';
    return 'Evaluating packaging options...';
  };

  return (
    <main style={{ flex: 1, padding: '24px 0 44px' }}>
      <div className="container wizard-outer-wrapper">
        
        {/* Step Indicator at the top */}
        <StepIndicator 
          currentStep={currentStep}
          maxStepReached={maxStepReached}
          onStepClick={handleStepClick}
        />

        {/* Friendly Error Summary Banner */}
        {errorSummary && (
          <div className="wizard-error-banner" style={{ marginBottom: '18px' }} role="alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>{errorSummary}</div>
          </div>
        )}

        {/* Wizard Main Card */}
        <div className="wizard-main-card">
          
          {isSubmitting || isLoading ? (
            /* Professional Non-AI Loading State */
            <div className="wizard-loading-overlay" role="status" aria-live="polite">
              <div className="wizard-spinner" aria-hidden="true" />
              <div className="wizard-loading-text">
                {getLoadingMessage()}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary, #555555)' }}>
                Matching technical barrier criteria with SmartPack material specifications.
              </div>
            </div>
          ) : (
            <>
              {/* Focused Step Header */}
              <div className="wizard-step-header">
                <h1 className="wizard-step-title">
                  {currentStepMeta.fullTitle}
                </h1>
                <p className="wizard-step-desc">
                  {currentStepMeta.desc}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                
                {/* ========================================================
                    STEP 1: PRODUCT INFORMATION
                    ======================================================== */}
                {currentStep === 1 && (
                  <div className="wizard-step-content" key="step-1">
                    {/* Field 1: Commodity Selection */}
                    <div>
                      <SelectField
                        id="food-commodity-select"
                        label="Food Commodity"
                        required
                        value={formData.commodityId}
                        onChange={handleCommodityChange}
                        error={errors.commodityId}
                        placeholder="Select a food commodity..."
                        options={ILLUSTRATIVE_COMMODITIES.map((c) => ({
                          value: c.id,
                          label: `${c.name} [${c.category}]`,
                        }))}
                      />
                    </div>

                    {/* 2-Column Responsive Layout */}
                    <div className="gov-grid-2">
                      {/* Field 2: Moisture Content (%) */}
                      <div>
                        <InputField
                          id="moisture-content-input"
                          label="Moisture Content"
                          type="number"
                          step="0.1"
                          suffix="%"
                          required
                          value={formData.moistureContent}
                          onChange={(e) => {
                            setFormData({ ...formData, moistureContent: e.target.value });
                            if (errors.moistureContent) {
                              setErrors((prev) => ({ ...prev, moistureContent: '' }));
                              setErrorSummary(null);
                            }
                          }}
                          error={errors.moistureContent}
                          placeholder="e.g. 12.5"
                        />
                      </div>

                      {/* Field 3: Moisture Sensitivity */}
                      <div>
                        <label 
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 600, 
                            color: 'var(--color-text-dark, #1F1F1F)',
                            display: 'block',
                            marginBottom: '6px'
                          }}
                        >
                          Moisture Sensitivity <span style={{ color: 'var(--color-error, #B02020)' }}>*</span>
                        </label>
                        <div className="wizard-pill-group" role="radiogroup" aria-label="Moisture Sensitivity">
                          {sensitivityOptions.map((opt) => {
                            const isSelected = formData.moistureSensitivity === opt;
                            return (
                              <button
                                type="button"
                                key={opt}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setFormData({ ...formData, moistureSensitivity: opt })}
                                className={`wizard-pill-btn ${isSelected ? 'wizard-pill-btn-active' : ''}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Field 4: Oil/Fat Content */}
                      <div>
                        <label 
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 600, 
                            color: 'var(--color-text-dark, #1F1F1F)',
                            display: 'block',
                            marginBottom: '6px'
                          }}
                        >
                          Oil / Fat Content <span style={{ color: 'var(--color-error, #B02020)' }}>*</span>
                        </label>
                        <div className="wizard-pill-group" role="radiogroup" aria-label="Oil or Fat Content">
                          {fatOptions.map((opt) => {
                            const isSelected = formData.oilFatContent === opt;
                            return (
                              <button
                                type="button"
                                key={opt}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setFormData({ ...formData, oilFatContent: opt })}
                                className={`wizard-pill-btn ${isSelected ? 'wizard-pill-btn-active' : ''}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Field 5: pH */}
                      <div>
                        <InputField
                          id="ph-input"
                          label="pH Value"
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          required
                          helperText="Standard food range: 0.0 to 14.0"
                          value={formData.ph}
                          onChange={(e) => {
                            setFormData({ ...formData, ph: e.target.value });
                            if (errors.ph) {
                              setErrors((prev) => ({ ...prev, ph: '' }));
                              setErrorSummary(null);
                            }
                          }}
                          error={errors.ph}
                          placeholder="e.g. 6.5"
                        />
                      </div>
                    </div>

                    {/* Field 6: Respiration Rate */}
                    <div>
                      <SelectField
                        id="respiration-rate-select"
                        label="Respiration Rate"
                        required
                        helperText="Relevant for fresh horticultural produce (fruits and vegetables)."
                        value={formData.respirationRate}
                        onChange={(e) => setFormData({ ...formData, respirationRate: e.target.value as RespirationRate })}
                        options={[
                          { value: 'Not Applicable', label: 'Not Applicable (Processed / Dry / Meat / Dairy)' },
                          { value: 'Very Low', label: 'Very Low (Nuts, Dried Fruits, Onions)' },
                          { value: 'Low', label: 'Low (Apples, Potatoes, Citrus)' },
                          { value: 'Moderate', label: 'Moderate (Bananas, Mangoes, Tomatoes)' },
                          { value: 'High', label: 'High (Strawberries, Avocados, Cauliflower)' },
                          { value: 'Very High', label: 'Very High (Spinach, Sweet Corn, Asparagus)' },
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* ========================================================
                    STEP 2: STORAGE & SHELF LIFE
                    ======================================================== */}
                {currentStep === 2 && (
                  <div className="wizard-step-content" key="step-2">
                    
                    {/* Storage Condition Selectable Cards */}
                    <div>
                      <label 
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: 600, 
                          color: 'var(--color-text-dark, #1F1F1F)',
                          display: 'block',
                          marginBottom: '8px'
                        }}
                      >
                        Storage Condition <span style={{ color: 'var(--color-error, #B02020)' }}>*</span>
                      </label>
                      
                      <div className="wizard-storage-grid" role="radiogroup" aria-label="Storage Condition">
                        {STORAGE_CARDS.map((card) => {
                          const isSelected = formData.storageType === card.type;
                          return (
                            <button
                              type="button"
                              key={card.type}
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                let newTemp = formData.storageTemperature;
                                if (card.type === 'Frozen' && (newTemp === '' || Number(newTemp) > -5)) newTemp = -18;
                                if (card.type === 'Chilled' && (newTemp === '' || Number(newTemp) > 10 || Number(newTemp) < 0)) newTemp = 4;
                                if (card.type === 'Ambient' && (newTemp === '' || Number(newTemp) < 15)) newTemp = 25;
                                setFormData({ ...formData, storageType: card.type, storageTemperature: newTemp });
                              }}
                              className={`wizard-storage-card ${isSelected ? 'wizard-storage-card-active' : ''}`}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-primary-navy, #062B52)' }}>
                                  {card.title}
                                </span>
                                <span 
                                  className={`wizard-check-circle ${isSelected ? 'wizard-check-circle-active' : 'wizard-check-circle-inactive'}`}
                                  aria-hidden="true"
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                              </div>
                              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #555555)' }}>
                                {card.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="gov-grid-2">
                      {/* Field: Target Shelf Life */}
                      <div>
                        <label 
                          htmlFor="shelf-life-input"
                          style={{ 
                            fontSize: '15px', 
                            fontWeight: 600, 
                            color: 'var(--color-text-dark, #1F1F1F)',
                            display: 'block',
                            marginBottom: '6px'
                          }}
                        >
                          Target Shelf Life <span style={{ color: 'var(--color-error, #B02020)' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 2 }}>
                            <input
                              id="shelf-life-input"
                              type="number"
                              min="1"
                              value={formData.targetShelfLifeValue}
                              onChange={(e) => {
                                setFormData({ ...formData, targetShelfLifeValue: e.target.value });
                                if (errors.targetShelfLifeValue) {
                                  setErrors((prev) => ({ ...prev, targetShelfLifeValue: '' }));
                                  setErrorSummary(null);
                                }
                              }}
                              placeholder="e.g. 90"
                              aria-invalid={!!errors.targetShelfLifeValue}
                              className="gov-input"
                              style={{
                                borderColor: errors.targetShelfLifeValue ? 'var(--color-error-border, #D18282)' : undefined,
                              }}
                            />
                          </div>
                          <div style={{ flex: 1.3 }}>
                            <select
                              id="shelf-life-unit-select"
                              value={formData.targetShelfLifeUnit}
                              onChange={(e) => setFormData({ ...formData, targetShelfLifeUnit: e.target.value as ShelfLifeUnit })}
                              className="gov-select"
                              style={{ padding: '0 8px' }}
                            >
                              <option value="Days">Days</option>
                              <option value="Weeks">Weeks</option>
                              <option value="Months">Months</option>
                            </select>
                          </div>
                        </div>
                        {errors.targetShelfLifeValue && (
                          <span style={{ fontSize: '13px', color: 'var(--color-error, #B02020)', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                            {errors.targetShelfLifeValue}
                          </span>
                        )}
                      </div>

                      {/* Field: Storage Temperature */}
                      <div>
                        <InputField
                          id="storage-temperature-input"
                          label="Storage Temperature"
                          type="number"
                          suffix="°C"
                          required
                          value={formData.storageTemperature}
                          onChange={(e) => {
                            setFormData({ ...formData, storageTemperature: e.target.value });
                            if (errors.storageTemperature) {
                              setErrors((prev) => ({ ...prev, storageTemperature: '' }));
                              setErrorSummary(null);
                            }
                          }}
                          error={errors.storageTemperature}
                          placeholder="e.g. 25"
                        />
                      </div>

                      {/* Field: Relative Humidity */}
                      <div>
                        <InputField
                          id="relative-humidity-input"
                          label="Relative Humidity"
                          type="number"
                          suffix="%"
                          min="0"
                          max="100"
                          required
                          value={formData.relativeHumidity}
                          onChange={(e) => {
                            setFormData({ ...formData, relativeHumidity: e.target.value });
                            if (errors.relativeHumidity) {
                              setErrors((prev) => ({ ...prev, relativeHumidity: '' }));
                              setErrorSummary(null);
                            }
                          }}
                          error={errors.relativeHumidity}
                          placeholder="e.g. 60"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    STEP 3: TRANSPORTATION (INTERACTIVE CARDS GRID)
                    ======================================================== */}
                {currentStep === 3 && (
                  <div className="wizard-step-content" key="step-3">
                    <div>
                      <label 
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: 600, 
                          color: 'var(--color-text-dark, #1F1F1F)',
                          display: 'block',
                          marginBottom: '10px'
                        }}
                      >
                        Transportation Conditions <span style={{ color: 'var(--color-error, #B02020)' }}>*</span>
                      </label>

                      <div className="wizard-cards-grid" role="radiogroup" aria-label="Transportation Conditions">
                        {TRANSPORTATION_OPTIONS.map((opt) => {
                          const isSelected = formData.transportationCondition === opt.value;
                          return (
                            <button
                              type="button"
                              key={opt.value}
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setFormData({ ...formData, transportationCondition: opt.value });
                                if (errors.transportationCondition) {
                                  setErrors((prev) => ({ ...prev, transportationCondition: '' }));
                                  setErrorSummary(null);
                                }
                              }}
                              className={`wizard-interactive-card ${isSelected ? 'wizard-interactive-card-active' : ''}`}
                            >
                              <div className="wizard-card-header">
                                <span className="wizard-card-title">
                                  {opt.displayTitle}
                                </span>
                                <span 
                                  className={`wizard-check-circle ${isSelected ? 'wizard-check-circle-active' : 'wizard-check-circle-inactive'}`}
                                  aria-hidden="true"
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                              </div>
                              <p className="wizard-card-desc">
                                {opt.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {errors.transportationCondition && (
                        <span style={{ fontSize: '13px', color: 'var(--color-error, #B02020)', marginTop: '8px', display: 'block', fontWeight: 600 }}>
                          {errors.transportationCondition}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================
                    STEP 4: PACKAGING REQUIREMENT (INTERACTIVE CARDS GRID)
                    ======================================================== */}
                {currentStep === 4 && (
                  <div className="wizard-step-content" key="step-4">
                    <div>
                      <label 
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: 600, 
                          color: 'var(--color-text-dark, #1F1F1F)',
                          display: 'block',
                          marginBottom: '10px'
                        }}
                      >
                        Primary Packaging Concern <span style={{ color: 'var(--color-error, #B02020)' }}>*</span>
                      </label>

                      <div className="wizard-cards-grid" role="radiogroup" aria-label="Primary Packaging Requirement">
                        {CONCERN_OPTIONS.map((opt) => {
                          const isSelected = formData.primaryConcern === opt.value;
                          return (
                            <button
                              type="button"
                              key={opt.value}
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setFormData({ ...formData, primaryConcern: opt.value });
                                if (errors.primaryConcern) {
                                  setErrors((prev) => ({ ...prev, primaryConcern: '' }));
                                  setErrorSummary(null);
                                }
                              }}
                              className={`wizard-interactive-card ${isSelected ? 'wizard-interactive-card-active' : ''}`}
                            >
                              <div className="wizard-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '18px' }} aria-hidden="true">{opt.icon}</span>
                                  <span className="wizard-card-title">
                                    {opt.displayTitle}
                                  </span>
                                </div>
                                <span 
                                  className={`wizard-check-circle ${isSelected ? 'wizard-check-circle-active' : 'wizard-check-circle-inactive'}`}
                                  aria-hidden="true"
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                              </div>
                              <p className="wizard-card-desc">
                                {opt.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {errors.primaryConcern && (
                        <span style={{ fontSize: '13px', color: 'var(--color-error, #B02020)', marginTop: '8px', display: 'block', fontWeight: 600 }}>
                          {errors.primaryConcern}
                        </span>
                      )}
                    </div>

                    {/* Specification Summary Review Card */}
                    <div className="wizard-review-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ECECEC', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy, #062B52)' }}>
                          Review Input Specification
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #555555)' }}>
                          Ready for evaluation
                        </span>
                      </div>

                      <div className="wizard-review-grid">
                        <div>
                          <div className="wizard-review-item-label">Food Product</div>
                          <div className="wizard-review-item-value">{commodityDisplayName}</div>
                        </div>
                        <div>
                          <div className="wizard-review-item-label">Storage Environment</div>
                          <div className="wizard-review-item-value">{formData.storageType} ({formData.storageTemperature}°C, {formData.relativeHumidity}% RH)</div>
                        </div>
                        <div>
                          <div className="wizard-review-item-label">Target Shelf Life</div>
                          <div className="wizard-review-item-value">{formData.targetShelfLifeValue} {formData.targetShelfLifeUnit}</div>
                        </div>
                        <div>
                          <div className="wizard-review-item-label">Transportation</div>
                          <div className="wizard-review-item-value">{formData.transportationCondition}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    NAVIGATION ACTIONS (DESKTOP & MOBILE RESPONSIVE)
                    ======================================================== */}
                <div className="wizard-actions">
                  {/* Back / Return Action */}
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleBack}
                    id={currentStep === 1 ? 'back-to-home-btn' : `wizard-back-step${currentStep}-btn`}
                    fullWidthOnMobile
                  >
                    {currentStep === 1 ? '← Back to Home' : '← Back'}
                  </Button>

                  {/* Forward / Submit Action */}
                  {currentStep < 4 ? (
                    <Button 
                      type="button" 
                      variant="primary"
                      onClick={handleNext}
                      id={`wizard-next-step${currentStep}-btn`}
                      fullWidthOnMobile
                    >
                      Continue →
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      variant="primary"
                      id="submit-food-details-btn"
                      disabled={isSubmitting || isLoading}
                      fullWidthOnMobile
                      style={{
                        backgroundColor: 'var(--color-primary-navy, #062B52)',
                        fontWeight: 700,
                      }}
                    >
                      Get Recommendations →
                    </Button>
                  )}
                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </main>
  );
};
