import type { 
  FoodDetailsFormData, 
  PackagingMaterialData,
  RecommendationOutput, 
  RecommendationStatus,
  StorageType,
  TransportationCondition,
  PrimaryConcern
} from '../types/recommendation';
import { ILLUSTRATIVE_MATERIALS } from '../data/mockMaterials';
import { ILLUSTRATIVE_COMMODITIES } from '../data/commodities';
import { supabase, isSupabaseReady } from '../lib/supabase';

export interface RecommendationRule {
  id: string;
  ruleName: string;
  commodityCategory: string | null;
  storageType: StorageType | null;
  minShelfLifeDays: number;
  maxShelfLifeDays: number | null;
  requiresBreathability: boolean;
  applicableTransportation: TransportationCondition[] | null;
  applicableConcerns: PrimaryConcern[] | null;
  suitableMaterialId: string;
  recommendationStatus: RecommendationStatus;
  primaryReason: string;
  technicalNote?: string;
  priorityOrder: number;
  isActive: boolean;
}

export interface RecommendationResult {
  recommendations: RecommendationOutput[];
  source: 'supabase' | 'local_fallback';
  error?: string;
}

/**
 * Strips the boilerplate demo disclaimer sentence from notes, preserving any useful engineering content.
 * Returns undefined if no meaningful text remains to avoid displaying empty note boxes.
 */
