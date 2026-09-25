import React, { useState } from 'react';
import { ILLUSTRATIVE_COMMODITIES } from '../data/commodities';
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

interface FoodDetailsProps {
  initialData: FoodDetailsFormData;
  onSubmit: (data: FoodDetailsFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const FoodDetails: React.FC<FoodDetailsProps> = ({
  initialData,
  onSubmit,
  onBack,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FoodDetailsFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.commodityId) {
      newErrors.commodityId = 'Select a food commodity.';
    }

    const mc = Number(formData.moistureContent);
    if (formData.moistureContent === '' || isNaN(mc) || mc < 0 || mc > 100) {
      newErrors.moistureContent = 'Enter a valid moisture percentage (0 - 100%).';
    }

    const phVal = Number(formData.ph);
    if (formData.ph === '' || isNaN(phVal) || phVal < 0 || phVal > 14) {
      newErrors.ph = 'Enter a valid pH value between 0.0 and 14.0.';
    }

    const shelfLife = Number(formData.targetShelfLifeValue);
    if (!formData.targetShelfLifeValue || isNaN(shelfLife) || shelfLife <= 0) {
      newErrors.targetShelfLifeValue = 'Target shelf life must be a positive number.';
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const sensitivityOptions: MoistureSensitivity[] = ['Low', 'Medium', 'High'];
  const fatOptions: OilFatContent[] = ['Low', 'Medium', 'High'];
  const storageOptions: StorageType[] = ['Ambient', 'Chilled', 'Frozen'];

  return (
    <main style={{ flex: 1, padding: '36px 0 54px' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        
        {/* Page Heading */}
        <div style={{ marginBottom: '24px' }}>
          <h1 
            style={{ 
              fontSize: '30px', 
              fontWeight: 700,
              color: 'var(--color-primary-navy, #062B52)',
              marginBottom: '6px' 
            }}
          >
            Food & Storage Details
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary, #555555)' }}>
            Enter food commodity characteristics, environmental storage conditions, and transportation requirements.
          </p>
        </div>

        {/* Form Container */}
        <form 
          onSubmit={handleSubmit}
          noValidate
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border-grey, #D0D0D0)',
            borderRadius: 'var(--radius-box, 3px)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          {/* Section 1: Food Commodity Information */}
          <div>
            <h2 
              style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                color: 'var(--color-primary-navy, #062B52)', 
                paddingBottom: '8px', 
                borderBottom: '1px solid var(--color-border-grey, #D0D0D0)',
                marginBottom: '18px' 
              }}
            >
              1. Food Commodity Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Field 1: Commodity Selection */}
              <div>
                <SelectField
                  id="food-commodity-select"
                  label="Food Commodity"
                  required
                  value={formData.commodityId}
                  onChange={handleCommodityChange}
                  error={errors.commodityId}
                  placeholder="Select a commodity category..."
                  options={ILLUSTRATIVE_COMMODITIES.map((c) => ({
                    value: c.id,
                    label: `${c.name} [${c.category}]`,
                  }))}
                />
              </div>

              {/* 2-Column Grid for Commodity Properties */}
              <div 
                className="gov-grid-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '18px 24px',
                }}
              >
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
                      if (errors.moistureContent) setErrors({ ...errors, moistureContent: '' });
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
                  <div style={{ display: 'flex', gap: '6px', height: '42px' }}>
                    {sensitivityOptions.map((opt) => {
                      const isSelected = formData.moistureSensitivity === opt;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setFormData({ ...formData, moistureSensitivity: opt })}
                          style={{
                            flex: 1,
                            backgroundColor: isSelected ? 'var(--color-primary-navy, #062B52)' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : 'var(--color-text-dark, #1F1F1F)',
                            border: `1px solid ${isSelected ? 'var(--color-primary-navy, #062B52)' : 'var(--color-border-box, #C8C8C8)'}`,
                            borderRadius: 'var(--radius-box, 3px)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
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
                  <div style={{ display: 'flex', gap: '6px', height: '42px' }}>
                    {fatOptions.map((opt) => {
                      const isSelected = formData.oilFatContent === opt;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setFormData({ ...formData, oilFatContent: opt })}
                          style={{
                            flex: 1,
                            backgroundColor: isSelected ? 'var(--color-primary-navy, #062B52)' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : 'var(--color-text-dark, #1F1F1F)',
                            border: `1px solid ${isSelected ? 'var(--color-primary-navy, #062B52)' : 'var(--color-border-box, #C8C8C8)'}`,
                            borderRadius: 'var(--radius-box, 3px)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
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
                      if (errors.ph) setErrors({ ...errors, ph: '' });
                    }}
                    error={errors.ph}
                    placeholder="e.g. 6.5"
                  />
                </div>

                {/* Field 6: Respiration Rate */}
                <div style={{ gridColumn: 'span 2' }}>
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
            </div>
          </div>

          {/* Section 2: Shelf Life and Storage Conditions */}
          <div>
            <h2 
              style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                color: 'var(--color-primary-navy, #062B52)', 
                paddingBottom: '8px', 
                borderBottom: '1px solid var(--color-border-grey, #D0D0D0)',
                marginBottom: '18px' 
              }}
            >
              2. Shelf Life and Storage Conditions
            </h2>

            <div 
              className="gov-grid-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '18px 24px',
              }}
            >
              {/* Field 7: Target Shelf Life */}
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
                        if (errors.targetShelfLifeValue) setErrors({ ...errors, targetShelfLifeValue: '' });
                      }}
                      placeholder="e.g. 90"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        backgroundColor: '#FFFFFF',
                        border: `1px solid ${errors.targetShelfLifeValue ? 'var(--color-error-border, #D18282)' : 'var(--color-border-box, #C8C8C8)'}`,
                        borderRadius: 'var(--radius-box, 3px)',
                        color: 'var(--color-text-dark, #1F1F1F)',
                        fontSize: '15px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1.2 }}>
                    <select
                      id="shelf-life-unit-select"
                      value={formData.targetShelfLifeUnit}
                      onChange={(e) => setFormData({ ...formData, targetShelfLifeUnit: e.target.value as ShelfLifeUnit })}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border-box, #C8C8C8)',
                        borderRadius: 'var(--radius-box, 3px)',
                        color: 'var(--color-text-dark, #1F1F1F)',
                        fontSize: '15px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Days">Days</option>
                      <option value="Weeks">Weeks</option>
                      <option value="Months">Months</option>
                    </select>
                  </div>
                </div>
                {errors.targetShelfLifeValue && (
                  <span style={{ fontSize: '13px', color: 'var(--color-error, #B02020)', marginTop: '2px', display: 'block', fontWeight: 600 }}>
                    {errors.targetShelfLifeValue}
                  </span>
                )}
              </div>

              {/* Field 8: Storage Type */}
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
                  Storage Type <span style={{ color: 'var(--color-error, #B02020)' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '6px', height: '42px' }}>
                  {storageOptions.map((opt) => {
                    const isSelected = formData.storageType === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => {
                          let newTemp = formData.storageTemperature;
                          if (opt === 'Frozen' && (newTemp === '' || Number(newTemp) > -5)) newTemp = -18;
                          if (opt === 'Chilled' && (newTemp === '' || Number(newTemp) > 10 || Number(newTemp) < 0)) newTemp = 4;
                          if (opt === 'Ambient' && (newTemp === '' || Number(newTemp) < 15)) newTemp = 25;
                          setFormData({ ...formData, storageType: opt, storageTemperature: newTemp });
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: isSelected ? 'var(--color-primary-navy, #062B52)' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text-dark, #1F1F1F)',
                          border: `1px solid ${isSelected ? 'var(--color-primary-navy, #062B52)' : 'var(--color-border-box, #C8C8C8)'}`,
                          borderRadius: 'var(--radius-box, 3px)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 9: Storage Temperature */}
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
                    if (errors.storageTemperature) setErrors({ ...errors, storageTemperature: '' });
                  }}
                  error={errors.storageTemperature}
                  placeholder="e.g. 25"
                />
              </div>

              {/* Field 10: Relative Humidity */}
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
                    if (errors.relativeHumidity) setErrors({ ...errors, relativeHumidity: '' });
                  }}
                  error={errors.relativeHumidity}
                  placeholder="e.g. 60"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Transportation and Packaging Requirements */}
          <div>
            <h2 
              style={{ 
                fontSize: '20px', 
                fontWeight: 700, 
                color: 'var(--color-primary-navy, #062B52)', 
                paddingBottom: '8px', 
                borderBottom: '1px solid var(--color-border-grey, #D0D0D0)',
                marginBottom: '18px' 
              }}
            >
              3. Transportation and Packaging Requirements
            </h2>

