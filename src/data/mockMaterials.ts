import type { 
  FoodDetailsFormData, 
  PackagingMaterialData, 
  RecommendationOutput,
  RecommendationStatus
} from '../types/recommendation';

export const ILLUSTRATIVE_MATERIALS: PackagingMaterialData[] = [
  {
    id: 'bopp-met-cpp',
    code: 'MET-BOPP/CPP',
    name: 'Metallized BOPP / CPP Laminate (Met-BOPP/CPP)',
    category: 'Flexible Barrier Laminate',
    propertiesSummary: {
      moistureBarrier: 'High (WVTR < 1.0 g/m²/day)',
      oxygenBarrier: 'Moderate to High',
      punctureResistance: 'Moderate',
      operatingTemperature: '10°C to 45°C (Ambient only)'
    },
    isIllustrative: true,
    sourceTitle: 'Celplast Metallized Products — Polypropylene (BOPP) Barrier Films',
    sourceUrl: 'https://www.celplast.com/material/polypropylene/',
    sourcePage: 'Product Catalog / Overview',
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-09-25'
  },
  {
    id: 'pet-alox-pe',
    code: 'PET-ALOX/PE',
    name: 'PET-AlOx / Polyethylene Multi-layer Film',
    category: 'Transparent High-Barrier Film',
    propertiesSummary: {
      moistureBarrier: 'High (WVTR < 1.2 g/m²/day)',
      oxygenBarrier: 'High (OTR < 3.0 cc/m²/day)',
      punctureResistance: 'High',
      operatingTemperature: '0°C to 50°C'
    },
    isIllustrative: true,
    sourceTitle: 'Jindal Films — Alox-Lyte™ Transparent High-Barrier Films',
    sourceUrl: 'https://www.jindalfilms.com/alox-lyte-transparent/',
    sourcePage: 'Product Family Overview',
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-09-25'
  },
  {
    id: 'evoh-multilayer-pe',
    code: 'EVOH/PE-COEX',
    name: 'EVOH Co-extruded Polyethylene Multi-layer Film',
    category: 'Co-extruded High-Barrier Film',
    propertiesSummary: {
      moistureBarrier: 'High',
      oxygenBarrier: 'Very High (OTR < 1.0 cc/m²/day)',
      punctureResistance: 'High',
      operatingTemperature: '-20°C to 40°C'
    },
    isIllustrative: true,
    sourceTitle: 'Kuraray — EVAL™ EVOH High Gas Barrier Resins',
    sourceUrl: 'https://eval.kuraray.com/',
    sourcePage: 'Technical Overview',
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-09-25'
  },
  {
    id: 'micro-perf-pp',
    code: 'PP-MICROPERF',
    name: 'Micro-perforated Polypropylene (Ventilated Film)',
    category: 'Breathable Polyolefin Film',
    propertiesSummary: {
      moistureBarrier: 'Controlled Transmission',
      oxygenBarrier: 'Permeable (Permits O2/CO2 flux)',
      punctureResistance: 'Moderate',
      operatingTemperature: '2°C to 25°C'
    },
    isIllustrative: true,
    sourceTitle: null,
    sourceUrl: null,
    sourcePage: null,
    verificationStatus: 'not_available',
    lastVerifiedAt: null
  },
  {
    id: 'hdpe-monofilm',
    code: 'HDPE-MONO',
    name: 'Mono-material High-Density Polyethylene (HDPE)',
    category: 'Recyclable Mono-material Polyolefin',
    propertiesSummary: {
      moistureBarrier: 'High (Moisture vapor resistance)',
      oxygenBarrier: 'Moderate',
      punctureResistance: 'High impact toughness',
      operatingTemperature: '-40°C to 60°C (Freezer grade)'
    },
    isIllustrative: true,
    sourceTitle: null,
    sourceUrl: null,
    sourcePage: null,
    verificationStatus: 'not_available',
    lastVerifiedAt: null
  },
  {
    id: 'opa-cpp-laminate',
    code: 'OPA/CPP',
    name: 'Oriented Polyamide / Cast Polypropylene (OPA/CPP)',
    category: 'High-Puncture Barrier Laminate',
    propertiesSummary: {
      moistureBarrier: 'Moderate to High',
      oxygenBarrier: 'High (Gas barrier)',
      punctureResistance: 'Very High (Abrasion resistant)',
      operatingTemperature: '-18°C to 100°C'
    },
    isIllustrative: true,
    sourceTitle: null,
    sourceUrl: null,
    sourcePage: null,
    verificationStatus: 'not_available',
    lastVerifiedAt: null
  },
  {
    id: 'kraft-bio-pbs',
    code: 'KRAFT-BIO-PBS',
    name: 'Kraft Paper with Bio-PBS Dispersion Coating',
    category: 'Renewable Coated Paperboard',
    propertiesSummary: {
      moistureBarrier: 'Moderate (Short-to-medium duration)',
      oxygenBarrier: 'Moderate',
      punctureResistance: 'Moderate tensile strength',
      operatingTemperature: '15°C to 30°C (Dry ambient)'
    },
    isIllustrative: true,
    sourceTitle: null,
    sourceUrl: null,
    sourcePage: null,
    verificationStatus: 'not_available',
    lastVerifiedAt: null
  },
  {
    id: 'pet-alu-pe',
    code: 'PET/ALU/PE',
    name: 'Tri-laminate Aluminum Foil (PET / Alu / PE)',
    category: 'Total Impermeable Barrier Foil',
    propertiesSummary: {
      moistureBarrier: 'Near Zero Transmission',
      oxygenBarrier: 'Near Zero Transmission',
      punctureResistance: 'High',
      operatingTemperature: '-30°C to 80°C'
    },
    isIllustrative: true,
    sourceTitle: null,
    sourceUrl: null,
    sourcePage: null,
    verificationStatus: 'not_available',
    lastVerifiedAt: null
  }
];

