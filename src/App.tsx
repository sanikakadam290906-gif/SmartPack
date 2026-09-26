import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { FoodDetails } from './pages/FoodDetails';
import { Results } from './pages/Results';
import type { FoodDetailsFormData, RecommendationOutput, NoMatchExplanation } from './types/recommendation';
import { getPackagingRecommendations } from './services/recommendationService';

const INITIAL_FORM_DATA: FoodDetailsFormData = {
  commodityId: 'banana-chips',
  moistureContent: 2.8,
  moistureSensitivity: 'High',
  oilFatContent: 'High',
  ph: 6.2,
  respirationRate: 'Not Applicable',
  targetShelfLifeValue: 90,
  targetShelfLifeUnit: 'Days',
  storageType: 'Ambient',
  storageTemperature: 25,
  relativeHumidity: 65,
  transportationCondition: 'Normal Transportation',
  primaryConcern: 'Moisture Protection',
};

export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'details' | 'results'>('home');
  const [formData, setFormData] = useState<FoodDetailsFormData>(INITIAL_FORM_DATA);
  const [recommendations, setRecommendations] = useState<RecommendationOutput[] | null>(null);
  const [noMatchExplanation, setNoMatchExplanation] = useState<NoMatchExplanation | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'local_fallback'>('local_fallback');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigateTo = (page: 'home' | 'details' | 'results') => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartRecommendation = () => {
    navigateTo('details');
  };

  const handleFormSubmit = async (data: FoodDetailsFormData) => {
    setFormData(data);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getPackagingRecommendations(data);
      setRecommendations(result.recommendations);
      setDataSource(result.source);
      setNoMatchExplanation(result.noMatchExplanation);
      navigateTo('results');
    } catch (err: any) {
      console.error('Error evaluating recommendations:', err);
      setErrorMessage('An unexpected error occurred while evaluating recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewRecommendation = () => {
    setFormData({
      commodityId: '',
      moistureContent: '',
      moistureSensitivity: 'Medium',
      oilFatContent: 'Medium',
      ph: 7.0,
      respirationRate: 'Not Applicable',
      targetShelfLifeValue: '',
      targetShelfLifeUnit: 'Days',
      storageType: 'Ambient',
      storageTemperature: 25,
      relativeHumidity: 60,
      transportationCondition: 'Normal Transportation',
      primaryConcern: 'Moisture Protection',
    });
    setRecommendations(null);
    setNoMatchExplanation(undefined);
    setErrorMessage(null);
    navigateTo('details');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg-page, #F7F7F5)' }}>
      {/* Top Institutional Navigation Bar */}
      <Navbar 
        currentPage={currentPage}
        onNavigate={navigateTo}
        hasResults={recommendations !== null}
      />

      {/* Main Content Area */}
      {currentPage === 'home' && (
        <Home onStart={handleStartRecommendation} />
      )}

      {currentPage === 'details' && (
        <>
          {errorMessage && (
            <div className="container" style={{ maxWidth: '880px', marginTop: '16px' }}>
              <div 
                style={{
                  backgroundColor: '#FDEDED',
                  color: '#5F2120',
                  border: '1px solid #F5C2C7',
                  borderRadius: 'var(--radius-box, 3px)',
                  padding: '12px 16px',
                  fontSize: '14px',
                }}
              >
                {errorMessage}
              </div>
            </div>
          )}
          <FoodDetails 
            initialData={formData}
            onSubmit={handleFormSubmit}
            onBack={() => navigateTo('home')}
            isLoading={isLoading}
          />
        </>
      )}

      {currentPage === 'results' && recommendations && (
        <Results 
          recommendations={recommendations}
          formData={formData}
          onBackToDetails={() => navigateTo('details')}
          onStartNew={handleStartNewRecommendation}
          dataSource={dataSource}
          noMatchExplanation={noMatchExplanation}
        />
      )}

      {/* Institutional Footer */}
      <footer 
        style={{
          borderTop: '1px solid var(--color-border-grey, #D0D0D0)',
          backgroundColor: '#FFFFFF',
          padding: '16px 0',
          marginTop: 'auto',
        }}
      >
        <div 
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-text-secondary, #555555)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-primary-navy, #062B52)' }}>
            SmartPack
          </div>
          <div>
            Packaging Recommendation System • Decision-Support Portal
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
