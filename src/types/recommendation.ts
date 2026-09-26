export type MoistureSensitivity = 'Low' | 'Medium' | 'High';
export type OilFatContent = 'Low' | 'Medium' | 'High';
export type RespirationRate = 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High' | 'Not Applicable';
export type ShelfLifeUnit = 'Days' | 'Weeks' | 'Months';
export type StorageType = 'Ambient' | 'Chilled' | 'Frozen';
export type TransportationCondition = 
  | 'Normal Transportation'
  | 'Refrigerated Transportation'
  | 'Frozen Transportation'
  | 'Long-Distance Transportation'
  | 'High Vibration / Mechanical Stress'
  | 'Not Specified';

export type PrimaryConcern = 
  | 'Moisture Protection'
  | 'Oxygen Protection'
  | 'Light Protection'
  | 'Mechanical Strength'
  | 'Temperature Resistance'
  | 'Extended Shelf Life'
  | 'Cost Efficiency'
  | 'Sustainability'
  | 'Gas Exchange / Respiration';

export interface FoodCommodityOption {
  id: string;
  name: string;
  category: string;
  defaultMoistureContent: number;
  defaultMoistureSensitivity: MoistureSensitivity;
  defaultOilFatContent: OilFatContent;
  defaultPh: number;
  defaultRespirationRate: RespirationRate;
  defaultStorageType: StorageType;
  defaultShelfLifeValue: number;
  defaultShelfLifeUnit: ShelfLifeUnit;
  defaultTemp: number;
  defaultHumidity: number;
  defaultTransportation: TransportationCondition;
  defaultConcern: PrimaryConcern;
  technicalDescription: string;
}

export interface FoodDetailsFormData {
  commodityId: string;
  moistureContent: number | string;
  moistureSensitivity: MoistureSensitivity;
  oilFatContent: OilFatContent;
  ph: number | string;
  respirationRate: RespirationRate;
  targetShelfLifeValue: number | string;
  targetShelfLifeUnit: ShelfLifeUnit;
  storageType: StorageType;
  storageTemperature: number | string;
  relativeHumidity: number | string;
  transportationCondition: TransportationCondition;
  primaryConcern: PrimaryConcern;
}

export type RecommendationStatus = 
  | 'Recommended for Evaluation'
  | 'Potentially Suitable'
  | 'Requires Technical Validation';

export interface PackagingMaterialData {
  id: string;
  code?: string;
  name: string;
  category: string;
  propertiesSummary: {
    moistureBarrier: string;
    oxygenBarrier: string;
    punctureResistance: string;
    operatingTemperature: string;
  };
  applicabilityNotes?: string;
  isIllustrative: boolean;
  sourceTitle?: string | null;
  sourceUrl?: string | null;
  sourcePage?: string | null;
  verificationStatus?: 'verified' | 'unverified' | 'not_available' | null;
  lastVerifiedAt?: string | null;
}

export interface RequirementMatchDetails {
  commodity: string;
  storageCondition: string;
  transportationCondition: string;
  shelfLife: string;
  moistureProtection: string;
  gasExchange: string;
}

export type NoMatchReasonCategory = 
  | 'CONFLICTING_REQUIREMENTS'
  | 'NO_MATERIAL_AVAILABLE'
  | 'INSUFFICIENT_DATA'
  | 'STORAGE_PRODUCT_INCOMPATIBILITY'
  | 'SHELF_LIFE_LIMITATION'
  | 'MULTIPLE_REQUIREMENTS_UNSATISFIED';

export interface NoMatchExplanation {
  category: NoMatchReasonCategory;
  userMessage: string;
  suggestedChanges: string[];
}

export interface RecommendationOutput {
  material: PackagingMaterialData;
  status: RecommendationStatus;
  primaryReason: string;
  technicalNote?: string;
  requirementMatches?: RequirementMatchDetails;
}
