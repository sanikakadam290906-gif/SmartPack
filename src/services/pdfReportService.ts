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

/**
 * Generates and triggers browser download of a simplified, concise,
 * professional PDF recommendation report for SmartPack.
 */
export async function downloadRecommendationReportPdf({
  recommendations,
  formData,
}: GeneratePdfOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;

  // 1. Resolve Commodity Information
  const matchedCommodity = ILLUSTRATIVE_COMMODITIES.find(c => c.id === formData.commodityId);
  const commodityDisplayName = matchedCommodity ? matchedCommodity.name : (formData.commodityId || 'Not available');

  // Generation Date
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateCompact = now.toISOString().slice(0, 10).replace(/-/g, '');

  // Harmonious Color Palette
  const colorNavy: RGBColor = [6, 43, 82]; // Primary brand Navy #062B52
  const colorSlateDark: RGBColor = [31, 31, 31];
  const colorTextMuted: RGBColor = [85, 85, 85];
  const colorBorder: RGBColor = [208, 208, 208];
  const colorSubtleBorder: RGBColor = [225, 225, 225];
  const colorLightBg: RGBColor = [248, 249, 250];
  const colorWhite: RGBColor = [255, 255, 255];
  const colorLink: RGBColor = [9, 105, 218]; // Hyperlink blue #0969DA

  let currentY = 16;

  // =========================================================================
  // Section 1: Report Header
  // =========================================================================
  // Main Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('SmartPack', marginX, currentY);

  // Generation Date (aligned to right margin)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.text(`Generation date: ${dateFormatted}`, pageWidth - marginX, currentY - 1, { align: 'right' });

  currentY += 6;

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Food Packaging Recommendation Report', marginX, currentY);

  currentY += 4;

  // Divider Rule
  doc.setDrawColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 6;

  // =========================================================================
  // Section 2: Selected Requirements
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Selected Requirements', marginX, currentY);

  currentY += 2;

  const storageDisplay = formData.storageTemperature !== '' && formData.storageTemperature !== undefined
    ? `${formData.storageType || 'Not available'} (${formData.storageTemperature}°C)`
    : (formData.storageType || 'Not available');

  const shelfLifeDisplay = formData.targetShelfLifeValue 
    ? `${formData.targetShelfLifeValue} ${formData.targetShelfLifeUnit}` 
    : 'Not available';

  const transportationDisplay = formData.transportationCondition && formData.transportationCondition !== 'Not Specified'
    ? formData.transportationCondition
    : (formData.transportationCondition || 'Not available');

  const requirementsTableData = [
    [
      { content: 'Food commodity', styles: { fontStyle: 'bold' as const } },
      commodityDisplayName,
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
      { content: 'Primary packaging requirement', styles: { fontStyle: 'bold' as const } },
      { content: formData.primaryConcern || 'Not available', colSpan: 3 },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: requirementsTableData,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      textColor: colorSlateDark,
      cellPadding: 2.2,
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

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // =========================================================================
  // Section 3: Recommended Materials
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.text('Recommended Materials', marginX, currentY);

  currentY += 2;

  if (recommendations.length === 0) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      body: [
        ['No matching recommendation was found for the selected requirements.']
      ],
      theme: 'grid',
      styles: {
        fontSize: 9,
        textColor: colorSlateDark,
        cellPadding: 5,
        lineColor: colorBorder,
        lineWidth: 0.2,
        fillColor: colorWhite,
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  } else {
    recommendations.forEach((rec, idx) => {
      // Allow graceful page break if card doesn't fit on current page
      if (currentY > pageHeight - 45) {
        doc.addPage();
        currentY = 16;
      }

      const mat = rec.material;
      const codeHeader = mat.code ? ` [${mat.code}]` : '';
      const headerTitle = `${idx + 1}. ${mat.name}${codeHeader}`;
      const statusTitle = `Status: ${rec.status || 'Not available'}`;

      const moistureBarrierVal = mat.propertiesSummary?.moistureBarrier || 'Not available';
      const oxygenBarrierVal = mat.propertiesSummary?.oxygenBarrier || 'Not available';
      const punctureVal = mat.propertiesSummary?.punctureResistance || 'Not available';
      const codeVal = mat.code || 'Not available';
      const sourceNameVal = mat.sourceTitle || 'Not available';
      const sourceUrlVal = mat.sourceUrl || 'Not available';
      const hasValidUrl = Boolean(mat.sourceUrl && mat.sourceUrl.trim().length > 0);

      const cardBody = [
        [
          { content: 'Moisture barrier', styles: { fontStyle: 'bold' as const } },
          moistureBarrierVal,
          { content: 'Oxygen barrier', styles: { fontStyle: 'bold' as const } },
          oxygenBarrierVal,
        ],
        [
          { content: 'Material code', styles: { fontStyle: 'bold' as const } },
          codeVal,
          { content: 'Puncture resistance', styles: { fontStyle: 'bold' as const } },
          punctureVal,
        ],
        [
          { content: 'Source name', styles: { fontStyle: 'bold' as const } },
          { content: sourceNameVal, colSpan: 3 },
        ],
        [
          { content: 'Source link', styles: { fontStyle: 'bold' as const } },
          { 
            content: sourceUrlVal, 
            colSpan: 3, 
            styles: { 
              textColor: hasValidUrl ? colorLink : colorSlateDark,
              fontStyle: hasValidUrl ? ('normal' as const) : ('normal' as const),
            } 
          },
        ]
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: marginX, right: marginX },
        head: [[
          { content: headerTitle, colSpan: 3 },
          { content: statusTitle, colSpan: 1, styles: { halign: 'right' } }
        ]],
        body: cardBody,
        theme: 'grid',
        headStyles: {
          fillColor: colorNavy,
          textColor: colorWhite,
          fontSize: 8.5,
          fontStyle: 'bold',
          cellPadding: 2.2,
        },
        styles: {
          fontSize: 8,
          textColor: colorSlateDark,
          cellPadding: 2,
          lineColor: colorSubtleBorder,
          lineWidth: 0.2,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 38, fillColor: colorLightBg },
          1: { cellWidth: 53 },
          2: { cellWidth: 38, fillColor: colorLightBg },
          3: { cellWidth: 53 },
        },
        didDrawCell: (data) => {
          // If valid sourceUrl, add clickable hyperlink on the source link cell
          if (hasValidUrl && data.row.index === 3 && data.column.index === 1) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              url: mat.sourceUrl!,
            });
          }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;
    });
  }

  // =========================================================================
  // Section 4: Short Note
  // =========================================================================
  // Check if note fits on current page (requires ~15mm)
  if (currentY > pageHeight - 22) {
    doc.addPage();
    currentY = 16;
  }

  const shortNoteText = 
    'Recommendations are based on available database records and matching rules. ' +
    'Actual packaging selection requires product-specific testing and verification.';

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: [
      [shortNoteText]
    ],
    theme: 'plain',
    styles: {
      fontSize: 7.5,
      fontStyle: 'italic',
      textColor: colorTextMuted,
      fillColor: colorLightBg,
      cellPadding: 2.5,
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
    const footerY = pageHeight - 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
    doc.text('SmartPack', marginX, footerY);

    if (totalPages > 1) {
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
    }
  }

  // Save / Trigger Download
  const safeCommoditySlug = (matchedCommodity?.id || formData.commodityId || 'commodity')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `SmartPack_Recommendation_Report_${safeCommoditySlug}_${dateCompact}.pdf`;

  doc.save(filename);
}
