import type { 
  FoodDetailsFormData, 
  PackagingMaterialData,
  RecommendationOutput, 
  RecommendationStatus,
  StorageType,
  TransportationCondition,
  PrimaryConcern,
  NoMatchExplanation
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
  noMatchExplanation?: NoMatchExplanation;
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
 * Evaluates candidate rules and packaging materials against user requirements using
 * transparent compatibility scoring rather than rigid exact-match parameter gating.
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

  // 3. Determine breathability (strictly for active respiring horticultural produce)
  const isRespiringCategory = commodityCategory === 'Fresh Fruits' || commodityCategory === 'Fresh Vegetables';
  const hasActiveRespiration = 
    formData.respirationRate === 'High' || 
    formData.respirationRate === 'Very High' || 
    formData.respirationRate === 'Moderate';
  const hasGasExchangeConcern = formData.primaryConcern === 'Gas Exchange / Respiration';

  const requiresBreathability = isRespiringCategory || hasActiveRespiration || hasGasExchangeConcern;

  // 4. Candidate evaluation
  interface ScoredCandidate {
    rule: RecommendationRule;
    material: PackagingMaterialData;
    score: number;
    isShelfLifeExtension?: boolean;
    matchDetails: {
      commodity: string;
      storageCondition: string;
      transportationCondition: string;
      shelfLife: string;
      moistureProtection: string;
      gasExchange: string;
    };
  }

  const candidates: ScoredCandidate[] = [];

  for (const rule of rules) {
    if (!rule.isActive) continue;

    const material = materials.find(m => m.id === rule.suitableMaterialId);
    if (!material) continue;

    // --- HARD SAFETY & PHYSICAL INCOMPATIBILITY REJECTIONS ---

    // Safety Guardrail 1: Fresh respiring produce suffocation prevention
    if (requiresBreathability) {
      // Produce must have a rule engineered for breathability
      if (!rule.requiresBreathability) continue;

      const highBarrierMaterials = [
        'evoh-multilayer-pe', 
        'pet-alu-pe', 
        'bopp-met-cpp', 
        'pet-alox-pe',
        'opa-cpp-laminate'
      ];
      if (highBarrierMaterials.includes(material.id)) {
        continue; // REJECT: Suffocation risk for living produce
      }
    }

    // Safety Guardrail 2: Do not recommend breathable/perforated film for non-respiring goods requiring moisture/gas barrier
    if (!requiresBreathability && (material.id === 'micro-perf-pp' || rule.requiresBreathability)) {
      continue; // REJECT: Perforations allow moisture/air ingress in dry foods
    }

    // Physical Guardrail 3: Temperature limits
    const opTemp = (material.propertiesSummary?.operatingTemperature || '').toLowerCase();
    if (formData.storageType === 'Frozen') {
      if (material.id === 'bopp-met-cpp' || material.id === 'kraft-bio-pbs' || opTemp.includes('ambient only')) {
        continue; // REJECT: Material embrittles/cracks under sub-zero conditions
      }
    }

    // Category Guardrail 4: Category routing
    const isTargetedCategoryMatch = rule.commodityCategory === commodityCategory;
    const isUniversalTransitRule = rule.commodityCategory === null;
    const isGeneralOtherRule = rule.commodityCategory === 'Other';

    if (!isTargetedCategoryMatch) {
      if (isUniversalTransitRule) {
        // Universal transit rule (Rule 22) applies to non-produce when mechanical/transit stress is prioritized
        const isTransitStressed = 
          formData.transportationCondition === 'High Vibration / Mechanical Stress' || 
          formData.transportationCondition === 'Long-Distance Transportation' ||
          formData.primaryConcern === 'Mechanical Strength';
        if (!isTransitStressed || requiresBreathability) {
          continue;
        }
      } else if (isGeneralOtherRule) {
        // 'Other' rule applies to category 'Other' or if category is unknown
        if (commodityCategory !== 'Other') {
          continue;
        }
      } else {
        // Rule belongs to another specific category
        continue;
      }
    }

    // --- COMPATIBILITY SCORING (0 to 100) ---
    let score = 0;

    // Dimension A: Food Category Compatibility (Max 30)
    let categoryScore = 0;
    if (isTargetedCategoryMatch) {
      categoryScore = 30;
    } else if (isUniversalTransitRule) {
      categoryScore = 20;
    } else if (isGeneralOtherRule) {
      categoryScore = 15;
    }
    score += categoryScore;

    // Dimension B: Storage Condition Compatibility (Max 25)
    let storageScore = 0;
    const isNominalStorage = rule.storageType === formData.storageType || rule.storageType === null;
    let isThermallyCompatible = false;

    if (rule.storageType === formData.storageType) {
      storageScore = 25;
    } else if (rule.storageType === null) {
      storageScore = 20;
    } else {
      // Check temperature compatibility
      if (formData.storageType === 'Ambient' && (opTemp.includes('ambient') || opTemp.includes('0°c to 50°c') || opTemp.includes('-20°c to 40°c'))) {
        storageScore = 18;
        isThermallyCompatible = true;
      } else if (formData.storageType === 'Chilled' && (opTemp.includes('chilled') || opTemp.includes('0°c') || opTemp.includes('-20°c'))) {
        storageScore = 18;
        isThermallyCompatible = true;
      } else {
        storageScore = 10;
      }
    }
    score += storageScore;
    const storageSatisfied = isNominalStorage || isThermallyCompatible;

    // Dimension C: Packaging Requirement / Barrier Compatibility (Max 25)
    const concern = formData.primaryConcern;
    let packagingScore = 0;
    let packagingRequirementsSatisfied = false;

    const moist = (material.propertiesSummary?.moistureBarrier || '').toLowerCase();
    const oxy = (material.propertiesSummary?.oxygenBarrier || '').toLowerCase();
    const punc = (material.propertiesSummary?.punctureResistance || '').toLowerCase();

    if (rule.applicableConcerns && rule.applicableConcerns.includes(concern)) {
      packagingScore = 25;
      packagingRequirementsSatisfied = true;
    } else if (rule.applicableConcerns === null) {
      packagingScore = 18;
      packagingRequirementsSatisfied = true;
    } else {
      // Graded property match
      if (concern === 'Moisture Protection' && (moist.includes('high') || moist.includes('near zero'))) {
        packagingScore = 22;
        packagingRequirementsSatisfied = true;
      } else if (concern === 'Oxygen Protection' && (oxy.includes('high') || oxy.includes('near zero'))) {
        packagingScore = 22;
        packagingRequirementsSatisfied = true;
      } else if (concern === 'Gas Exchange / Respiration' && (oxy.includes('permeable') || material.id === 'micro-perf-pp')) {
        packagingScore = 25;
        packagingRequirementsSatisfied = true;
      } else if (concern === 'Mechanical Strength' && punc.includes('high')) {
        packagingScore = 22;
        packagingRequirementsSatisfied = true;
      } else if (concern === 'Light Protection' && (material.id === 'pet-alu-pe' || material.id === 'bopp-met-cpp')) {
        packagingScore = 22;
        packagingRequirementsSatisfied = true;
      } else if (concern === 'Extended Shelf Life' && (moist.includes('high') || oxy.includes('high'))) {
        packagingScore = 20;
        packagingRequirementsSatisfied = true;
      } else if ((concern === 'Sustainability' || concern === 'Cost Efficiency') && material.id === 'hdpe-monofilm') {
        packagingScore = 20;
        packagingRequirementsSatisfied = true;
      } else {
        packagingScore = 14;
        packagingRequirementsSatisfied = false;
      }
    }
    score += packagingScore;

    // Overall check for whether other material and packaging requirements are satisfied
    const otherRequirementsSatisfied = 
      (isTargetedCategoryMatch || isUniversalTransitRule) && 
      storageSatisfied && 
      packagingRequirementsSatisfied;

    // Dimension D: Shelf-Life Range Compatibility (Max 12)
    let shelfLifeScore = 0;
    let isShelfLifeExtension = false;

    if (shelfLifeDays > 0) {
      const minDays = rule.minShelfLifeDays;
      const maxDays = rule.maxShelfLifeDays;

      if (shelfLifeDays >= minDays && (maxDays === null || shelfLifeDays <= maxDays)) {
        shelfLifeScore = 12; // Within nominal rule range
      } else if (maxDays !== null && shelfLifeDays > maxDays) {
        // Shelf-life extension above rule maximum:
        // Do NOT automatically accept shelf-life extensions above rule max merely because they fall within tolerance.
        // Treat as a weaker/alternative match and ensure other requirements are compatible.
        isShelfLifeExtension = true;
        if (otherRequirementsSatisfied) {
          const overflowRatio = (shelfLifeDays - maxDays) / maxDays;
          if (overflowRatio <= 0.35) {
            shelfLifeScore = 5; // Weaker match score within reasonable tolerance
          } else if (overflowRatio <= 0.50) {
            shelfLifeScore = 2; // Very weak extension
          } else {
            shelfLifeScore = -30; // Far exceeds safe barrier limits; reject extension
          }
        } else {
          shelfLifeScore = -30; // Incompatible other requirements reject shelf-life extension
        }
      } else if (shelfLifeDays < minDays) {
        // Shelf-life below minimum rule window:
        // Do NOT automatically treat as technically safe for every material.
        // Grant compatible score only when other material and packaging requirements are satisfied.
        if (otherRequirementsSatisfied) {
          shelfLifeScore = 8; // Compatible score when functional requirements are met
        } else {
          shelfLifeScore = 0; // Not technically safe if other requirements fail
        }
      }
    } else {
      shelfLifeScore = otherRequirementsSatisfied ? 10 : 5;
    }
    score += shelfLifeScore;

    // Dimension E: Transportation Compatibility (Max 8)
    const transit = formData.transportationCondition;
    if (!transit || transit === 'Not Specified') {
      score += 8;
    } else if (rule.applicableTransportation === null) {
      score += 8;
    } else if (rule.applicableTransportation.includes(transit)) {
      score += 8;
    } else {
      if (transit === 'Normal Transportation') {
        score += 7;
      } else if (transit === 'Long-Distance Transportation' || transit === 'High Vibration / Mechanical Stress') {
        const punc = (material.propertiesSummary?.punctureResistance || '').toLowerCase();
        if (punc.includes('high')) {
          score += 7;
        } else {
          score += 5;
        }
      } else if (transit === 'Refrigerated Transportation' && formData.storageType === 'Chilled') {
        score += 7;
      } else {
        score += 5;
      }
    }

    const matchDetails = {
      commodity: isTargetedCategoryMatch
        ? `${commodityCategory} (Category match)`
        : `${commodityCategory} (Transit reinforced profile)`,
      storageCondition: `${formData.storageType} storage (${
        rule.storageType === formData.storageType
          ? 'Nominal storage match'
          : storageSatisfied
          ? 'Compatible thermal profile'
          : 'Non-nominal storage condition'
      })`,
      transportationCondition: transit !== 'Not Specified'
        ? `${transit} (${rule.applicableTransportation?.includes(transit) ? 'Certified transit profile' : 'Compatible packaging structure'})`
        : 'Normal (Standard distribution compatibility)',
      shelfLife: isShelfLifeExtension
        ? `${shelfLifeDays} days (Extended shelf-life alternative; exceeds nominal ${rule.maxShelfLifeDays} day guideline)`
        : (shelfLifeDays < rule.minShelfLifeDays && shelfLifeDays > 0)
        ? (otherRequirementsSatisfied
            ? `${shelfLifeDays} days (Short shelf-life requirement; packaging and storage requirements fully satisfied)`
            : `${shelfLifeDays} days (Below ${rule.minShelfLifeDays} day guideline; pending verification of storage and barrier requirements)`)
        : `${shelfLifeDays} days (Within nominal ${rule.minShelfLifeDays}${rule.maxShelfLifeDays ? '–' + rule.maxShelfLifeDays : '+'} day window)`,
      moistureProtection: concern === 'Moisture Protection'
        ? 'Moisture protection prioritized (Matches barrier properties)'
        : `Primary concern: ${concern} (Evaluated barrier suitability)`,
      gasExchange: requiresBreathability
        ? 'Active aerobic respiration — Requires permeable/ventilated packaging'
        : 'Non-respiring commodity — Hermetic barrier permissible',
    };

    candidates.push({
      rule,
      material,
      score,
      isShelfLifeExtension,
      matchDetails,
    });
  }

  // Rank primarily by score descending, secondarily by priorityOrder ascending
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.rule.priorityOrder - b.rule.priorityOrder;
  });

  const uniqueOutputs: RecommendationOutput[] = [];
  const seenMaterialIds = new Set<string>();

  for (const item of candidates) {
    if (seenMaterialIds.has(item.material.id)) continue;
    seenMaterialIds.add(item.material.id);

    let status: RecommendationStatus;
    // Shelf-life extensions are strictly weaker/alternative matches and CANNOT be Recommended
    if (item.score >= 80 && !item.isShelfLifeExtension) {
      status = uniqueOutputs.length === 0 
        ? 'Recommended for Evaluation' 
        : (item.score >= 88 ? 'Recommended for Evaluation' : 'Potentially Suitable');
    } else if (item.score >= 60) {
      status = 'Potentially Suitable';
    } else {
      // Exclude candidates below viability threshold
      continue;
    }

    uniqueOutputs.push({
      material: item.material,
      status,
      primaryReason: item.rule.primaryReason,
      technicalNote: cleanNoteText(item.rule.technicalNote),
      requirementMatches: item.matchDetails,
    });
  }

  return uniqueOutputs;
}

