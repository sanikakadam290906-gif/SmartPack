import React, { useState } from 'react';
import type { 
  FoodDetailsFormData,
  RecommendationOutput, 
  RecommendationStatus 
} from '../types/recommendation';
import { Button } from '../components/Button';
import { downloadRecommendationReportPdf } from '../services/pdfReportService';

interface ResultsProps {
  recommendations: RecommendationOutput[];
  formData: FoodDetailsFormData;
  onBackToDetails: () => void;
  onStartNew: () => void;
  dataSource?: 'supabase' | 'local_fallback';
}

function getSanitizedNote(note?: string): string {
  if (!note) return '';
  return note
    .replace(/Initial rule-based demo coverage\s*[—-]\s*requires technical validation(\s*before commercial application)?\.?\s*/gi, '')
    .trim();
}

export const Results: React.FC<ResultsProps> = ({
  recommendations,
  formData,
  onBackToDetails,
  onStartNew,
  dataSource = 'local_fallback',
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (recommendations.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      await downloadRecommendationReportPdf({
        recommendations,
        formData,
        dataSource,
      });
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setPdfError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  const getStatusBadgeStyle = (status: RecommendationStatus): React.CSSProperties => {
    switch (status) {
      case 'Recommended for Evaluation':
        return {
          backgroundColor: 'var(--status-eval-bg, #E8EEF5)',
          color: 'var(--status-eval-text, #062B52)',
          border: '1px solid var(--status-eval-border, #BDD0E4)',
        };
      case 'Potentially Suitable':
        return {
          backgroundColor: 'var(--status-suitable-bg, #F5F5F0)',
          color: 'var(--status-suitable-text, #333333)',
          border: '1px solid var(--status-suitable-border, #D0D0D0)',
        };
      case 'Requires Technical Validation':
        return {
          backgroundColor: 'var(--status-validation-bg, #F0F0F0)',
          color: 'var(--status-validation-text, #444444)',
          border: '1px solid var(--status-validation-border, #C8C8C8)',
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          color: '#1F1F1F',
          border: '1px solid #C8C8C8',
        };
    }
  };

  return (
    <main style={{ flex: 1, padding: '36px 0 54px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Page Heading & Short Subtitle */}
        <div style={{ marginBottom: '26px' }}>
          <h1 
            style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              color: 'var(--color-primary-navy, #062B52)', 
              marginBottom: '6px',
              letterSpacing: '-0.01em'
            }}
          >
            Packaging Recommendations
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary, #555555)', margin: 0 }}>
              Recommended packaging materials based on the provided food and storage requirements.
            </p>
            {dataSource === 'supabase' ? (
              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#E8F5E9',
                  color: '#1B5E20',
                  border: '1px solid #A5D6A7',
                  borderRadius: '3px',
                  padding: '2px 8px',
                }}
              >
                Database Active (Supabase)
              </span>
            ) : (
              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#F3F3F3',
                  color: '#555555',
                  border: '1px solid #D0D0D0',
                  borderRadius: '3px',
                  padding: '2px 8px',
                }}
              >
                Local Rules Baseline (Offline Fallback)
              </span>
            )}
          </div>
        </div>

        {/* List of Recommended Materials in Visible 1px Rectangular Boxes */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recommendations.length === 0 ? (
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-box, #C8C8C8)',
                borderRadius: 'var(--radius-box, 3px)',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--color-text-secondary, #555555)',
                fontSize: '16px',
              }}
            >
              No suitable rule found for the selected conditions. Technical evaluation is required.
            </div>
          ) : (
            recommendations.map((rec) => (
              <div 
                key={rec.material.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border-box, #C8C8C8)',
                  borderRadius: 'var(--radius-box, 3px)',
                  padding: '24px',
                  boxShadow: 'none',
                  marginBottom: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header: Material Name, Category, Status */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    gap: '12px',
                    flexWrap: 'wrap',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #ECECEC',
                  }}
                >
                  <div>
                    {/* Material Name */}
                    <h3 
                      style={{ 
                        fontSize: '22px', 
                        fontWeight: 700, 
                        color: 'var(--color-primary-navy, #062B52)', 
                        marginBottom: '4px' 
                      }}
                    >
                      {rec.material.name}
                    </h3>
                    {/* Material Category */}
                    <div style={{ fontSize: '15px', color: 'var(--color-text-secondary, #555555)' }}>
                      Category: {rec.material.category}
                    </div>
                  </div>

                  {/* Recommendation Status */}
                  <span 
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-box, 3px)',
                      whiteSpace: 'nowrap',
                      ...getStatusBadgeStyle(rec.status)
                    }}
                  >
                    {rec.status}
                  </span>
                </div>

                {/* Reason for Recommendation */}
                <div 
                  style={{
                    fontSize: '16px',
                    color: 'var(--color-text-dark, #1F1F1F)',
                    lineHeight: 1.5,
                    padding: '12px 0 6px',
                  }}
                >
                  <strong>Reason for Recommendation:</strong> {rec.primaryReason}
                </div>

                {/* Matched Requirements Explanation */}
                {rec.requirementMatches && (
                  <div style={{ marginTop: '8px', marginBottom: '10px' }}>
                    <div 
                      style={{ 
                        fontSize: '14px', 
                        fontWeight: 700, 
                        color: 'var(--color-primary-navy, #062B52)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        marginBottom: '6px'
                      }}
                    >
                      Matched Requirements:
                    </div>
                    <div 
                      style={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: 'var(--radius-box, 3px)',
                        padding: '10px 14px',
                        fontSize: '14px',
                        color: 'var(--color-text-dark, #1F1F1F)',
                        lineHeight: 1.6,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px 16px' }}>
                        <div>
                          <strong>Food Commodity:</strong> {rec.requirementMatches.commodity}
                        </div>
                        <div>
                          <strong>Storage Condition:</strong> {rec.requirementMatches.storageCondition}
                        </div>
                        <div>
                          <strong>Transportation:</strong> {rec.requirementMatches.transportationCondition}
                        </div>
                        <div>
                          <strong>Shelf-life Requirement:</strong> {rec.requirementMatches.shelfLife}
                        </div>
                        <div>
                          <strong>Moisture Protection:</strong> {rec.requirementMatches.moistureProtection}
                        </div>
                        <div>
                          <strong>Gas Exchange:</strong> {rec.requirementMatches.gasExchange}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Properties Table */}
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                  <div 
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: 'var(--color-primary-navy, #062B52)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      marginBottom: '6px'
                    }}
                  >
                    Key Properties:
                  </div>
                  <table 
                    style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      fontSize: '15px',
                    }}
                  >
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #ECECEC' }}>
                        <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)', width: '35%' }}>
                          Moisture Barrier
                        </td>
                        <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                          {rec.material.propertiesSummary.moistureBarrier}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ECECEC' }}>
                        <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)' }}>
                          Oxygen Barrier
                        </td>
                        <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                          {rec.material.propertiesSummary.oxygenBarrier}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ECECEC' }}>
                        <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)' }}>
                          Puncture Resistance
                        </td>
                        <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                          {rec.material.propertiesSummary.punctureResistance}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)' }}>
                          Operating Temperature
                        </td>
                        <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                          {rec.material.propertiesSummary.operatingTemperature}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Note (Shown only when meaningful content exists) */}
                {(() => {
                  const cleanedNote = getSanitizedNote(rec.technicalNote);
                  if (!cleanedNote) return null;
                  return (
                    <div 
                      style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-text-secondary, #555555)',
                        backgroundColor: 'var(--color-bg-grey, #F3F3F3)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-box, 3px)',
                        border: '1px solid var(--color-border-grey, #D0D0D0)',
                        marginTop: '6px',
                      }}
                    >
                      <strong>Note:</strong> {cleanedNote}
                    </div>
                  );
                })()}

                {/* Source & Data Provenance Section */}
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #ECECEC' }}>
                  <div 
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: 'var(--color-primary-navy, #062B52)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      marginBottom: '6px'
                    }}
                  >
                    Source & Data Provenance:
                  </div>

                  {rec.material.verificationStatus === 'verified' && rec.material.sourceTitle ? (
                    <div 
                      style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-text-dark, #1F1F1F)',
                        backgroundColor: '#F8F9FA',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-box, 3px)',
                        border: '1px solid #E2E8F0',
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                        <div>
                          <strong>Source Title:</strong> {rec.material.sourceTitle}
                        </div>
                        <span 
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#E8F5E9',
                            color: '#1B5E20',
                            border: '1px solid #A5D6A7',
                            borderRadius: '3px',
                            padding: '2px 8px',
                          }}
                        >
                          Verified Source
                        </span>
                      </div>

                      {rec.material.sourceUrl && (
                        <div style={{ marginBottom: '4px', wordBreak: 'break-all' }}>
                          <strong>Verified Link:</strong>{' '}
                          <a 
                            href={rec.material.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#0969DA', textDecoration: 'underline' }}
                          >
                            {rec.material.sourceUrl}
                          </a>
                        </div>
                      )}

                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary, #555555)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {rec.material.sourcePage && (
                          <div>
                            <strong>Section:</strong> {rec.material.sourcePage}
                          </div>
                        )}
                        {rec.material.lastVerifiedAt && (
                          <div>
                            <strong>Last Verified:</strong> {rec.material.lastVerifiedAt}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div 
                      style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-text-secondary, #555555)',
                        backgroundColor: '#FAFAFA',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-box, 3px)',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <span>
                        <strong>Source Reference:</strong> Source information not available
                      </span>
                      <span 
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          border: '1px solid #D1D5DB',
                          borderRadius: '3px',
                          padding: '2px 8px',
                        }}
                      >
                        Not available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid var(--color-border-grey, #D0D0D0)',
          }}
        >
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onBackToDetails}
            id="back-to-details-btn"
          >
            Back to Food Details
          </Button>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || recommendations.length === 0}
              id="download-pdf-report-btn"
            >
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </Button>

            <Button 
              type="button" 
              variant="secondary" 
              onClick={onStartNew}
              id="start-new-recommendation-btn"
            >
              Start New Recommendation
            </Button>
          </div>
        </div>

        {pdfError && (
          <div 
            style={{
              marginTop: '12px',
              backgroundColor: '#FDEDED',
              color: '#5F2120',
              border: '1px solid #F5C2C7',
              borderRadius: '3px',
              padding: '10px 14px',
              fontSize: '14px',
            }}
          >
            {pdfError}
          </div>
        )}



      </div>
    </main>
  );
};
