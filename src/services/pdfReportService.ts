import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { 
  FoodDetailsFormData, 
  RecommendationOutput 
} from '../types/recommendation';
import { ILLUSTRATIVE_COMMODITIES } from '../data/commodities';

export interface GeneratePdfOptions {
  recommendations: RecommendationOutput[];
  formData: FoodDetailsFormData;
  dataSource?: 'supabase' | 'local_fallback';
}

type RGBColor = [number, number, number];

// Harmonious Color Palette
const colorNavy: RGBColor = [6, 43, 82]; // Primary brand Navy #062B52
const colorSlateDark: RGBColor = [31, 31, 31]; // Dark text #1F1F1F
const colorTextMuted: RGBColor = [85, 85, 85]; // Muted text #555555
const colorBorder: RGBColor = [208, 208, 208]; // Border grey #D0D0D0
const colorSubtleBorder: RGBColor = [225, 225, 225];
const colorLightBg: RGBColor = [248, 249, 250];
const colorWhite: RGBColor = [255, 255, 255];
const colorLink: RGBColor = [9, 105, 218]; // Hyperlink blue #0969DA
const colorTechHeadBg: RGBColor = [40, 65, 95]; // Visually secondary slate-navy

/**
 * Extracts a user-friendly, simple food name (e.g. "Banana Chips" instead of "Banana Chips (Snacks - Fried & Dehydrated)").
 */
function getSimpleCommodityName(commodityId: string, fullName?: string): string {
  if (fullName) {
    const clean = fullName.split('(')[0].trim();
    if (clean) return clean;
  }
  const matched = ILLUSTRATIVE_COMMODITIES.find(c => c.id === commodityId);
  if (matched) {
    const clean = matched.name.split('(')[0].trim();
    if (clean) return clean;
  }
  return commodityId || 'Not available';
}

/**
 * Formats storage condition in plain language for farmers and small businesses.
 */
function getSimpleStorageDisplay(storageType?: string, temp?: number | string): string {
  if (storageType === 'Ambient') {
    return temp && Number(temp) !== 25 && temp !== '' ? `Room temperature (${temp}°C)` : 'Room temperature';
  }
  if (storageType === 'Chilled') {
    return temp && temp !== '' ? `Chilled (${temp}°C)` : 'Chilled';
  }
  if (storageType === 'Frozen') {
    return temp && temp !== '' ? `Frozen (${temp}°C)` : 'Frozen';
  }
  return storageType || 'Not available';
}

/**
 * Formats transportation condition in plain language.
 */
function getSimpleTransportationDisplay(trans?: string): string {
  if (!trans || trans === 'Not Specified') return 'Normal';
  return trans.replace(/ Transportation$/i, '');
}

/**
 * Formats the primary packaging concern in simple language.
 */
function getSimpleMainRequirementDisplay(concern?: string): string {
  if (!concern) return 'Not available';
  return concern;
}

/**
 * Maps technical status strings to clean recommendation status values:
 * Recommended or Alternative
 */
function getSimpleStatus(status: string, _index?: number): string {
  if (status === 'Recommended for Evaluation' || status === 'Recommended') return 'Recommended';
  return 'Alternative';
}

/**
 * Cleans material name for non-technical users by stripping trailing internal bracketed acronyms.
 */
function getSimpleMaterialName(name: string): string {
  return name.replace(/\s*\([A-Za-z0-9/-]+\)$/, '').trim();
}

interface PlainLanguageRec {
  whyThisPackaging: string;
  suitableFor: string;
  mainPackagingPurpose: string;
}

/**
 * Generates an accurate, plain-language explanation strictly grounded in existing
 * recommendation rules, material properties, and user requirements.
 * Avoids technical jargon and absolute claims (e.g. guarantees).
 */
