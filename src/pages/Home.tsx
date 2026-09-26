import React from 'react';
import { Button } from '../components/Button';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <main style={{ flex: 1, paddingBottom: '48px' }}>
      
      {/* 1. HERO SECTION */}
      <section className="home-section" style={{ paddingTop: '36px' }}>
        <div className="container">
          <div className="home-hero-grid">
            
            {/* Left Column: Text & Primary CTA */}
            <div>
              <span className="home-section-tag">
                SMART FOOD PACKAGING
              </span>

              <h1 
                style={{
                  fontSize: 'clamp(26px, 3.8vw, 36px)',
                  fontWeight: 700,
                  color: 'var(--color-primary-navy, #062B52)',
                  lineHeight: 1.25,
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                Choose the Right Packaging for Your Food
              </h1>

              <p 
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'var(--color-text-dark, #1F1F1F)',
                  marginBottom: '28px',
                  maxWidth: '520px',
                }}
              >
                SmartPack helps food producers and small businesses identify suitable packaging options based on food type, storage, shelf life, transportation and packaging requirements.
              </p>

              <div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={onStart}
                  id="start-recommendation-btn"
                  fullWidthOnMobile
                >
                  Get Started
                </Button>
              </div>

              <div 
                style={{
                  marginTop: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary, #555555)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ color: 'var(--color-secondary-blue, #1E4F85)', flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Institutional Decision Support • Verified Technical Baseline</span>
              </div>
            </div>

            {/* Right Column: Strong Hero Image */}
            <div>
              <div className="home-hero-img-wrapper">
                <img 
                  src="/images/hero_food_packaging.jpg" 
                  alt="Fresh produce and packaged food products displayed with various packaging materials and containers"
                  className="home-hero-img"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW SMARTPACK WORKS */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-header">
            <span className="home-section-tag">
              EVALUATION PROCESS
            </span>
            <h2 className="home-section-title">
              How SmartPack Works
            </h2>
            <p className="home-section-desc">
              A straightforward three-step method to screen packaging materials against commodity and supply chain constraints.
            </p>
          </div>

          <div className="home-steps-grid">
            {/* Step 01 */}
            <div className="home-step-card">
              <span className="home-step-number" aria-hidden="true">01</span>
              <h3 className="home-step-title">Select Your Food</h3>
              <p className="home-step-desc">
                Choose the food commodity you want to package from standard produce, bakery, snack, and dairy classifications.
              </p>
            </div>

            {/* Step 02 */}
            <div className="home-step-card">
              <span className="home-step-number" aria-hidden="true">02</span>
              <h3 className="home-step-title">Enter Requirements</h3>
              <p className="home-step-desc">
                Specify storage condition, target shelf life, transportation mode, and primary barrier requirements.
              </p>
            </div>

            {/* Step 03 */}
            <div className="home-step-card">
              <span className="home-step-number" aria-hidden="true">03</span>
              <h3 className="home-step-title">Get Recommendations</h3>
              <p className="home-step-desc">
                SmartPack identifies suitable packaging materials from the available material database with clear technical justifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOD + PACKAGING VISUAL SECTION */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-header">
            <span className="home-section-tag">
              COMMODITY CONSIDERATIONS
            </span>
            <h2 className="home-section-title">
              Packaging Depends on the Food
            </h2>
            <p className="home-section-desc">
              Different foods have different packaging requirements. SmartPack considers these requirements when suggesting suitable materials.
            </p>
          </div>

          {/* 6 Visual Categories Grid */}
          <div className="home-categories-grid">
            
            {/* 1. Fresh Fruits */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/category_fresh_fruits.jpg" 
                  alt="Fresh apples, strawberries, blueberries, and grapes in ventilated packaging"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <span className="home-card-tag">Ventilated Packaging</span>
                <h3 className="home-card-title">Fresh Fruits</h3>
                <p className="home-card-text">
                  Fresh apples, berries, and grapes requiring breathable or ventilated packaging to regulate respiration and moisture exchange.
                </p>
              </div>
            </div>

            {/* 2. Fresh Vegetables */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/category_fresh_vegetables.jpg" 
                  alt="Leafy salad greens, broccoli florets, and carrots in transparent produce packaging"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <span className="home-card-tag">Moisture & Clarity</span>
                <h3 className="home-card-title">Fresh Vegetables</h3>
                <p className="home-card-text">
                  Leafy greens, broccoli, and carrots in transparent produce packaging engineered for shelf-life extension and fog resistance.
                </p>
              </div>
            </div>

            {/* 3. Snacks */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/category_dry_snacks.jpg" 
                  alt="Crispy chips and roasted nuts in metallized barrier pouches"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <span className="home-card-tag">Moisture & Oxygen Barrier</span>
                <h3 className="home-card-title">Dry Snacks</h3>
                <p className="home-card-text">
                  Chips, crisps, and roasted snacks requiring high-barrier flexible packaging against moisture absorption and lipid oxidation.
                </p>
              </div>
            </div>

            {/* 4. Dairy Products */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/category_dairy.jpg" 
                  alt="Carton of fresh milk, cheese wedge in vacuum pack, and yogurt cup"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <span className="home-card-tag">Light & Oxygen Protection</span>
                <h3 className="home-card-title">Dairy Products</h3>
                <p className="home-card-text">
                  Milk, cheese, and yogurt protected by light barrier, oxygen barrier, and hygienic food-grade containment systems.
                </p>
              </div>
            </div>

            {/* 5. Cereals & Grains */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/category_grains.jpg" 
                  alt="Organic quinoa, brown rice, and lentils in kraft pouches with clear windows"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <span className="home-card-tag">Durability & Dry Storage</span>
                <h3 className="home-card-title">Cereals & Grains</h3>
                <p className="home-card-text">
                  Rice, grains, and pulses packaged in durable pouches and bags to protect against ambient humidity and physical handling.
                </p>
              </div>
            </div>

            {/* 6. Spices */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/category_spices.jpg" 
                  alt="Turmeric and paprika in airtight barrier foil pouches alongside glass jars"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <span className="home-card-tag">Aroma & Flavor Seal</span>
                <h3 className="home-card-title">Spices</h3>
                <p className="home-card-text">
                  Ground spices and whole botanicals requiring airtight barrier packaging to preserve volatile flavor oils and prevent caking.
                </p>
              </div>
            </div>

          </div>

          {/* Visual Illustration Disclaimer */}
          <div 
            style={{
              marginTop: '20px',
              padding: '10px 16px',
              backgroundColor: 'var(--color-bg-subtle, #F4F6F8)',
              border: '1px solid var(--color-border-grey, #D0D0D0)',
              borderRadius: 'var(--radius-box, 3px)',
              fontSize: '13px',
              color: 'var(--color-text-secondary, #555555)',
              lineHeight: 1.5,
            }}
          >
            <strong>Note:</strong> Imagery shown above serves as visual illustration of commercial packaging formats. Technical recommendations are computed individually based on your commodity parameters and database verification.
          </div>
        </div>
      </section>

      {/* 4. PACKAGING MATERIALS SECTION */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-header">
            <span className="home-section-tag">
              MATERIAL DIVERSITY
            </span>
            <h2 className="home-section-title">
              Different Packaging, Different Needs
            </h2>
            <p className="home-section-desc">
              From flexible barrier films to eco-friendly paperboard and rigid ventilated containers, each packaging format serves distinct protective functions.
            </p>
          </div>

          <div className="home-materials-grid">
            
            {/* Material 1: Flexible Barrier Films */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/material_flexible_films.jpg" 
                  alt="Industrial rolls of barrier packaging film with vacuum pouches and stand-up bags"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <h3 className="home-card-title">Flexible Barrier Films</h3>
                <p className="home-card-text">
                  Multi-layer polymer and metallized laminates (BOPP, PET, PE, CPP) engineered for high barrier defense against moisture vapor, oxygen ingress, and light degradation.
                </p>
              </div>
            </div>

            {/* Material 2: Paperboard & Renewable Materials */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/material_paperboard_eco.jpg" 
                  alt="Eco-friendly paper and cardboard food containers, trays, and molded pulp boxes"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <h3 className="home-card-title">Paperboard & Renewable Formats</h3>
                <p className="home-card-text">
                  Recyclable kraft cartons, corrugated trays, and molded fiber formats offering mechanical rigidity, shock absorption, and sustainable retail presentation.
                </p>
              </div>
            </div>

            {/* Material 3: Rigid & Ventilated Containers */}
            <div className="home-card">
              <div className="home-card-img-wrap">
                <img 
                  src="/images/material_rigid_clamshells.jpg" 
                  alt="Thermoformed transparent clamshells and produce punnets with ventilation holes"
                  className="home-card-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-card-body">
                <h3 className="home-card-title">Rigid & Ventilated Containers</h3>
                <p className="home-card-text">
                  Thermoformed PET containers, clamshells, and punnets featuring precision ventilation to manage produce respiration while preventing physical damage during transit.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. BOTTOM CALL TO ACTION */}
      <section style={{ paddingTop: '40px' }}>
        <div className="container">
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border-grey, #D0D0D0)',
              borderRadius: 'var(--radius-box, 3px)',
              padding: 'clamp(24px, 4vw, 40px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h2 
              style={{
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 700,
                color: 'var(--color-primary-navy, #062B52)',
                marginBottom: '10px',
              }}
            >
              Ready to find the right packaging?
            </h2>
            <p 
              style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary, #555555)',
                maxWidth: '600px',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              Start an evaluation to match your commodity, environmental storage parameters, and distribution needs with verified packaging materials.
            </p>
            <div style={{ width: '100%', maxWidth: '280px' }}>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={onStart}
                fullWidthOnMobile
                style={{ width: '100%' }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};
