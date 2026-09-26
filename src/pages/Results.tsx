import React, { useState } from 'react';
import { ILLUSTRATIVE_COMMODITIES } from '../data/commodities';
import type { 
  FoodDetailsFormData,
  RecommendationOutput, 
  RecommendationStatus,
  NoMatchExplanation
} from '../types/recommendation';
import { Button } from '../components/Button';
import { downloadRecommendationReportPdf } from '../services/pdfReportService';
import { determineNoMatchReason } from '../services/recommendationService';

interface ResultsProps {
  recommendations: RecommendationOutput[];
  formData: FoodDetailsFormData;
  onBackToDetails: () => void;
  onStartNew: () => void;
  dataSource?: 'supabase' | 'local_fallback';
  noMatchExplanation?: NoMatchExplanation;
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
  noMatchExplanation,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const effectiveNoMatch = noMatchExplanation || determineNoMatchReason(formData);

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

  const getDisplayStatus = (status: RecommendationStatus | string): 'Recommended' | 'Alternative' => {
    if (status === 'Recommended' || status === 'Recommended for Evaluation') {
      return 'Recommended';
    }
    return 'Alternative';
  };

  const getStatusBadgeStyle = (displayStatus: 'Recommended' | 'Alternative'): React.CSSProperties => {
    switch (displayStatus) {
      case 'Recommended':
        return {
          backgroundColor: 'var(--status-eval-bg, #E8EEF5)',
          color: 'var(--status-eval-text, #062B52)',
          border: '1px solid var(--status-eval-border, #BDD0E4)',
        };
      case 'Alternative':
      default:
        return {
          backgroundColor: 'var(--status-suitable-bg, #F5F5F0)',
          color: 'var(--status-suitable-text, #333333)',
          border: '1px solid var(--status-suitable-border, #D0D0D0)',
        };
    }
  };

  const selectedCommodity = ILLUSTRATIVE_COMMODITIES.find((c) => c.id === formData.commodityId);
  const commodityName = selectedCommodity ? `${selectedCommodity.name} [${selectedCommodity.category}]` : formData.commodityId || 'Not Specified';
  const shelfLifeDisplay = formData.targetShelfLifeValue ? `${formData.targetShelfLifeValue} ${formData.targetShelfLifeUnit}` : 'Not Specified';
  const storageDisplay = `${formData.storageType || 'Ambient'} (${formData.storageTemperature !== '' ? formData.storageTemperature : '25'}°C, ${formData.relativeHumidity || '60'}% RH)`;