function generatePlainLanguageRecommendation(
  rec: RecommendationOutput,
  formData: FoodDetailsFormData,
  foodSimpleName: string
): PlainLanguageRec {
  const matId = rec.material.id;
  const isProduce = 
    formData.commodityId === 'fresh-fruits' || 
    formData.commodityId === 'fresh-vegetables' ||
    formData.primaryConcern === 'Gas Exchange / Respiration' ||
    (formData.respirationRate && formData.respirationRate !== 'Not Applicable');

  const isFrozen = formData.storageType === 'Frozen';
  const isChilled = formData.storageType === 'Chilled';

  // 1. Metallized BOPP / CPP
  if (matId === 'bopp-met-cpp') {
    if (formData.commodityId === 'banana-chips' || formData.commodityId === 'snacks') {
      return {
        whyThisPackaging: `Helps protect ${foodSimpleName.toLowerCase()} from moisture and helps maintain crispness during storage.`,
        suitableFor: 'Dry snacks stored at room temperature.',
        mainPackagingPurpose: 'Moisture protection.',
      };
    }
    if (formData.commodityId === 'dry-bakery') {
      return {
        whyThisPackaging: 'Helps protect biscuits and crackers from moisture to help maintain crispness and texture during storage.',
        suitableFor: 'Dry baked goods stored at room temperature.',
        mainPackagingPurpose: 'Moisture protection.',
      };
    }
    if (formData.commodityId === 'spices') {
      return {
        whyThisPackaging: 'Helps shield spices from ambient moisture and light to help preserve aroma and color.',
        suitableFor: 'Dry spices stored at room temperature.',
        mainPackagingPurpose: 'Light and moisture protection.',
      };
    }
    return {
      whyThisPackaging: 'Provides strong protection against moisture and light to help maintain product quality during ambient storage.',
      suitableFor: 'Dry shelf-stable food commodities stored at room temperature.',
      mainPackagingPurpose: 'Moisture protection.',
    };
  }

  // 2. Micro-perforated Polypropylene
  if (matId === 'micro-perf-pp') {
    return {
      whyThisPackaging: `Allows ${foodSimpleName.toLowerCase()} to exchange air (breathe) and helps prevent moisture condensation that can cause spoilage.`,
      suitableFor: 'Respiring fresh produce stored under chilled conditions.',
      mainPackagingPurpose: 'Air exchange and moisture management.',
    };
  }

  // 3. Mono-material High-Density Polyethylene (HDPE)
  if (matId === 'hdpe-monofilm') {
    if (isProduce) {
      return {
        whyThisPackaging: 'Provides strong physical protection for bulk produce handling and transport when equipped with ventilation holes to allow air exchange.',
        suitableFor: 'Bulk produce handling and crates under chilled conditions.',
        mainPackagingPurpose: 'Mechanical strength with ventilation.',
      };
    }
    if (isFrozen) {
      return {
        whyThisPackaging: 'Withstands sub-zero freezer temperatures without cracking (down to -40°C) and helps protect frozen foods from moisture loss.',
        suitableFor: 'Frozen food stored at sub-zero temperatures.',
        mainPackagingPurpose: 'Freezer temperature resistance and moisture protection.',
      };
    }
    if (formData.commodityId === 'cereals-grains' || formData.commodityId === 'pulses') {
      return {
        whyThisPackaging: 'Provides strong protection against humidity and moisture absorption to help prevent mold and insect ingress.',
        suitableFor: 'Dry grains and pulses stored at room temperature.',
        mainPackagingPurpose: 'Moisture protection.',
      };
    }
    return {
      whyThisPackaging: 'Provides reliable moisture protection and durable packaging for products stored at room temperature.',
      suitableFor: 'Dry food commodities stored at room temperature.',
      mainPackagingPurpose: 'Moisture protection.',
    };
  }

  // 4. EVOH Co-extruded Polyethylene Film
  if (matId === 'evoh-multilayer-pe') {
    if (isFrozen) {
      return {
        whyThisPackaging: 'Provides strong protection against oxygen to help prevent freezer burn and fat degradation during frozen storage.',
        suitableFor: 'Frozen foods requiring high oxygen barrier.',
        mainPackagingPurpose: 'Oxygen protection and freezer stability.',
      };
    }
    if (formData.commodityId === 'dairy-products') {
      return {
        whyThisPackaging: 'Provides strong protection against oxygen to help slow spoilage and mold growth in chilled dairy products.',
        suitableFor: 'Perishable dairy products stored under chilled conditions.',
        mainPackagingPurpose: 'Oxygen protection.',
      };
    }
    if (formData.commodityId === 'meat-products' || formData.commodityId === 'fish-seafood') {
      return {
        whyThisPackaging: 'Provides strong protection against oxygen to help slow discoloration and spoilage in chilled fresh proteins.',
        suitableFor: 'Perishable meat and seafood stored under chilled conditions.',
        mainPackagingPurpose: 'Oxygen protection.',
      };
    }
    return {
      whyThisPackaging: 'Provides strong protection against oxygen to help prevent spoilage in oxygen-sensitive foods.',
      suitableFor: `${isChilled ? 'Chilled' : isFrozen ? 'Frozen' : 'Ambient'} food products sensitive to oxygen.`,
      mainPackagingPurpose: 'Oxygen protection.',
    };
  }

  // 5. PET-AlOx / Polyethylene Multi-layer Film
  if (matId === 'pet-alox-pe') {
    return {
      whyThisPackaging: `Offers clear see-through packaging while providing strong protection against moisture and air for ${foodSimpleName.toLowerCase()}.`,
      suitableFor: `${isChilled ? 'Chilled foods' : 'Dry foods'} requiring product visibility during storage.`,
      mainPackagingPurpose: 'Moisture and oxygen protection with clear product visibility.',
    };
  }

  // 6. Oriented Polyamide / Cast Polypropylene (OPA/CPP)
  if (matId === 'opa-cpp-laminate') {
    if (formData.commodityId === 'pulses') {
      return {
        whyThisPackaging: 'Provides high puncture and tear resistance against hard, sharp pulse edges during handling, packing, and transit.',
        suitableFor: 'Dry pulses and legumes stored at room temperature.',
        mainPackagingPurpose: 'Puncture resistance and mechanical protection.',
      };
    }
    if (isFrozen) {
      return {
        whyThisPackaging: 'Provides high puncture resistance against sharp frozen food edges during transit and distribution.',
        suitableFor: 'Frozen products with irregular or sharp contours.',
        mainPackagingPurpose: 'Puncture resistance and cold durability.',
      };
    }
    return {
      whyThisPackaging: 'Provides high puncture resistance and package strength to protect against vibration and rough transit conditions.',
      suitableFor: 'Food distribution involving mechanical stress or sharp products.',
      mainPackagingPurpose: 'Puncture resistance and transit durability.',
    };
  }

  // 7. Tri-laminate Aluminum Foil (PET / Alu / PE)
  if (matId === 'pet-alu-pe') {
    if (formData.commodityId === 'whole-milk-powder' || formData.commodityId === 'dairy-products') {
      return {
        whyThisPackaging: 'Provides a complete barrier against moisture, air, and light to help prevent powder caking and fat oxidation.',
        suitableFor: 'Hygroscopic dairy powders stored at room temperature.',
        mainPackagingPurpose: 'Complete barrier against moisture, oxygen, and light.',
      };
    }
    if (formData.commodityId === 'spices') {
      return {
        whyThisPackaging: 'Provides complete protection against light, air, and moisture to help retain aromatic essential oils and color.',
        suitableFor: 'Aromatic whole and ground spices stored at room temperature.',
        mainPackagingPurpose: 'Complete barrier to protect aroma, color, and freshness.',
      };
    }
    return {
      whyThisPackaging: 'Provides a complete barrier against moisture, air, and light for extended storage of sensitive foods.',
      suitableFor: 'Sensitive shelf-stable foods stored at room temperature.',
      mainPackagingPurpose: 'Complete moisture, oxygen, and light barrier.',
    };
  }

  // 8. Kraft Paper with Bio-PBS Coating
  if (matId === 'kraft-bio-pbs') {
    return {
      whyThisPackaging: 'Provides a renewable, paper-based packaging option with basic moisture protection for dry food products.',
      suitableFor: 'Dry foods stored at room temperature where renewable materials are preferred.',
      mainPackagingPurpose: 'Renewable packaging with basic moisture protection.',
    };
  }

  // Fallback derived cleanly from primaryReason
  return {
    whyThisPackaging: rec.primaryReason || 'Recommended based on the selected requirements.',
    suitableFor: `${foodSimpleName} stored under ${formData.storageType.toLowerCase()} conditions.`,
    mainPackagingPurpose: formData.primaryConcern || 'Product protection.',
  };
}