export function cleanNoteText(note?: string | null): string | undefined {
  if (!note) return undefined;
  const cleaned = note
    .replace(/Initial rule-based demo coverage\s*[—-]\s*requires technical validation(\s*before commercial application)?\.?\s*/gi, '')
    .trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Seed rules mirroring the PostgreSQL/Supabase recommendation_rules table.
 * All rules use exact typed categories, transportation conditions, and concerns from the UI.
 */
export const RECOMMENDATION_RULES: RecommendationRule[] = [
  // 1. Fresh Fruits - Ventilated Micro-perf
  {
    id: 'rule-fruits-microperf',
    ruleName: 'Fresh Fruits Respiration Ventilation',
    commodityCategory: 'Fresh Fruits',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 30,
    requiresBreathability: true,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation'],
    applicableConcerns: ['Gas Exchange / Respiration', 'Moisture Protection', 'Extended Shelf Life'],
    suitableMaterialId: 'micro-perf-pp',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Perforated structure facilitates controlled oxygen and carbon dioxide exchange, preventing anaerobic decay and moisture condensation in respiring fresh fruits.',
    technicalNote: 'Perforation density must be engineered to specific fruit respiration rate and target equilibrium atmosphere.',
    priorityOrder: 1,
    isActive: true,
  },
  // 2. Fresh Fruits - Rigid HDPE Bulk Crate
  {
    id: 'rule-fruits-hdpe-crate',
    ruleName: 'Fresh Fruits Bulk Rigidity',
    commodityCategory: 'Fresh Fruits',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 30,
    requiresBreathability: true,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Gas Exchange / Respiration', 'Mechanical Strength'],
    suitableMaterialId: 'hdpe-monofilm',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'Rigid polyolefin structure provides high impact protection for bulk fruit transit when configured with macroscopic ventilation openings.',
    technicalNote: 'Ventilation openings must be physically die-cut to prevent produce suffocation.',
    priorityOrder: 2,
    isActive: true,
  },
  // 3. Fresh Vegetables - Micro-perforated Film
  {
    id: 'rule-veg-microperf',
    ruleName: 'Fresh Vegetables Aerobic Respiration',
    commodityCategory: 'Fresh Vegetables',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 21,
    requiresBreathability: true,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation'],
    applicableConcerns: ['Gas Exchange / Respiration', 'Moisture Protection'],
    suitableMaterialId: 'micro-perf-pp',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Micro-perforations maintain aerobic respiration and prevent water fogging and anaerobic rot inside salad and leafy vegetable packaging.',
    technicalNote: 'High transpiration rates require anti-fog surfactant coatings alongside perforation.',
    priorityOrder: 1,
    isActive: true,
  },
  // 4. Fresh Vegetables - Ventilated HDPE
  {
    id: 'rule-veg-hdpe',
    ruleName: 'Fresh Vegetables Wholesale Rigidity',
    commodityCategory: 'Fresh Vegetables',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 21,
    requiresBreathability: true,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Gas Exchange / Respiration', 'Mechanical Strength'],
    suitableMaterialId: 'hdpe-monofilm',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'Perforated mono-material polyolefin provides structural rigidity and moisture resistance for wholesale vegetable handling.',
    technicalNote: 'Vent holes mandatory to prevent anaerobic off-odor development.',
    priorityOrder: 2,
    isActive: true,
  },
  // 5. Frozen Food - HDPE Mono-material
  {
    id: 'rule-frozen-hdpe',
    ruleName: 'Frozen Ductile Cold Resistance',
    commodityCategory: 'Frozen Food',
    storageType: 'Frozen',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 365,
    requiresBreathability: false,
    applicableTransportation: ['Frozen Transportation', 'Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Temperature Resistance', 'Moisture Protection', 'Sustainability', 'Cost Efficiency'],
    suitableMaterialId: 'hdpe-monofilm',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Maintains ductile impact strength and seal integrity without cold embrittlement down to -40°C in mono-material recycling streams.',
    technicalNote: 'Verify puncture resistance if frozen product contains sharp contours.',
    priorityOrder: 1,
    isActive: true,
  },
  // 6. Frozen Food - EVOH Oxygen Shield
  {
    id: 'rule-frozen-evoh',
    ruleName: 'Frozen Lipid Oxidation Protection',
    commodityCategory: 'Frozen Food',
    storageType: 'Frozen',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 365,
    requiresBreathability: false,
    applicableTransportation: ['Frozen Transportation', 'Normal Transportation'],
    applicableConcerns: ['Oxygen Protection', 'Temperature Resistance', 'Extended Shelf Life'],
    suitableMaterialId: 'evoh-multilayer-pe',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Provides high oxygen barrier under low temperatures, delaying lipid rancidity and freezer burn during extended frozen storage.',
    technicalNote: 'Seal layer thickness must ensure hermetic integrity under thermal contraction.',
    priorityOrder: 2,
    isActive: true,
  },
  // 7. Frozen Food - OPA/CPP Puncture Shield
  {
    id: 'rule-frozen-opa',
    ruleName: 'Frozen Puncture Resistance',
    commodityCategory: 'Frozen Food',
    storageType: 'Frozen',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 365,
    requiresBreathability: false,
    applicableTransportation: ['Frozen Transportation', 'Long-Distance Transportation', 'High Vibration / Mechanical Stress'],
    applicableConcerns: ['Mechanical Strength', 'Temperature Resistance'],
    suitableMaterialId: 'opa-cpp-laminate',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'Delivers exceptional puncture and pinhole resistance against abrasive frozen contours during transit and rough handling.',
    technicalNote: 'Verify low-temperature seal initiation temperature on packaging lines.',
    priorityOrder: 3,
    isActive: true,
  },
  // 8. Snacks - Metallized BOPP Moisture Barrier
  {
    id: 'rule-snack-met-bopp',
    ruleName: 'Dry Snack Ambient Moisture Barrier',
    commodityCategory: 'Snacks',
    storageType: 'Ambient',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 180,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Moisture Protection', 'Light Protection', 'Cost Efficiency', 'Extended Shelf Life'],
    suitableMaterialId: 'bopp-met-cpp',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Balanced moisture vapor and visible light barrier preserves crispness and delays oxidative rancidity in fried and dehydrated snack foods.',
    technicalNote: 'Verify seal hermeticity along lap and fin seals.',
    priorityOrder: 1,
    isActive: true,
  },
  // 9. Snacks - Transparent PET-AlOx Barrier
  {
    id: 'rule-snack-pet-alox',
    ruleName: 'Dry Snack Transparent Barrier',
    commodityCategory: 'Snacks',
    storageType: 'Ambient',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 180,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Moisture Protection', 'Oxygen Protection', 'Extended Shelf Life'],
    suitableMaterialId: 'pet-alox-pe',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'High-barrier transparent laminate permitting consumer product visibility while offering robust moisture and gas protection.',
    technicalNote: 'AlOx coating requires care during converting to avoid micro-cracks.',
    priorityOrder: 2,
    isActive: true,
  },
  // 10. Baked Goods - Metallized BOPP Moisture Barrier
  {
    id: 'rule-bakery-bopp',
    ruleName: 'Dry Bakery Ambient Moisture Barrier',
    commodityCategory: 'Baked Goods',
    storageType: 'Ambient',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 180,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Moisture Protection', 'Light Protection', 'Extended Shelf Life'],
    suitableMaterialId: 'bopp-met-cpp',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Protects low-moisture biscuits and crackers against ambient humidity ingress that causes textural softening.',
    priorityOrder: 1,
    isActive: true,
  },
  // 11. Baked Goods - Renewable Kraft / Bio-PBS
  {
    id: 'rule-bakery-kraft-pbs',
    ruleName: 'Renewable Short Shelf-life Ambient Bakery',
    commodityCategory: 'Baked Goods',
    storageType: 'Ambient',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 60,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation'],
    applicableConcerns: ['Sustainability', 'Cost Efficiency', 'Moisture Protection'],
    suitableMaterialId: 'kraft-bio-pbs',
    recommendationStatus: 'Requires Technical Validation',
    primaryReason: 'Bio-based dispersion coated paperboard suitable for short shelf-life dry bakery goods where renewable packaging is prioritized.',
    technicalNote: 'Moisture barrier diminishes in high ambient relative humidity (>75% RH).',
    priorityOrder: 2,
    isActive: true,
  },
  // 12. Dairy Products - Chilled EVOH High Oxygen Barrier
  {
    id: 'rule-dairy-chilled-evoh',
    ruleName: 'Chilled Dairy Oxygen Shield',
    commodityCategory: 'Dairy Products',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 30,
    requiresBreathability: false,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation'],
    applicableConcerns: ['Oxygen Protection', 'Extended Shelf Life', 'Moisture Protection'],
    suitableMaterialId: 'evoh-multilayer-pe',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'High oxygen barrier delays oxidative spoilage and aerobic fungal growth in chilled dairy products like paneer and curd.',
    technicalNote: 'Ensure outer polyolefin protects EVOH core from high humidity plastification.',
    priorityOrder: 1,
    isActive: true,
  },
  // 13. Dairy Powder - Aluminum Foil Hermetic Barrier
  {
    id: 'rule-dairy-powder-alu',
    ruleName: 'Hygroscopic Powder Hermetic Barrier',
    commodityCategory: 'Dairy Products',
    storageType: 'Ambient',
    minShelfLifeDays: 60,
    maxShelfLifeDays: 730,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Moisture Protection', 'Oxygen Protection', 'Light Protection', 'Extended Shelf Life'],
    suitableMaterialId: 'pet-alu-pe',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Hermetic aluminum foil laminate providing near-zero moisture and gas transmission for extended storage of hygroscopic milk powders.',
    technicalNote: 'Seal layer thickness must prevent microscopic pinholes during pouch formation.',
    priorityOrder: 1,
    isActive: true,
  },
  // 14. Meat Products - Chilled EVOH Oxygen Barrier
  {
    id: 'rule-meat-chilled-evoh',
    ruleName: 'Chilled Meat Oxygen Shield',
    commodityCategory: 'Meat Products',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 30,
    requiresBreathability: false,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation'],
    applicableConcerns: ['Oxygen Protection', 'Extended Shelf Life'],
    suitableMaterialId: 'evoh-multilayer-pe',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Low oxygen permeability prevents rapid microbial growth and metmyoglobin brown discoloration in chilled meat.',
    technicalNote: 'Compatible with modified atmosphere packaging (MAP) gas mixtures.',
    priorityOrder: 1,
    isActive: true,
  },
  // 15. Meat Products - Chilled Transparent Barrier
  {
    id: 'rule-meat-pet-alox',
    ruleName: 'Chilled Meat Transparent Barrier',
    commodityCategory: 'Meat Products',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 30,
    requiresBreathability: false,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation'],
    applicableConcerns: ['Oxygen Protection', 'Moisture Protection'],
    suitableMaterialId: 'pet-alox-pe',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'Transparent high-gas-barrier top web enabling clear product visibility for retail chilled meats while preventing drying.',
    priorityOrder: 2,
    isActive: true,
  },
  // 16. Fish and Seafood - Chilled EVOH Barrier
  {
    id: 'rule-fish-chilled-evoh',
    ruleName: 'Chilled Seafood Oxygen Barrier',
    commodityCategory: 'Fish and Seafood',
    storageType: 'Chilled',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 14,
    requiresBreathability: false,
    applicableTransportation: ['Refrigerated Transportation', 'Normal Transportation'],
    applicableConcerns: ['Oxygen Protection', 'Extended Shelf Life'],
    suitableMaterialId: 'evoh-multilayer-pe',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Gas-tight barrier preserves freshness and restricts oxygen contact to slow lipid oxidation in fatty and lean fish.',
    technicalNote: 'Strict cold chain maintenance (<3°C) required to prevent anaerobic bacterial development.',
    priorityOrder: 1,
    isActive: true,
  },
  // 17. Cereals and Grains - Ambient HDPE Moisture Barrier
  {
    id: 'rule-grains-hdpe',
    ruleName: 'Grain Moisture and Infestation Barrier',
    commodityCategory: 'Cereals and Grains',
    storageType: 'Ambient',
    minShelfLifeDays: 30,
    maxShelfLifeDays: 730,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Moisture Protection', 'Cost Efficiency', 'Sustainability'],
    suitableMaterialId: 'hdpe-monofilm',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Water vapor barrier protects bulk grains from ambient humidity migration that induces mold growth and infestation.',
    technicalNote: 'Fully compatible with mono-material PE recycling streams.',
    priorityOrder: 1,
    isActive: true,
  },
  // 18. Pulses - OPA/CPP Puncture Resistance
  {
    id: 'rule-pulses-opa',
    ruleName: 'Pulses Puncture-Resistant Laminate',
    commodityCategory: 'Pulses',
    storageType: 'Ambient',
    minShelfLifeDays: 30,
    maxShelfLifeDays: 730,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation', 'High Vibration / Mechanical Stress'],
    applicableConcerns: ['Mechanical Strength', 'Moisture Protection'],
    suitableMaterialId: 'opa-cpp-laminate',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Biaxially oriented polyamide outer layer prevents punctures from sharp, dry pulse edges during packing and stacking.',
    priorityOrder: 1,
    isActive: true,
  },
  // 19. Pulses - HDPE Moisture Barrier
  {
    id: 'rule-pulses-hdpe',
    ruleName: 'Pulses Economy Moisture Barrier',
    commodityCategory: 'Pulses',
    storageType: 'Ambient',
    minShelfLifeDays: 30,
    maxShelfLifeDays: 730,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation'],
    applicableConcerns: ['Cost Efficiency', 'Moisture Protection', 'Sustainability'],
    suitableMaterialId: 'hdpe-monofilm',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'Economical mono-material barrier film providing moisture protection for standard retail pulse packaging.',
    priorityOrder: 2,
    isActive: true,
  },
  // 20. Spices - Aluminum Foil Aromatics Shield
  {
    id: 'rule-spices-alu',
    ruleName: 'Spices Total Aroma and Light Shield',
    commodityCategory: 'Spices',
    storageType: 'Ambient',
    minShelfLifeDays: 30,
    maxShelfLifeDays: 730,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Light Protection', 'Oxygen Protection', 'Moisture Protection', 'Extended Shelf Life'],
    suitableMaterialId: 'pet-alu-pe',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'Foil barrier prevents photo-oxidation and escape of aromatic essential oils and color pigments in whole and ground spices.',
    priorityOrder: 1,
    isActive: true,
  },
  // 21. Spices - Metallized BOPP Barrier
  {
    id: 'rule-spices-met-bopp',
    ruleName: 'Spices Economy Light and Moisture Barrier',
    commodityCategory: 'Spices',
    storageType: 'Ambient',
    minShelfLifeDays: 30,
    maxShelfLifeDays: 365,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation'],
    applicableConcerns: ['Light Protection', 'Moisture Protection', 'Cost Efficiency'],
    suitableMaterialId: 'bopp-met-cpp',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'Cost-effective metallized laminate offering good light and moisture shielding for retail spice pouches.',
    priorityOrder: 2,
    isActive: true,
  },
  // 22. Dedicated Heavy Transit Rule - STRICTLY SCOPED to Mechanical Stress & Long-Distance
  {
    id: 'rule-transit-opa',
    ruleName: 'Heavy-Duty Transit Puncture Shield',
    commodityCategory: null, // Universal non-produce under rugged transit
    storageType: 'Ambient',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 730,
    requiresBreathability: false,
    applicableTransportation: ['High Vibration / Mechanical Stress', 'Long-Distance Transportation'],
    applicableConcerns: ['Mechanical Strength'],
    suitableMaterialId: 'opa-cpp-laminate',
    recommendationStatus: 'Recommended for Evaluation',
    primaryReason: 'High flex-crack resistance and burst strength engineered for severe transit vibration and prolonged distribution stress.',
    technicalNote: 'Restricted strictly to rugged transit conditions and non-respiring commodities.',
    priorityOrder: 1,
    isActive: true,
  },
  // 23. Other / General Custom Food Commodity
  {
    id: 'rule-other-ambient-hdpe',
    ruleName: 'General Commodity Moisture Barrier',
    commodityCategory: 'Other',
    storageType: 'Ambient',
    minShelfLifeDays: 1,
    maxShelfLifeDays: 180,
    requiresBreathability: false,
    applicableTransportation: ['Normal Transportation', 'Long-Distance Transportation'],
    applicableConcerns: ['Moisture Protection', 'Cost Efficiency'],
    suitableMaterialId: 'hdpe-monofilm',
    recommendationStatus: 'Potentially Suitable',
    primaryReason: 'Standard polyolefin packaging providing foundational moisture resistance for general shelf-stable commodities.',
    priorityOrder: 2,
    isActive: true,
  }
];

/**
 * Fetches active data directly from Supabase tables:
 * - packaging_materials
 * - material_barrier_properties
 * - food_commodities
 * - recommendation_rules
 */
async function fetchActiveDataFromSupabase(): Promise<{
  rules: RecommendationRule[];
  materials: PackagingMaterialData[];
} | null> {
  if (!isSupabaseReady() || !supabase) {
    return null;
  }

  try {
    const [materialsRes, propertiesRes, rulesRes] = await Promise.all([
      supabase.from('packaging_materials').select('*').eq('is_active', true),
      supabase.from('material_barrier_properties').select('*'),
      supabase.from('recommendation_rules').select('*').eq('is_active', true).order('priority_order', { ascending: true })
    ]);

    if (materialsRes.error || rulesRes.error) {
      console.warn('Supabase fetch error:', materialsRes.error || rulesRes.error);
      return null;
    }

    if (!materialsRes.data || materialsRes.data.length === 0 || !rulesRes.data || rulesRes.data.length === 0) {
      return null;
    }

    // Index properties by material_id
    const propertiesMap = new Map<string, Record<string, any>>();
    if (propertiesRes.data) {
      for (const p of propertiesRes.data) {
        propertiesMap.set(p.material_id, p);
      }
    }

    // Map database materials to UI format
    const dbMaterials: PackagingMaterialData[] = materialsRes.data.map(m => {
      const prop = propertiesMap.get(m.id);
      // Fallback to local properties summary if qualitative text is present
      const localMat = ILLUSTRATIVE_MATERIALS.find(lm => lm.id === m.id);

      return {
        id: m.id,
        code: m.code || localMat?.code,
        name: m.name,
        category: m.category,
        propertiesSummary: localMat?.propertiesSummary || {
          moistureBarrier: prop?.wvtr_value != null ? `${prop.wvtr_value} ${prop.wvtr_unit || 'g/m²/day'}` : (prop?.wvtr_test_condition || 'Standard barrier'),
          oxygenBarrier: prop?.otr_value != null ? `${prop.otr_value} ${prop.otr_unit || 'cc/m²/day/atm'}` : (prop?.otr_test_condition || 'Standard barrier'),
          punctureResistance: prop?.puncture_resistance || 'Standard',
          operatingTemperature: prop?.temp_min_c != null && prop?.temp_max_c != null ? `${prop.temp_min_c}°C to ${prop.temp_max_c}°C` : 'Ambient operating range',
        },
        applicabilityNotes: m.description,
        isIllustrative: true,
        sourceTitle: m.source_title !== undefined ? m.source_title : (localMat?.sourceTitle ?? null),
        sourceUrl: m.source_url !== undefined ? m.source_url : (localMat?.sourceUrl ?? null),
        sourcePage: m.source_page !== undefined ? m.source_page : (localMat?.sourcePage ?? null),
        verificationStatus: (m.verification_status !== undefined ? m.verification_status : localMat?.verificationStatus) ?? 'not_available',
        lastVerifiedAt: m.last_verified_at !== undefined ? m.last_verified_at : (localMat?.lastVerifiedAt ?? null),
      };
    });

    // Map database rules to UI format, cleaning any boilerplate disclaimer notes
    const dbRules: RecommendationRule[] = rulesRes.data.map(r => ({
      id: r.id,
      ruleName: r.rule_name,
      commodityCategory: r.commodity_category,
      storageType: r.storage_type as StorageType | null,
      minShelfLifeDays: r.min_shelf_life_days,
      maxShelfLifeDays: r.max_shelf_life_days,
      requiresBreathability: Boolean(r.requires_breathability),
      applicableTransportation: r.applicable_transportation as TransportationCondition[] | null,
      applicableConcerns: r.applicable_concerns as PrimaryConcern[] | null,
      suitableMaterialId: r.suitable_material_id,
      recommendationStatus: r.recommendation_status as RecommendationStatus,
      primaryReason: r.primary_reason,
      technicalNote: cleanNoteText(r.technical_note),
      priorityOrder: r.priority_order,
      isActive: Boolean(r.is_active),
    }));

    return { rules: dbRules, materials: dbMaterials };
  } catch (err) {
    console.warn('Network or client failure querying Supabase, using local fallback:', err);
    return null;
  }
}

/**
 * Pure evaluation engine applied to any valid rule and material set.
 */
function runRuleScreening(
  formData: FoodDetailsFormData,
  rules: RecommendationRule[],
  materials: PackagingMaterialData[]
): RecommendationOutput[] {
  // 1. Calculate normalized shelf-life days
  let shelfLifeDays = Number(formData.targetShelfLifeValue || 0);
  if (formData.targetShelfLifeUnit === 'Weeks') {
    shelfLifeDays *= 7;
  } else if (formData.targetShelfLifeUnit === 'Months') {
    shelfLifeDays *= 30;
  }

  // 2. Resolve commodity category
  const selectedCommodity = ILLUSTRATIVE_COMMODITIES.find(c => c.id === formData.commodityId);
  const commodityCategory = selectedCommodity ? selectedCommodity.category : 'Other';

  // 3. Determine if breathability is required
  const requiresBreathability = 
    commodityCategory === 'Fresh Fruits' ||
    commodityCategory === 'Fresh Vegetables' ||
    (formData.respirationRate && formData.respirationRate !== 'Not Applicable') ||
    formData.primaryConcern === 'Gas Exchange / Respiration';

  // 4. Filter active rules against criteria
  const matchingRules = rules.filter(rule => {
    // Active rule check
    if (!rule.isActive) return false;

    // Commodity category match (if rule specifies category, must match)
    if (rule.commodityCategory !== null && rule.commodityCategory !== commodityCategory) {
      return false;
    }

    // Storage type match
    if (rule.storageType !== null && rule.storageType !== formData.storageType) {
      return false;
    }

    // Shelf life range match
    if (shelfLifeDays > 0) {
      if (shelfLifeDays < rule.minShelfLifeDays) return false;
      if (rule.maxShelfLifeDays !== null && shelfLifeDays > rule.maxShelfLifeDays) return false;
    }

    // Breathability constraint match
    if (rule.requiresBreathability !== requiresBreathability) {
      return false;
    }

    // Transportation condition match (array matching)
    if (rule.applicableTransportation !== null) {
      if (formData.transportationCondition !== 'Not Specified' && 
          !rule.applicableTransportation.includes(formData.transportationCondition)) {
        return false;
      }
    }

    // Applicable concern match (array matching)
    if (rule.applicableConcerns !== null) {
      if (!rule.applicableConcerns.includes(formData.primaryConcern)) {
        return false;
      }
    }

    return true;
  });

  // 5. Build recommendation outputs
  const candidateOutputs: RecommendationOutput[] = [];
  const seenMaterialIds = new Set<string>();

  // Sort matched rules by priorityOrder ascending
  const sortedRules = [...matchingRules].sort((a, b) => a.priorityOrder - b.priorityOrder);

  for (const rule of sortedRules) {
    if (seenMaterialIds.has(rule.suitableMaterialId)) continue;

    const material = materials.find(m => m.id === rule.suitableMaterialId);
    if (!material) continue;

    // 6. Hard safety guardrail for respiring fresh produce
    if (requiresBreathability) {
      const highBarrierMaterials = [
        'evoh-multilayer-pe', 
        'pet-alu-pe', 
        'bopp-met-cpp', 
        'pet-alox-pe'
      ];
      if (highBarrierMaterials.includes(material.id)) {
        continue; // REJECT: Suffocation risk for living plant tissue
      }
    }

    seenMaterialIds.add(rule.suitableMaterialId);
    const cleanedNote = cleanNoteText(rule.technicalNote);

    const requirementMatches = {
      commodity: rule.commodityCategory 
        ? `${commodityCategory} (Targeted rule)`
        : `${commodityCategory} (Universal rule for non-produce)`,
      storageCondition: `${formData.storageType} storage (${rule.storageType ? 'Rule specifies ' + rule.storageType : 'Universal storage profile'})`,
      transportationCondition: formData.transportationCondition !== 'Not Specified'
        ? `${formData.transportationCondition} (${rule.applicableTransportation ? 'Matched permitted transit' : 'Universal transit profile'})`
        : 'Not Specified (General transit compatibility)',
      shelfLife: `${shelfLifeDays} days (Satisfies rule window: ${rule.minShelfLifeDays}${rule.maxShelfLifeDays ? '–' + rule.maxShelfLifeDays : '+'} days)`,
      moistureProtection: formData.primaryConcern === 'Moisture Protection'
        ? 'Moisture protection prioritized (Matches material barrier)'
        : `Moisture sensitivity: ${formData.moistureSensitivity || 'Standard'} (Primary concern: ${formData.primaryConcern})`,
      gasExchange: requiresBreathability
        ? 'Active aerobic respiration — Requires permeable/ventilated packaging'
        : 'Non-respiring commodity — Hermetic barrier permissible',
    };

    candidateOutputs.push({
      material,
      status: rule.recommendationStatus,
      primaryReason: rule.primaryReason,
      technicalNote: cleanedNote,
      requirementMatches,
    });
  }

  // 7. Status-based sorting
  const statusRank: Record<RecommendationStatus, number> = {
    'Recommended for Evaluation': 1,
    'Potentially Suitable': 2,
    'Requires Technical Validation': 3,
  };

  return candidateOutputs.sort((a, b) => (statusRank[a.status] || 99) - (statusRank[b.status] || 99));
}

/**
 * Asynchronously evaluates recommendations using live Supabase data if available,
 * gracefully falling back to the local rule dataset if Supabase is unreachable or unconfigured.
 */
export async function getPackagingRecommendations(
  formData: FoodDetailsFormData
): Promise<RecommendationResult> {
  const remoteData = await fetchActiveDataFromSupabase();

  if (remoteData && remoteData.rules.length > 0 && remoteData.materials.length > 0) {
    const results = runRuleScreening(formData, remoteData.rules, remoteData.materials);
    return {
      recommendations: results,
      source: 'supabase',
    };
  }

  // Graceful fallback to verified local dataset
  const fallbackResults = runRuleScreening(formData, RECOMMENDATION_RULES, ILLUSTRATIVE_MATERIALS);
  return {
    recommendations: fallbackResults,
    source: 'local_fallback',
  };
}

/**
 * Synchronous evaluation function for immediate local evaluations and tests.
 */
export function evaluateRecommendations(
  formData: FoodDetailsFormData
): RecommendationOutput[] {
  return runRuleScreening(formData, RECOMMENDATION_RULES, ILLUSTRATIVE_MATERIALS);
}