/**
 * Heuristic demonstration logic for food packaging recommendation.
 * ONLY returns suitable/recommended materials (no 'Not Recommended' cards).
 */
export function evaluatePackagingRecommendations(
  formData: FoodDetailsFormData
): RecommendationOutput[] {
  // Convert shelf life to normalized days
  let shelfLifeDays = Number(formData.targetShelfLifeValue || 0);
  if (formData.targetShelfLifeUnit === 'Weeks') {
    shelfLifeDays *= 7;
  } else if (formData.targetShelfLifeUnit === 'Months') {
    shelfLifeDays *= 30;
  }

  const storage = formData.storageType;
  const concern = formData.primaryConcern;
  const isRespiringProduce = 
    formData.respirationRate === 'High' || 
    formData.respirationRate === 'Very High' || 
    formData.respirationRate === 'Moderate' ||
    concern === 'Gas Exchange / Respiration' ||
    formData.commodityId === 'fresh-fruits' ||
    formData.commodityId === 'fresh-vegetables';

  const isFrozen = storage === 'Frozen';
  const isChilled = storage === 'Chilled';
  const isHighMoistureSens = formData.moistureSensitivity === 'High';
  const isHighFat = formData.oilFatContent === 'High';
  const isAcidic = Number(formData.ph || 7) < 4.5;
  const isVibrationOrLongTransit = 
    formData.transportationCondition === 'High Vibration / Mechanical Stress' || 
    formData.transportationCondition === 'Long-Distance Transportation';

  const results: RecommendationOutput[] = [];

  // Helper to add recommendation
  const addRec = (
    materialId: string, 
    status: RecommendationStatus, 
    reason: string, 
    technicalNote?: string
  ) => {
    const mat = ILLUSTRATIVE_MATERIALS.find(m => m.id === materialId);
    if (mat) {
      results.push({ material: mat, status, primaryReason: reason, technicalNote });
    }
  };

  // Case 1: Fresh Respiring Produce (Fruits / Vegetables)
  if (isRespiringProduce) {
    addRec(
      'micro-perf-pp',
      'Recommended for Evaluation',
      'Perforated structure facilitates controlled oxygen and carbon dioxide exchange, preventing anaerobic decay and moisture condensation.',
      'Perforation density must be tuned to commodity-specific respiration quotient at operating temperature.'
    );
    addRec(
      'hdpe-monofilm',
      'Potentially Suitable',
      'Offers high mechanical integrity for bulk produce crates and chilled transportation.',
      'Ventilation holes must be mechanically die-cut prior to packing.'
    );
    return results;
  }

  // Case 2: Frozen Foods
  if (isFrozen) {
    addRec(
      'hdpe-monofilm',
      'Recommended for Evaluation',
      'Maintains ductile impact strength and seal integrity without cold-temperature embrittlement down to -40°C.',
      'Complies with standard mono-material polyolefin mechanical recycling streams.'
    );
    addRec(
      'evoh-multilayer-pe',
      'Recommended for Evaluation',
      'Provides high oxygen barrier under low temperatures, preventing lipid rancidity and freezer burn during long-term storage.'
    );
    addRec(
      'opa-cpp-laminate',
      isVibrationOrLongTransit ? 'Recommended for Evaluation' : 'Potentially Suitable',
      'Provides superior puncture resistance against sharp frozen food contours during transit.',
      'Verify low-temperature seal initiation temperature on packaging lines.'
    );
    return results;
  }

  // Case 3: High Moisture Sensitivity / Dry Snacks / Bakery / Powders
  if (isHighMoistureSens || concern === 'Moisture Protection') {
    if (isHighFat || shelfLifeDays > 120 || concern === 'Light Protection') {
      addRec(
        'bopp-met-cpp',
        'Recommended for Evaluation',
        'Delivers reliable water vapor and light barrier to preserve textural crispness and prevent oxidative rancidity in ambient storage.',
        'Ensure seal integrity along longitudinal and end seals during form-fill-seal operation.'
      );
    } else {
      addRec(
        'bopp-met-cpp',
        'Recommended for Evaluation',
        'Standard moisture barrier laminate preventing ambient moisture uptake in dry food products.'
      );
    }

    addRec(
      'pet-alox-pe',
      'Potentially Suitable',
      'High-barrier transparent alternative providing optical clarity for inspection alongside moisture and aroma protection.'
    );

    if (shelfLifeDays > 180 || concern === 'Extended Shelf Life') {
      addRec(
        'pet-alu-pe',
        'Recommended for Evaluation',
        'Total impermeable barrier providing zero transmission of water vapor and oxygen for extended shelf-life targets.',
        'Recommended for sensitive hygroscopic powders and extended warehouse storage.'
      );
    }

    if (shelfLifeDays <= 60 && !isHighFat && concern === 'Sustainability') {
      addRec(
        'kraft-bio-pbs',
        'Requires Technical Validation',
        'Bio-coated paperboard suitable for short-duration dry ambient goods where renewable fiber is prioritized.',
        'Water vapor transmission rate must be verified under expected ambient relative humidity.'
      );
    }

    return results;
  }

  // Case 4: Chilled Perishables (Dairy / Meat / Seafood)
  if (isChilled) {
    addRec(
      'evoh-multilayer-pe',
      'Recommended for Evaluation',
      'Exceptional oxygen barrier prevents microbial spoilage and lipid oxidation in perishable foods under cold chain conditions.',
      'Verify compatibility with modified atmosphere packaging (MAP) gas mixtures if utilized.'
    );

    addRec(
      'pet-alox-pe',
      'Potentially Suitable',
      'Combines high gas barrier with clarity for display packaging of chilled proteins and dairy products.'
    );

    if (isAcidic || isVibrationOrLongTransit || concern === 'Mechanical Strength') {
      addRec(
        'opa-cpp-laminate',
        'Potentially Suitable',
        'High tensile strength and flex-crack resistance protects against abrasion during long-distance refrigerated transit.'
      );
    }

    return results;
  }

  // Default / General Case:
  addRec(
    'bopp-met-cpp',
    'Recommended for Evaluation',
    'Proven multi-layer barrier laminate offering balanced moisture and light protection for ambient food commodities.'
  );

  addRec(
    'pet-alox-pe',
    'Potentially Suitable',
    'Transparent barrier film providing high moisture and gas barrier with product visibility.'
  );

  addRec(
    'hdpe-monofilm',
    'Potentially Suitable',
    'Cost-effective moisture-resistant polyolefin suitable for dry distribution and conventional recycling systems.'
  );

  if (concern === 'Mechanical Strength' || isVibrationOrLongTransit) {
    addRec(
      'opa-cpp-laminate',
      'Recommended for Evaluation',
      'Engineered puncture and burst resistance suited for sharp-edged food products and rugged distribution.'
    );
  }

  // Sort: 'Recommended for Evaluation' first, then 'Potentially Suitable', then 'Requires Technical Validation'
  const rank: Record<string, number> = {
    'Recommended for Evaluation': 1,
    'Potentially Suitable': 2,
    'Requires Technical Validation': 3
  };

  return results.sort((a, b) => (rank[a.status] || 99) - (rank[b.status] || 99));
}