/**
 * Generates only relevant, useful guidance supported by the existing dataset and conditions.
 */
function generatePracticalGuidance(
  formData: FoodDetailsFormData,
  _recommendations: RecommendationOutput[]
): string[] {
  const tips: string[] = [];
  const isProduce = 
    formData.commodityId === 'fresh-fruits' || 
    formData.commodityId === 'fresh-vegetables' ||
    formData.primaryConcern === 'Gas Exchange / Respiration' ||
    (formData.respirationRate && formData.respirationRate !== 'Not Applicable');

  const isFrozen = formData.storageType === 'Frozen';
  const isChilled = formData.storageType === 'Chilled';
  const isMoistureConcern = formData.primaryConcern === 'Moisture Protection';

  if (isProduce) {
    tips.push('Ensure ventilation openings or micro-perforations remain unblocked so the produce can breathe.');
    tips.push('Maintain continuous cold chain storage (e.g. 4°C) to slow down respiration and prolong quality.');
    tips.push('Do not seal fresh produce in hermetic airtight packaging without adequate ventilation.');
    tips.push("Follow the material supplier's handling and perforation specifications.");
    return tips;
  }

  if (isFrozen) {
    tips.push('Maintain continuous frozen storage (-18°C or below) throughout distribution to prevent freeze-thaw cycles.');
    tips.push('Ensure packages are properly heat-sealed to prevent moisture loss and freezer burn.');
    tips.push('Protect packages from drops and sharp impact during sub-zero handling.');
    tips.push("Follow the material supplier's handling requirements.");
    return tips;
  }

  if (isChilled) {
    tips.push('Maintain continuous refrigerated storage (below 4°C) during distribution and storage.');
    tips.push('Ensure proper heat seal integrity along all seams to prevent air ingress and microbial spoilage.');
    tips.push("Follow the material supplier's handling and sealing requirements.");
    return tips;
  }

  // Ambient / Dry foods (Banana chips, bakery, spices, pulses, grains, powders)
  tips.push('Keep the package properly sealed along all seams to prevent moisture from softening the product.');
  tips.push('Store the packaged product under room temperature conditions, in a dry area away from direct sunlight and heat.');
  if (isMoistureConcern) {
    tips.push('Protect packages from excessive ambient humidity during warehouse storage and transit.');
  } else {
    tips.push('Protect packages from physical damage or crushing during transportation.');
  }
  tips.push("Follow the material supplier's recommended sealing temperatures and handling requirements.");

  return tips;
}