/**
 * Analyzes the user's requirement combination and produces a structured, user-friendly
 * no-match reason and constructive input adjustment suggestions.
 * Strictly adheres to non-technical, farmer- and business-friendly language without internal jargon.
 */
export function determineNoMatchReason(
  formData: FoodDetailsFormData,
  _rules: RecommendationRule[] = RECOMMENDATION_RULES,
  _materials: PackagingMaterialData[] = ILLUSTRATIVE_MATERIALS
): NoMatchExplanation {
  let shelfLifeDays = Number(formData.targetShelfLifeValue || 0);
  if (formData.targetShelfLifeUnit === 'Weeks') {
    shelfLifeDays *= 7;
  } else if (formData.targetShelfLifeUnit === 'Months') {
    shelfLifeDays *= 30;
  }

  const selectedCommodity = ILLUSTRATIVE_COMMODITIES.find(c => c.id === formData.commodityId);
  const commodityCategory = selectedCommodity ? selectedCommodity.category : 'Other';
  const isRespiringCategory = commodityCategory === 'Fresh Fruits' || commodityCategory === 'Fresh Vegetables';
  const hasGasExchangeConcern = formData.primaryConcern === 'Gas Exchange / Respiration';

  // 1. Gas-Exchange / Respiration Conflict
  if (hasGasExchangeConcern && !isRespiringCategory) {
    return {
      category: 'CONFLICTING_REQUIREMENTS',
      userMessage: "The selected gas-exchange requirement needs a packaging structure that allows controlled gas movement, but the materials currently available in SmartPack's database are designed for stronger barrier protection.",
      suggestedChanges: [
        'Primary Packaging Concern: Select Moisture Protection or Oxygen Protection, which provide the high barrier required for shelf-stable foods.',
        'Food Commodity: If packaging fresh respiring produce (such as apples, tomatoes, or leafy greens), select a Fresh Fruits or Fresh Vegetables category.'
      ]
    };
  }

  if (isRespiringCategory && (formData.primaryConcern === 'Oxygen Protection' || formData.primaryConcern === 'Light Protection')) {
    return {
      category: 'CONFLICTING_REQUIREMENTS',
      userMessage: "The selected requirement asks for a high-barrier seal, but living fresh produce requires packaging that allows controlled gas movement to prevent tissue suffocation. SmartPack currently does not have a matching material in its database for this combination.",
      suggestedChanges: [
        'Primary Packaging Concern: Select Gas Exchange / Respiration or Moisture Protection engineered for fresh horticultural produce.',
        'Food Commodity: If packaging processed, cooked, or dried produce, choose an appropriate shelf-stable category.'
      ]
    };
  }

  // 2. Storage Condition Incompatibilities
  if (isRespiringCategory && formData.storageType === 'Frozen') {
    return {
      category: 'STORAGE_PRODUCT_INCOMPATIBILITY',
      userMessage: 'The selected storage condition and product requirements do not produce a suitable packaging match in the current material database.',
      suggestedChanges: [
        'Storage Type: Select Chilled storage (0°C to 10°C), which is the standard commercial storage condition for fresh horticultural produce.',
        'Food Commodity: If packaging commercially frozen produce (such as frozen peas or corn), choose Frozen Food.'
      ]
    };
  }

  if ((commodityCategory === 'Meat Products' || commodityCategory === 'Fish and Seafood') && formData.storageType === 'Ambient') {
    return {
      category: 'STORAGE_PRODUCT_INCOMPATIBILITY',
      userMessage: 'The selected storage condition and product requirements do not produce a suitable packaging match in the current material database.',
      suggestedChanges: [
        'Storage Type: Select Chilled or Frozen storage to safely distribute fresh raw protein commodities under continuous cold chain.',
        'Storage Temperature: Adjust storage temperature to between 0°C and 4°C for chilled distribution.'
      ]
    };
  }

  if (
    (commodityCategory === 'Snacks' || 
     commodityCategory === 'Baked Goods' || 
     commodityCategory === 'Cereals and Grains' || 
     commodityCategory === 'Pulses' || 
     commodityCategory === 'Spices') && 
    formData.storageType === 'Frozen'
  ) {
    return {
      category: 'STORAGE_PRODUCT_INCOMPATIBILITY',
      userMessage: 'The selected storage condition and product requirements do not produce a suitable packaging match in the current material database.',
      suggestedChanges: [
        'Storage Type: Select Ambient storage (room temperature), which is standard for shelf-stable dry foods.',
        'Storage Temperature: Set temperature to standard ambient conditions (e.g., 20°C to 25°C).'
      ]
    };
  }

  if (formData.commodityId === 'paneer' && formData.storageType !== 'Chilled') {
    return {
      category: 'STORAGE_PRODUCT_INCOMPATIBILITY',
      userMessage: 'The selected storage condition and product requirements do not produce a suitable packaging match in the current material database.',
      suggestedChanges: [
        'Storage Type: Select Chilled storage (typically 2°C to 4°C), which preserves texture and inhibits microbial spoilage in fresh dairy products.',
        'Storage Temperature: Maintain refrigerated temperatures to prevent rapid shelf-life degradation.'
      ]
    };
  }

  // 3. Shelf-Life Limitations
  if (isRespiringCategory && shelfLifeDays > 30) {
    return {
      category: 'SHELF_LIFE_LIMITATION',
      userMessage: "SmartPack currently does not have a packaging material in its database with verified data supporting the selected shelf-life requirement for fresh produce.",
      suggestedChanges: [
        'Target Shelf Life: Select a shorter, realistic shelf-life duration for fresh produce (e.g., 10 to 21 days).',
        'Storage Type: If extended preservation is required, consider whether freezing or secondary processing is appropriate for the product.'
      ]
    };
  }

  if (commodityCategory === 'Fish and Seafood' && shelfLifeDays > 14) {
    return {
      category: 'SHELF_LIFE_LIMITATION',
      userMessage: "SmartPack currently does not have a packaging material in its database with verified data supporting the selected shelf-life requirement for fresh chilled seafood.",
      suggestedChanges: [
        'Target Shelf Life: Select a target shelf life within the standard chilled seafood distribution window (3 to 14 days).',
        'Storage Type: Consider Frozen storage (-18°C) if multi-month preservation is required.'
      ]
    };
  }

  if (commodityCategory === 'Meat Products' && shelfLifeDays > 30) {
    return {
      category: 'SHELF_LIFE_LIMITATION',
      userMessage: "SmartPack currently does not have a packaging material in its database with verified data supporting the selected shelf-life requirement for fresh chilled meats.",
      suggestedChanges: [
        'Target Shelf Life: Select a shelf-life duration within 7 to 30 days for chilled meats.',
        'Storage Type: Consider Frozen storage for multi-month meat storage.'
      ]
    };
  }

  if (shelfLifeDays > 730) {
    return {
      category: 'SHELF_LIFE_LIMITATION',
      userMessage: "SmartPack currently does not have a packaging material in its database with verified data supporting the selected shelf-life requirement beyond 24 months.",
      suggestedChanges: [
        'Target Shelf Life: Select a shelf-life duration within standard commercial packaging limits (up to 12–24 months).',
        'Storage Type: Verify environmental storage parameters.'
      ]
    };
  }

  // 4. Transportation vs Storage Logistics Conflict
  if (formData.storageType === 'Frozen' && (formData.transportationCondition === 'Normal Transportation' || formData.transportationCondition === 'Refrigerated Transportation')) {
    return {
      category: 'CONFLICTING_REQUIREMENTS',
      userMessage: "These selected requirements may not work well together. The combination asks for packaging characteristics that are difficult to satisfy at the same time, and SmartPack currently does not have a matching material in its database.",
      suggestedChanges: [
        'Transportation Conditions: Select Frozen Transportation to maintain continuous sub-zero temperatures during transit.',
        'Storage Type: If normal non-refrigerated transport is used, select an ambient shelf-stable commodity.'
      ]
    };
  }

  if (formData.storageType === 'Ambient' && formData.transportationCondition === 'Frozen Transportation') {
    return {
      category: 'CONFLICTING_REQUIREMENTS',
      userMessage: "These selected requirements may not work well together. The combination asks for packaging characteristics that are difficult to satisfy at the same time, and SmartPack currently does not have a matching material in its database.",
      suggestedChanges: [
        'Transportation Conditions: Choose Normal Transportation for room-temperature goods.',
        'Storage Type: Align storage condition with the intended transit logistics.'
      ]
    };
  }

  // 5. Multiple Requirements Conflict
  if (
    formData.transportationCondition === 'High Vibration / Mechanical Stress' &&
    (formData.primaryConcern === 'Gas Exchange / Respiration' || formData.storageType === 'Frozen')
  ) {
    return {
      category: 'MULTIPLE_REQUIREMENTS_UNSATISFIED',
      userMessage: "SmartPack currently does not have a single packaging material in its database that satisfies all of the selected requirements together.",
      suggestedChanges: [
        'Primary Packaging Concern: Select Mechanical Strength or standard barrier protection for severe transit conditions.',
        'Transportation Conditions: Select Normal Transportation if specialized high-vibration distribution is not strictly required.'
      ]
    };
  }

  // 6. Insufficient Data for Custom/Other Food
  if (commodityCategory === 'Other') {
    return {
      category: 'INSUFFICIENT_DATA',
      userMessage: 'SmartPack currently does not have enough material information in its database to identify a suitable option for this combination.',
      suggestedChanges: [
        'Food Commodity: Select a specific food commodity from the list rather than a custom category.',
        'Primary Packaging Concern: Choose a standard barrier requirement (e.g., Moisture Protection or Oxygen Protection).'
      ]
    };
  }

  // 7. General No Material Available Fallback
  return {
    category: 'NO_MATERIAL_AVAILABLE',
    userMessage: "SmartPack currently does not have a suitable packaging material in its database for this combination.",
    suggestedChanges: [
      'Food Commodity: Select the closest standardized food commodity category.',
      'Primary Packaging Concern: Select standard protection requirements (such as Moisture Protection or Oxygen Protection).'
    ]
  };
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
    const noMatchExplanation = results.length === 0 
      ? determineNoMatchReason(formData, remoteData.rules, remoteData.materials)
      : undefined;
    return {
      recommendations: results,
      source: 'supabase',
      noMatchExplanation,
    };
  }

  // Graceful fallback to verified local dataset
  const fallbackResults = runRuleScreening(formData, RECOMMENDATION_RULES, ILLUSTRATIVE_MATERIALS);
  const noMatchExplanation = fallbackResults.length === 0 
    ? determineNoMatchReason(formData, RECOMMENDATION_RULES, ILLUSTRATIVE_MATERIALS)
    : undefined;
  return {
    recommendations: fallbackResults,
    source: 'local_fallback',
    noMatchExplanation,
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

/**
 * Synchronous evaluation with structured no-match explanation.
 */
export function evaluateRecommendationsWithExplanation(
  formData: FoodDetailsFormData
): { recommendations: RecommendationOutput[]; noMatchExplanation?: NoMatchExplanation } {
  const recommendations = runRuleScreening(formData, RECOMMENDATION_RULES, ILLUSTRATIVE_MATERIALS);
  const noMatchExplanation = recommendations.length === 0 
    ? determineNoMatchReason(formData, RECOMMENDATION_RULES, ILLUSTRATIVE_MATERIALS) 
    : undefined;
  return { recommendations, noMatchExplanation };
}