  return (
    <main style={{ flex: 1, padding: '28px 0 44px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Page Title & Status */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
            <h1 
              style={{ 
                fontSize: 'clamp(22px, 3.5vw, 28px)', 
                fontWeight: 700, 
                color: 'var(--color-primary-navy, #062B52)', 
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              Packaging Recommendations
            </h1>

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
                  whiteSpace: 'nowrap',
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
                  whiteSpace: 'nowrap',
                }}
              >
                Local Rules Baseline (Offline Fallback)
              </span>
            )}
          </div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary, #555555)', margin: 0 }}>
            Evaluated packaging options based on your product characteristics and storage specifications.
          </p>
        </div>

        {/* 1. Your Requirements Summary Box */}
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border-grey, #D0D0D0)',
            borderRadius: 'var(--radius-box, 3px)',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #F0F0F0', paddingBottom: '8px' }}>
            <h2 
              style={{ 
                fontSize: '17px', 
                fontWeight: 700, 
                color: 'var(--color-primary-navy, #062B52)',
                margin: 0,
              }}
            >
              Your Requirements
            </h2>
            <button
              type="button"
              onClick={onBackToDetails}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-secondary-blue, #1E4F85)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Modify Requirements
            </button>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', 
              gap: '12px 18px',
              fontSize: '14px',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-secondary, #555555)', display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                Commodity
              </span>
              <strong style={{ color: 'var(--color-text-dark, #1F1F1F)' }}>{commodityName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary, #555555)', display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                Storage & Shelf Life
              </span>
              <strong style={{ color: 'var(--color-text-dark, #1F1F1F)' }}>{storageDisplay} • {shelfLifeDisplay}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary, #555555)', display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                Transportation
              </span>
              <strong style={{ color: 'var(--color-text-dark, #1F1F1F)' }}>{formData.transportationCondition}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary, #555555)', display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                Primary Concern
              </span>
              <strong style={{ color: 'var(--color-text-dark, #1F1F1F)' }}>{formData.primaryConcern}</strong>
            </div>
          </div>
        </div>

        {/* 2. Recommended Packaging Header */}
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 
            style={{ 
              fontSize: '19px', 
              fontWeight: 700, 
              color: 'var(--color-primary-navy, #062B52)',
              margin: 0,
            }}
          >
            Recommended Packaging
          </h2>
          {recommendations.length > 0 && (
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #555555)' }}>
              {recommendations.length} {recommendations.length === 1 ? 'material matched' : 'materials matched'}
            </span>
          )}
        </div>

        {/* 3. List of Materials or Clean No-Match State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {recommendations.length === 0 ? (
            /* Clean No-Match Result State (Informative, NOT an error alert) */
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-grey, #D0D0D0)',
                borderRadius: 'var(--radius-box, 3px)',
                padding: 'clamp(20px, 4vw, 32px)',
              }}
            >
              <h2 
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--color-primary-navy, #062B52)',
                  marginBottom: '16px',
                  marginTop: 0,
                }}
              >
                No suitable packaging found
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <h3 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    color: 'var(--color-primary-navy, #062B52)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.03em',
                    marginBottom: '8px',
                  }}
                >
                  Why?
                </h3>
                <div 
                  style={{
                    backgroundColor: 'var(--color-bg-subtle, #F4F6F8)',
                    border: '1px solid var(--color-border-grey, #D0D0D0)',
                    borderRadius: 'var(--radius-box, 3px)',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: 'var(--color-text-dark, #1F1F1F)',
                    lineHeight: 1.6,
                  }}
                >
                  {effectiveNoMatch.userMessage}
                </div>
              </div>

              {effectiveNoMatch.suggestedChanges && effectiveNoMatch.suggestedChanges.length > 0 && (
                <div>
                  <h3 
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: 'var(--color-primary-navy, #062B52)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.03em',
                      marginBottom: '8px',
                    }}
                  >
                    Try changing:
                  </h3>
                  <ul 
                    style={{ 
                      margin: 0, 
                      paddingLeft: '20px', 
                      fontSize: '14px', 
                      color: 'var(--color-text-dark, #1F1F1F)',
                      lineHeight: 1.8,
                    }}
                  >
                    {effectiveNoMatch.suggestedChanges.map((suggestion, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            recommendations.map((rec) => {
              const displayStatus = getDisplayStatus(rec.status);
              const cleanedNote = getSanitizedNote(rec.technicalNote);

              return (
                <div 
                  key={rec.material.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border-box, #C8C8C8)',
                    borderRadius: 'var(--radius-box, 3px)',
                    padding: 'clamp(16px, 3.5vw, 24px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Card Header: Material Name, Category, Status Badge */}
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
                      <h3 
                        style={{ 
                          fontSize: '20px', 
                          fontWeight: 700, 
                          color: 'var(--color-primary-navy, #062B52)', 
                          marginBottom: '3px' 
                        }}
                      >
                        {rec.material.name}
                      </h3>
                      <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #555555)' }}>
                        Category: {rec.material.category}
                      </div>
                    </div>

                    <span 
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-box, 3px)',
                        whiteSpace: 'nowrap',
                        ...getStatusBadgeStyle(displayStatus)
                      }}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  {/* Why this material? */}
                  <div>
                    <div 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 700, 
                        color: 'var(--color-primary-navy, #062B52)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        marginBottom: '4px'
                      }}
                    >
                      Why this material?
                    </div>
                    <div 
                      style={{
                        fontSize: '15px',
                        color: 'var(--color-text-dark, #1F1F1F)',
                        lineHeight: 1.5,
                      }}
                    >
                      {rec.primaryReason}
                    </div>
                  </div>

                  {/* Key Properties (Scannable 2-4 key barrier metrics) */}
                  <div>
                    <div 
                      style={{ 
                        fontSize: '13px', 
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
                        fontSize: '14px',
                      }}
                    >
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)', width: '38%' }}>
                            Moisture Barrier
                          </td>
                          <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                            {rec.material.propertiesSummary.moistureBarrier}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)' }}>
                            Oxygen Barrier
                          </td>
                          <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                            {rec.material.propertiesSummary.oxygenBarrier}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)' }}>
                            Puncture Resistance
                          </td>
                          <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                            {rec.material.propertiesSummary.punctureResistance}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-text-dark, #1F1F1F)' }}>
                            Operating Temp
                          </td>
                          <td style={{ padding: '6px 0', color: 'var(--color-text-secondary, #555555)' }}>
                            {rec.material.propertiesSummary.operatingTemperature}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Collapsible Technical Details & Provenance */}
                  <details className="gov-details">
                    <summary className="gov-details-summary">
                      <span>Technical Details & Provenance</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-blue, #1E4F85)' }}>
                        Details
                      </span>
                    </summary>

                    <div className="gov-details-content">
                      {/* Matched Requirements */}
                      {rec.requirementMatches && (
                        <div style={{ marginBottom: '14px' }}>
                          <div 
                            style={{ 
                              fontSize: '13px', 
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
                              backgroundColor: '#F8F9FA',
                              border: '1px solid #E5E7EB',
                              borderRadius: 'var(--radius-box, 3px)',
                              padding: '10px 14px',
                              fontSize: '13px',
                              color: 'var(--color-text-dark, #1F1F1F)',
                              lineHeight: 1.6,
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '6px 14px' }}>
                              <div><strong>Food Commodity:</strong> {rec.requirementMatches.commodity}</div>
                              <div><strong>Storage Condition:</strong> {rec.requirementMatches.storageCondition}</div>
                              <div><strong>Transportation:</strong> {rec.requirementMatches.transportationCondition}</div>
                              <div><strong>Shelf-life:</strong> {rec.requirementMatches.shelfLife}</div>
                              <div><strong>Moisture Protection:</strong> {rec.requirementMatches.moistureProtection}</div>
                              <div><strong>Gas Exchange:</strong> {rec.requirementMatches.gasExchange}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Technical Note */}
                      {cleanedNote && (
                        <div 
                          style={{ 
                            fontSize: '13px', 
                            color: 'var(--color-text-secondary, #555555)',
                            backgroundColor: 'var(--color-bg-subtle, #F4F6F8)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-box, 3px)',
                            border: '1px solid var(--color-border-grey, #D0D0D0)',
                            marginBottom: '14px',
                          }}
                        >
                          <strong>Note:</strong> {cleanedNote}
                        </div>
                      )}

                      {/* Source & Data Provenance */}
                      <div>
                        <div 
                          style={{ 
                            fontSize: '13px', 
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
                              fontSize: '13px', 
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

                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #555555)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                              {rec.material.sourcePage && (
                                <div><strong>Section:</strong> {rec.material.sourcePage}</div>
                              )}
                              {rec.material.lastVerifiedAt && (
                                <div><strong>Last Verified:</strong> {rec.material.lastVerifiedAt}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div 
                            style={{ 
                              fontSize: '13px', 
                              color: 'var(--color-text-secondary, #555555)',
                              backgroundColor: '#FAFAFA',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-box, 3px)',
                              border: '1px solid #E5E7EB',
                            }}
                          >
                            Source reference: Baseline technical database records.
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Action Buttons with Clear Hierarchy */}
        {recommendations.length > 0 ? (
          <div className="gov-action-group" style={{ marginTop: '28px' }}>
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              id="download-pdf-report-btn"
              fullWidthOnMobile
            >
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </Button>

            <div className="gov-action-group-right">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onBackToDetails}
                id="back-to-details-btn"
                fullWidthOnMobile
              >
                Back to Food Details
              </Button>

              <Button 
                type="button" 
                variant="secondary" 
                onClick={onStartNew}
                id="start-new-recommendation-btn"
                fullWidthOnMobile
              >
                Start New Recommendation
              </Button>
            </div>
          </div>
        ) : (
          <div className="gov-action-group" style={{ marginTop: '28px' }}>
            <Button 
              type="button" 
              variant="primary" 
              onClick={onBackToDetails}
              id="back-to-details-btn"
              fullWidthOnMobile
            >
              Modify Food Details
            </Button>

            <Button 
              type="button" 
              variant="secondary" 
              onClick={onStartNew}
              id="start-new-recommendation-btn"
              fullWidthOnMobile
            >
              Start New Recommendation
            </Button>
          </div>
        )}

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