/**
 * Builds the jsPDF document containing both plain-language explanations
 * and technical specifications organized in a clean visual hierarchy.
 */
export function buildRecommendationPdfDoc({
  recommendations,
  formData,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;

  // Resolve Commodity Information
  const matchedCommodity = ILLUSTRATIVE_COMMODITIES.find(c => c.id === formData.commodityId);
  const commodityRawName = matchedCommodity ? matchedCommodity.name : formData.commodityId;
  const foodSimpleName = getSimpleCommodityName(formData.commodityId, commodityRawName);

  // Generation Date
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let currentY = 12;

  // =========================================================================
  // 1. SmartPack Header
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('SmartPack', marginX, currentY);

  // Generation Date (aligned to right margin)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text(`Generated date: ${dateFormatted}`, pageWidth - marginX, currentY - 1, { align: 'right' });

  currentY += 5;

  // Report Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Food Packaging Recommendation Report', marginX, currentY);

  currentY += 3;

  // Header Divider Rule
  doc.setDrawColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 4.5;

  // =========================================================================
  // 2. Your Requirements
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Your Requirements', marginX, currentY);

  currentY += 2;

  const storageDisplay = getSimpleStorageDisplay(formData.storageType, formData.storageTemperature);
  const shelfLifeDisplay = formData.targetShelfLifeValue 
    ? `${formData.targetShelfLifeValue} ${formData.targetShelfLifeUnit.toLowerCase()}` 
    : 'Not available';
  const transportationDisplay = getSimpleTransportationDisplay(formData.transportationCondition);
  const mainRequirementDisplay = getSimpleMainRequirementDisplay(formData.primaryConcern);

  const requirementsTableData = [
    [
      { content: 'Food commodity', styles: { fontStyle: 'bold' as const } },
      foodSimpleName,
      { content: 'Storage condition', styles: { fontStyle: 'bold' as const } },
      storageDisplay,
    ],
    [
      { content: 'Shelf-life requirement', styles: { fontStyle: 'bold' as const } },
      shelfLifeDisplay,
      { content: 'Transportation condition', styles: { fontStyle: 'bold' as const } },
      transportationDisplay,
    ],
    [
      { content: 'Main packaging requirement', styles: { fontStyle: 'bold' as const } },
      { content: mainRequirementDisplay, colSpan: 3 },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: requirementsTableData,
    theme: 'grid',
    styles: {
      fontSize: 7.8,
      textColor: colorSlateDark,
      cellPadding: 1.5,
      lineColor: colorBorder,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 46, fillColor: colorLightBg },
      1: { cellWidth: 45 },
      2: { cellWidth: 46, fillColor: colorLightBg },
      3: { cellWidth: 45 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // =========================================================================
  // 3. Recommended Packaging (Plain Language)
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Recommended Packaging', marginX, currentY);

  currentY += 2;

  if (recommendations.length === 0) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      body: [['No matching recommendation was found for the selected requirements.']],
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        textColor: colorSlateDark,
        cellPadding: 4,
        lineColor: colorBorder,
        lineWidth: 0.2,
      },
    });
    currentY = (doc as any).lastAutoTable.finalY + 4;
  } else {
    recommendations.forEach((rec, idx) => {
      // Graceful page break if card doesn't fit on current page
      if (currentY > pageHeight - 45) {
        doc.addPage();
        currentY = 12;
      }

      const mat = rec.material;
      const simpleMatName = getSimpleMaterialName(mat.name);
      const statusSimple = getSimpleStatus(rec.status, idx);
      const plainInfo = generatePlainLanguageRecommendation(rec, formData, foodSimpleName);

      const plainCardBody = [
        [
          { content: 'Why this packaging?', styles: { fontStyle: 'bold' as const } },
          plainInfo.whyThisPackaging,
        ],
        [
          { content: 'Suitable for:', styles: { fontStyle: 'bold' as const } },
          plainInfo.suitableFor,
        ],
        [
          { content: 'Main packaging purpose:', styles: { fontStyle: 'bold' as const } },
          plainInfo.mainPackagingPurpose,
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [[
          {
            content: `${idx + 1}. ${simpleMatName}`,
            styles: {
              fillColor: colorNavy,
              textColor: colorWhite,
              fontSize: 8.2,
              fontStyle: 'bold',
              cellPadding: 1.6,
            }
          },
          {
            content: `Status: ${statusSimple}`,
            styles: {
              fillColor: colorNavy,
              textColor: colorWhite,
              fontSize: 7.8,
              fontStyle: 'bold',
              halign: 'right',
              cellPadding: 1.6,
            }
          }
        ]],
        body: plainCardBody,
        theme: 'grid',
        styles: {
          fontSize: 7.8,
          textColor: colorSlateDark,
          cellPadding: 1.5,
          lineColor: colorSubtleBorder,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 46, fillColor: colorLightBg, textColor: colorNavy },
          1: { cellWidth: 136 },
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 3;
    });
  }

  // =========================================================================
  // 4. Practical Packaging Guidance
  // =========================================================================
  if (currentY > pageHeight - 38) {
    doc.addPage();
    currentY = 12;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Practical Packaging Guidance', marginX, currentY);

  currentY += 2;

  const guidanceTips = generatePracticalGuidance(formData, recommendations);
  const guidanceBody = guidanceTips.map(tip => [`•  ${tip}`]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: guidanceBody,
    theme: 'plain',
    styles: {
      fontSize: 7.5,
      textColor: colorSlateDark,
      cellPadding: 1.2,
      fillColor: colorLightBg,
      lineColor: colorSubtleBorder,
      lineWidth: 0.1,
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // =========================================================================
  // 5. Technical Details (Visually Secondary)
  // =========================================================================
  // Check if Technical Details + Note realistically fit on Page 1 or should begin cleanly on Page 2
  const estimatedTechHeightPerCard = 26;
  const estimatedTotalTechHeight = recommendations.length * estimatedTechHeightPerCard + 20;
  const remainingOnPage = pageHeight - currentY - 10;

  if (remainingOnPage < estimatedTotalTechHeight) {
    doc.addPage();
    currentY = 12;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Technical Details', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text('Barrier properties and specifications for technical evaluation.', marginX + 32, currentY);

  currentY += 2;

  if (recommendations.length > 0) {
    recommendations.forEach((rec, idx) => {
      if (currentY > pageHeight - 32) {
        doc.addPage();
        currentY = 12;
      }

      const mat = rec.material;
      const codeVal = mat.code || 'Not available';
      const categoryVal = mat.category || 'Not available';
      const moistureVal = mat.propertiesSummary?.moistureBarrier || 'Not available';
      const oxygenVal = mat.propertiesSummary?.oxygenBarrier || 'Not available';
      const punctureVal = mat.propertiesSummary?.punctureResistance || 'Not available';
      const tempVal = mat.propertiesSummary?.operatingTemperature || 'Not available';
      const sourceTitleVal = mat.sourceTitle || 'Not available';
      const sourcePageVal = mat.sourcePage || 'Not available';
      const sourceUrlVal = mat.sourceUrl || 'Not available';
      const hasUrl = Boolean(mat.sourceUrl && mat.sourceUrl.trim().length > 0);
      const verificationVal = mat.verificationStatus === 'verified' ? 'Verified' : 'Not available';

      const techBody: any[] = [
        [
          { content: 'Material code', styles: { fontStyle: 'bold' as const } },
          codeVal,
          { content: 'Category', styles: { fontStyle: 'bold' as const } },
          categoryVal,
        ],
        [
          { content: 'Moisture barrier (WVTR)', styles: { fontStyle: 'bold' as const } },
          moistureVal,
          { content: 'Oxygen barrier (OTR)', styles: { fontStyle: 'bold' as const } },
          oxygenVal,
        ],
        [
          { content: 'Puncture resistance', styles: { fontStyle: 'bold' as const } },
          punctureVal,
          { content: 'Operating temperature', styles: { fontStyle: 'bold' as const } },
          tempVal,
        ],
        [
          { content: 'Source name', styles: { fontStyle: 'bold' as const } },
          sourceTitleVal,
          { content: 'Verification status', styles: { fontStyle: 'bold' as const } },
          verificationVal,
        ],
        [
          { content: 'Page / section', styles: { fontStyle: 'bold' as const } },
          sourcePageVal,
          { content: 'Source link', styles: { fontStyle: 'bold' as const } },
          { 
            content: sourceUrlVal, 
            styles: { 
              textColor: hasUrl ? colorLink : colorSlateDark,
            } 
          },
        ]
      ];

      // Add sanitized technical note if present
      if (rec.technicalNote && rec.technicalNote.trim().length > 0) {
        techBody.push([
          { content: 'Technical note', styles: { fontStyle: 'bold' as const } },
          { content: rec.technicalNote, colSpan: 3 }
        ]);
      }

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [[
          {
            content: `${idx + 1}. ${mat.name}`,
            colSpan: 4,
            styles: {
              fillColor: colorTechHeadBg,
              textColor: colorWhite,
              fontSize: 7.8,
              fontStyle: 'bold',
              cellPadding: 1.5,
            }
          }
        ]],
        body: techBody,
        theme: 'grid',
        styles: {
          fontSize: 7,
          textColor: colorSlateDark,
          cellPadding: 1.3,
          lineColor: colorSubtleBorder,
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 42, fillColor: colorLightBg },
          1: { cellWidth: 49 },
          2: { cellWidth: 42, fillColor: colorLightBg },
          3: { cellWidth: 49 },
        },
        didDrawCell: (data) => {
          // If valid sourceUrl, add clickable hyperlink on the source link cell (row 4, col 3)
          if (hasUrl && data.row.index === 4 && data.column.index === 3) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              url: mat.sourceUrl!,
            });
          }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 3;
    });
  }

  // =========================================================================
  // 6. Final Note
  // =========================================================================
  if (currentY > pageHeight - 18) {
    doc.addPage();
    currentY = 12;
  }

  const shortNoteText = 
    'Recommendations are based on available database records and matching rules. ' +
    "Actual packaging selection should be confirmed using the material supplier's specifications and product-specific testing.";

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: [[shortNoteText]],
    theme: 'plain',
    styles: {
      fontSize: 7,
      fontStyle: 'italic',
      textColor: colorTextMuted,
      fillColor: colorLightBg,
      cellPadding: 1.8,
      lineColor: colorBorder,
      lineWidth: 0.2,
    },
  });

  // =========================================================================
  // Running Footer & Page Numbering
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('SmartPack', marginX, footerY);

    if (totalPages > 1) {
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
    }
  }

  return doc;
}

/**
 * Generates and triggers browser download of the improved PDF report for SmartPack.
 */
export async function downloadRecommendationReportPdf(options: GeneratePdfOptions): Promise<void> {
  const { formData } = options;
  const doc = buildRecommendationPdfDoc(options);

  const matchedCommodity = ILLUSTRATIVE_COMMODITIES.find(c => c.id === formData.commodityId);
  const now = new Date();
  const dateCompact = now.toISOString().slice(0, 10).replace(/-/g, '');
  const safeCommoditySlug = (matchedCommodity?.id || formData.commodityId || 'commodity')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `SmartPack_Recommendation_Report_${safeCommoditySlug}_${dateCompact}.pdf`;

  doc.save(filename);
}