            <div 
              className="gov-grid-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '18px 24px',
              }}
            >
              {/* Field 11: Transportation Conditions */}
              <div>
                <SelectField
                  id="transportation-condition-select"
                  label="Transportation Conditions"
                  required
                  value={formData.transportationCondition}
                  onChange={(e) => setFormData({ ...formData, transportationCondition: e.target.value as TransportationCondition })}
                  options={[
                    { value: 'Normal Transportation', label: 'Normal Transportation' },
                    { value: 'Refrigerated Transportation', label: 'Refrigerated Transportation' },
                    { value: 'Frozen Transportation', label: 'Frozen Transportation' },
                    { value: 'Long-Distance Transportation', label: 'Long-Distance Transportation' },
                    { value: 'High Vibration / Mechanical Stress', label: 'High Vibration / Mechanical Stress' },
                    { value: 'Not Specified', label: 'Not Specified' },
                  ]}
                />
              </div>

              {/* Field 12: Primary Packaging Concern */}
              <div>
                <SelectField
                  id="primary-packaging-concern-select"
                  label="Primary Packaging Concern"
                  required
                  value={formData.primaryConcern}
                  onChange={(e) => setFormData({ ...formData, primaryConcern: e.target.value as PrimaryConcern })}
                  options={[
                    { value: 'Moisture Protection', label: 'Moisture Protection' },
                    { value: 'Oxygen Protection', label: 'Oxygen Protection' },
                    { value: 'Light Protection', label: 'Light Protection' },
                    { value: 'Mechanical Strength', label: 'Mechanical Strength' },
                    { value: 'Temperature Resistance', label: 'Temperature Resistance' },
                    { value: 'Extended Shelf Life', label: 'Extended Shelf Life' },
                    { value: 'Cost Efficiency', label: 'Cost Efficiency' },
                    { value: 'Sustainability', label: 'Sustainability' },
                    { value: 'Gas Exchange / Respiration', label: 'Gas Exchange / Respiration' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border-grey, #D0D0D0)',
              marginTop: '4px'
            }}
          >
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onBack}
              id="back-to-home-btn"
            >
              Back to Home
            </Button>

            <Button 
              type="submit" 
              variant="primary"
              id="submit-food-details-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Evaluating Criteria...' : 'Continue to Recommendations'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};
