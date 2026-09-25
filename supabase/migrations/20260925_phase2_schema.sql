-- ========================================================================
-- FoodPack AI — Phase 2 Database Migration Schema (SIH PS 26236)
-- Target: PostgreSQL / Supabase
-- Description: Core tables, relational constraints, Row Level Security, 
--              and consolidated screening rules for food packaging evaluation.
-- Status: CONSOLIDATED SCHEMA (Ready for manual execution in Supabase SQL Editor)
-- ========================================================================

-- Enable pgcrypto extension for UUID generation if needed in the future
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 1. Table: packaging_materials
-- Stores base catalog records for packaging substrates and laminates.
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.packaging_materials (
    id TEXT PRIMARY KEY,                                -- Unique slug (e.g. 'bopp-met-cpp')
    code VARCHAR(50) UNIQUE NOT NULL,                   -- Standardized material code (e.g. 'MET-BOPP/CPP')
    name VARCHAR(255) NOT NULL,                         -- Formal material name
    category VARCHAR(100) NOT NULL,                     -- Substrate classification
    description TEXT,                                   -- Engineering summary / physical description
    is_active BOOLEAN DEFAULT TRUE NOT NULL,            -- Visibility toggle
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================================================
-- 2. Table: material_barrier_properties
-- Stores quantified or qualitative barrier and mechanical attributes.
-- Unknown or unverified numerical values remain NULL.
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.material_barrier_properties (
    id TEXT PRIMARY KEY,                                -- Unique property record ID
    material_id TEXT NOT NULL REFERENCES public.packaging_materials(id) ON DELETE CASCADE,
    wvtr_value NUMERIC(10,3) CHECK (wvtr_value IS NULL OR wvtr_value >= 0),
    wvtr_unit VARCHAR(30) DEFAULT 'g/m2/day',
    wvtr_test_condition VARCHAR(150),                   -- e.g. '38°C, 90% RH (ASTM F1249)'
    otr_value NUMERIC(10,3) CHECK (otr_value IS NULL OR otr_value >= 0),
    otr_unit VARCHAR(30) DEFAULT 'cc/m2/day/atm',
    otr_test_condition VARCHAR(150),                    -- e.g. '23°C, 0% RH (ASTM D3985)'
    puncture_resistance VARCHAR(50),                    -- e.g. 'Moderate', 'High', 'Very High'
    temp_min_c NUMERIC(5,1),                            -- Minimum operating temperature in °C
    temp_max_c NUMERIC(5,1),                            -- Maximum operating temperature in °C
    test_standard VARCHAR(100),                         -- Standard method (e.g. 'ASTM F1249 / D3985')
    data_source VARCHAR(255),                           -- Citation, test institute, or reference handbook
    verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED_DEMO'
        CHECK (verification_status IN ('UNVERIFIED_DEMO', 'LITERATURE_BASELINE', 'LAB_VERIFIED')),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_temp_range CHECK (temp_min_c IS NULL OR temp_max_c IS NULL OR temp_min_c <= temp_max_c),
    CONSTRAINT uq_material_barrier_material_id UNIQUE (material_id)
);

-- ========================================================================
-- 3. Table: food_commodities
-- Stores baseline parameters for standard food items and categories.
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.food_commodities (
    id TEXT PRIMARY KEY,                                -- Unique slug (e.g. 'banana-chips')
    name VARCHAR(255) NOT NULL,                         -- Common commodity name
    category VARCHAR(100) NOT NULL,                     -- Food group classification
    default_moisture_content NUMERIC(5,2) 
        CHECK (default_moisture_content IS NULL OR (default_moisture_content >= 0 AND default_moisture_content <= 100)),
    default_moisture_sensitivity VARCHAR(20) NOT NULL 
        CHECK (default_moisture_sensitivity IN ('Low', 'Medium', 'High')),
    default_oil_fat_content VARCHAR(20) NOT NULL 
        CHECK (default_oil_fat_content IN ('Low', 'Medium', 'High')),
    default_ph NUMERIC(4,2) 
        CHECK (default_ph IS NULL OR (default_ph >= 0.0 AND default_ph <= 14.0)),
    default_respiration_rate VARCHAR(30) NOT NULL 
        CHECK (default_respiration_rate IN ('Very Low', 'Low', 'Moderate', 'High', 'Very High', 'Not Applicable')),
    default_storage_type VARCHAR(20) NOT NULL 
        CHECK (default_storage_type IN ('Ambient', 'Chilled', 'Frozen')),
    default_shelf_life_days INTEGER NOT NULL 
        CHECK (default_shelf_life_days > 0),
    default_temp_c NUMERIC(5,1) NOT NULL 
        CHECK (default_temp_c >= -50.0 AND default_temp_c <= 70.0),
    default_humidity_percent NUMERIC(5,1) NOT NULL 
        CHECK (default_humidity_percent >= 0.0 AND default_humidity_percent <= 100.0),
    default_transportation VARCHAR(100) NOT NULL,
    default_concern VARCHAR(100) NOT NULL,
    technical_description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================================================
-- 4. Table: recommendation_rules
-- Stores transparent heuristic rules matching food criteria to materials.
-- Uses native arrays for multi-condition transportation and concerns.
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.recommendation_rules (
    id TEXT PRIMARY KEY,                                -- Unique rule slug (e.g. 'rule-fruits-microperf')
    rule_name VARCHAR(150) NOT NULL,                    -- Descriptive rule name
    commodity_category VARCHAR(100),                    -- Matches specific category, or NULL for universal non-produce
    storage_type VARCHAR(20) 
        CHECK (storage_type IS NULL OR storage_type IN ('Ambient', 'Chilled', 'Frozen')),
    min_shelf_life_days INTEGER DEFAULT 0 NOT NULL 
        CHECK (min_shelf_life_days >= 0),
    max_shelf_life_days INTEGER 
        CHECK (max_shelf_life_days IS NULL OR max_shelf_life_days >= min_shelf_life_days),
    requires_breathability BOOLEAN NOT NULL DEFAULT FALSE, -- Safety constraint for living produce
    applicable_transportation TEXT[] DEFAULT NULL,       -- Matches exact dropdown strings or NULL (all)
    applicable_concerns TEXT[] DEFAULT NULL,             -- Matches exact concern strings or NULL (all)
    suitable_material_id TEXT NOT NULL REFERENCES public.packaging_materials(id) ON DELETE CASCADE,
    recommendation_status VARCHAR(50) NOT NULL 
        CHECK (recommendation_status IN ('Recommended for Evaluation', 'Potentially Suitable', 'Requires Technical Validation')),
    primary_reason TEXT NOT NULL,                       -- 1-2 sentence rationale
    technical_note TEXT,                                -- Engineering disclaimer / cautionary note
    priority_order INTEGER DEFAULT 1 NOT NULL 
        CHECK (priority_order > 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================================================
-- 5. Row Level Security (RLS) Configuration
-- Ensures public read access for prototype visitors with zero public write permissions.
-- ========================================================================

ALTER TABLE public.packaging_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_barrier_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_rules ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies
DROP POLICY IF EXISTS "Public read access on packaging_materials" ON public.packaging_materials;
CREATE POLICY "Public read access on packaging_materials" 
    ON public.packaging_materials FOR SELECT TO anon 
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read access on material_barrier_properties" ON public.material_barrier_properties;
CREATE POLICY "Public read access on material_barrier_properties" 
    ON public.material_barrier_properties FOR SELECT TO anon 
    USING (
        EXISTS (
            SELECT 1 FROM public.packaging_materials pm 
            WHERE pm.id = material_barrier_properties.material_id 
              AND pm.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Public read access on food_commodities" ON public.food_commodities;
CREATE POLICY "Public read access on food_commodities" 
    ON public.food_commodities FOR SELECT TO anon 
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read access on recommendation_rules" ON public.recommendation_rules;
CREATE POLICY "Public read access on recommendation_rules" 
    ON public.recommendation_rules FOR SELECT TO anon 
    USING (is_active = TRUE);

-- ========================================================================
-- 6. Initial Seed Data: Known Materials (Preserving Existing Slugs)
-- Note: Barrier properties with no validated lab source remain NULL.
-- ========================================================================

INSERT INTO public.packaging_materials (id, code, name, category, description)
VALUES
    ('bopp-met-cpp', 'MET-BOPP/CPP', 'Metallized BOPP / CPP Laminate (Met-BOPP/CPP)', 'Flexible Barrier Laminate', 'Industry standard flexible multi-layer substrate for moisture-sensitive dry snacks and confectionery.'),
    ('pet-alox-pe', 'PET-ALOX/PE', 'PET-AlOx / Polyethylene Multi-layer Film', 'Transparent High-Barrier Film', 'Vacuum-deposited aluminum oxide on PET paired with PE sealant for high optical transparency and gas barrier.'),
    ('evoh-multilayer-pe', 'EVOH/PE-COEX', 'EVOH Co-extruded Polyethylene Multi-layer Film', 'Co-extruded High-Barrier Film', 'High-performance barrier co-extrusion with EVOH core for oxygen-sensitive dairy and refrigerated perishables.'),
    ('micro-perf-pp', 'PP-MICROPERF', 'Micro-perforated Polypropylene (Ventilated Film)', 'Breathable Polyolefin Film', 'Engineered micro-perforated membrane for equilibrium modified atmosphere packaging (EMAP) of fresh produce.'),
    ('hdpe-monofilm', 'HDPE-MONO', 'Mono-material High-Density Polyethylene (HDPE)', 'Recyclable Mono-material Polyolefin', 'Mechanically resilient mono-material polyolefin with high moisture resistance and cold impact crack resistance.'),
    ('opa-cpp-laminate', 'OPA/CPP', 'Oriented Polyamide / Cast Polypropylene (OPA/CPP)', 'High-Puncture Barrier Laminate', 'Biaxially oriented nylon laminated to cast PP providing extreme tensile strength and flex-crack resistance.'),
    ('kraft-bio-pbs', 'KRAFT-BIO-PBS', 'Kraft Paper with Bio-PBS Dispersion Coating', 'Renewable Coated Paperboard', 'Renewable virgin kraft substrate coated with bio-based polybutylene succinate dispersion for moderate barrier needs.'),
    ('pet-alu-pe', 'PET/ALU/PE', 'Tri-laminate Aluminum Foil (PET / Alu / PE)', 'Total Impermeable Barrier Foil', 'Aluminum foil core laminate delivering near-zero moisture, oxygen, and light transmission for extended shelf-life targets.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description;

-- Initial Literature Baseline Properties (Unverified numerical values remain NULL)
INSERT INTO public.material_barrier_properties 
    (id, material_id, wvtr_value, wvtr_unit, wvtr_test_condition, otr_value, otr_unit, otr_test_condition, puncture_resistance, temp_min_c, temp_max_c, test_standard, data_source, verification_status)
VALUES
    ('prop-bopp-met-cpp', 'bopp-met-cpp', NULL, 'g/m2/day', '38°C, 90% RH (ASTM F1249)', NULL, 'cc/m2/day/atm', '23°C, 0% RH (ASTM D3985)', 'Moderate', 10.0, 45.0, 'ASTM F1249 / D3985', 'IIP Food Packaging Handbook Vol. 2', 'LITERATURE_BASELINE'),
    ('prop-pet-alox-pe', 'pet-alox-pe', NULL, 'g/m2/day', '38°C, 90% RH (ASTM F1249)', NULL, 'cc/m2/day/atm', '23°C, 0% RH (ASTM D3985)', 'High', 0.0, 50.0, 'ASTM F1249 / D3985', 'CFTRI Barrier Film Compendium', 'LITERATURE_BASELINE'),
    ('prop-evoh-pe', 'evoh-multilayer-pe', NULL, 'g/m2/day', '38°C, 90% RH (ASTM F1249)', NULL, 'cc/m2/day/atm', '23°C, 0% RH (ASTM D3985)', 'High', -20.0, 40.0, 'ASTM F1249 / D3985', 'Packaging Technology & Science (Wiley)', 'LITERATURE_BASELINE'),
    ('prop-micro-perf-pp', 'micro-perf-pp', NULL, 'g/m2/day', 'Controlled Breathable Flux', NULL, 'cc/m2/day/atm', '23°C (Permeable O2/CO2 flux)', 'Moderate', 2.0, 25.0, 'ISO 15106', 'Postharvest Biology & Technology Compendium', 'LITERATURE_BASELINE'),
    ('prop-hdpe-mono', 'hdpe-monofilm', NULL, 'g/m2/day', '38°C, 90% RH (ASTM F1249)', NULL, 'cc/m2/day/atm', '23°C, 0% RH (ASTM D3985)', 'High impact toughness', -40.0, 60.0, 'ASTM F1249 / ASTM D882', 'Polymer Engineering Handbook', 'LITERATURE_BASELINE'),
    ('prop-opa-cpp', 'opa-cpp-laminate', NULL, 'g/m2/day', '38°C, 90% RH (ASTM F1249)', NULL, 'cc/m2/day/atm', '23°C, 0% RH (ASTM D3985)', 'Very High (Abrasion resistant)', -18.0, 100.0, 'ASTM F1306', 'Technical Barrier Materials Data', 'LITERATURE_BASELINE'),
    ('prop-kraft-bio', 'kraft-bio-pbs', NULL, 'g/m2/day', '23°C, 85% RH (ASTM E96)', NULL, 'cc/m2/day/atm', '23°C, 0% RH (ASTM D3985)', 'Moderate tensile strength', 15.0, 30.0, 'ASTM E96 / TAPPI T464', 'Bio-based Polymers in Food Packaging', 'LITERATURE_BASELINE'),
    ('prop-pet-alu-pe', 'pet-alu-pe', NULL, 'g/m2/day', '38°C, 90% RH (Hermetic)', NULL, 'cc/m2/day/atm', '23°C, 0% RH (Hermetic)', 'High', -30.0, 80.0, 'ASTM F1249 / ASTM D3985', 'Aluminum Association Packaging Data', 'LITERATURE_BASELINE')
ON CONFLICT (material_id) DO UPDATE SET
    temp_min_c = EXCLUDED.temp_min_c,
    temp_max_c = EXCLUDED.temp_max_c,
    puncture_resistance = EXCLUDED.puncture_resistance,
    verification_status = EXCLUDED.verification_status;

-- Initial Food Commodity Catalog (13 Presets)
INSERT INTO public.food_commodities
    (id, name, category, default_moisture_content, default_moisture_sensitivity, default_oil_fat_content, default_ph, default_respiration_rate, default_storage_type, default_shelf_life_days, default_temp_c, default_humidity_percent, default_transportation, default_concern, technical_description)
VALUES
    ('dry-bakery', 'Dry Bakery Biscuits / Crackers', 'Baked Goods', 3.5, 'High', 'Medium', 6.8, 'Not Applicable', 'Ambient', 120, 25.0, 60.0, 'Normal Transportation', 'Moisture Protection', 'Low water activity product prone to textural softening upon moisture sorption.'),
    ('banana-chips', 'Banana Chips (Snacks - Fried & Dehydrated)', 'Snacks', 2.8, 'High', 'High', 6.2, 'Not Applicable', 'Ambient', 90, 25.0, 65.0, 'Normal Transportation', 'Moisture Protection', 'Fried snack requiring moisture barrier to preserve crispness and oxygen barrier to delay lipid oxidation.'),
    ('fresh-fruits', 'Fresh Fruits (e.g. Berries / Apples)', 'Fresh Fruits', 85.0, 'Medium', 'Low', 3.8, 'High', 'Chilled', 14, 4.0, 90.0, 'Refrigerated Transportation', 'Gas Exchange / Respiration', 'Respiring horticultural tissue requiring controlled gas exchange and condensation prevention.'),
    ('fresh-vegetables', 'Fresh Vegetables (Leafy Greens / Salad Vegetables)', 'Fresh Vegetables', 92.0, 'Medium', 'Low', 6.0, 'Very High', 'Chilled', 7, 4.0, 95.0, 'Refrigerated Transportation', 'Gas Exchange / Respiration', 'High respiration and transpiration rates; anaerobic conditions accelerate decay.'),
    ('dairy-products', 'Dairy Products (Fresh Paneer / Curd)', 'Dairy Products', 55.0, 'High', 'Medium', 5.8, 'Not Applicable', 'Chilled', 14, 4.0, 85.0, 'Refrigerated Transportation', 'Oxygen Protection', 'High water activity and neutral pH; prone to microbial spoilage and lipid oxidation.'),
    ('whole-milk-powder', 'Dairy Powder (Whole Milk Powder)', 'Dairy Products', 3.0, 'High', 'High', 6.6, 'Not Applicable', 'Ambient', 180, 25.0, 50.0, 'Normal Transportation', 'Moisture Protection', 'Extremely hygroscopic powder; moisture ingress triggers powder caking and fat rancidity.'),
    ('meat-products', 'Meat Products (Fresh Cut Poultry / Red Meat)', 'Meat Products', 72.0, 'High', 'Medium', 5.6, 'Not Applicable', 'Chilled', 7, 2.0, 85.0, 'Refrigerated Transportation', 'Oxygen Protection', 'Susceptible to bacterial proliferation and myoglobin oxidation; requires high oxygen barrier.'),
    ('fish-seafood', 'Fish and Seafood (Chilled Fillets)', 'Fish and Seafood', 78.0, 'High', 'Medium', 6.5, 'Not Applicable', 'Chilled', 5, 1.0, 90.0, 'Refrigerated Transportation', 'Oxygen Protection', 'Highly perishable protein with rapid enzymatic and autolytic decomposition.'),
    ('cereals-grains', 'Cereals and Grains (Rice / Wheat / Millets)', 'Cereals and Grains', 12.0, 'Medium', 'Low', 6.5, 'Very Low', 'Ambient', 365, 25.0, 60.0, 'Normal Transportation', 'Moisture Protection', 'Moisture migration induces mold growth and insect infestation during extended storage.'),
    ('pulses', 'Pulses (Lentils / Chickpeas)', 'Pulses', 10.5, 'Medium', 'Low', 6.4, 'Very Low', 'Ambient', 365, 25.0, 60.0, 'Normal Transportation', 'Mechanical Strength', 'Requires puncture resistance and moisture barrier to preserve cooking quality.'),
    ('spices', 'Spices (Ground / Whole Spices)', 'Spices', 8.0, 'High', 'Medium', 5.5, 'Not Applicable', 'Ambient', 180, 22.0, 55.0, 'Normal Transportation', 'Light Protection', 'Volatile essential oils and aromatic compounds degrade rapidly under light and oxygen exposure.'),
    ('frozen-food', 'Frozen Food (Frozen Ready-to-Cook / Veg / Meat)', 'Frozen Food', 60.0, 'Medium', 'Medium', 6.2, 'Not Applicable', 'Frozen', 180, -18.0, 85.0, 'Frozen Transportation', 'Temperature Resistance', 'Sub-zero temperatures demand high seal integrity and cold impact crack resistance to avoid freezer burn.'),
    ('other', 'Other / Custom Food Commodity', 'Other', 10.0, 'Medium', 'Medium', 6.0, 'Not Applicable', 'Ambient', 60, 25.0, 60.0, 'Normal Transportation', 'Moisture Protection', 'General food product parameters for technical packaging evaluation.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    default_moisture_content = EXCLUDED.default_moisture_content,
    default_ph = EXCLUDED.default_ph;

-- ========================================================================
-- 7. Initial Recommendation Rules (Direct Heuristics)
-- Array-based matching for transportation and packaging concerns.
-- ========================================================================
INSERT INTO public.recommendation_rules 
    (id, rule_name, commodity_category, storage_type, min_shelf_life_days, max_shelf_life_days, requires_breathability, applicable_transportation, applicable_concerns, suitable_material_id, recommendation_status, primary_reason, technical_note, priority_order)
VALUES
    -- Fresh Fruits (Breathable)
    ('rule-fruits-microperf', 'Fresh Fruits Respiration Ventilation', 'Fresh Fruits', 'Chilled', 1, 30, TRUE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation'], 
     ARRAY['Gas Exchange / Respiration', 'Moisture Protection', 'Extended Shelf Life'], 
     'micro-perf-pp', 'Recommended for Evaluation', 
     'Perforated structure facilitates controlled oxygen and carbon dioxide exchange, preventing anaerobic decay and moisture condensation in respiring fresh fruits.', 
     'Initial rule-based demo coverage — requires technical validation. Perforation density must be engineered to specific fruit respiration rate and target equilibrium atmosphere.', 1),

    ('rule-fruits-hdpe-crate', 'Fresh Fruits Bulk Rigidity', 'Fresh Fruits', 'Chilled', 1, 30, TRUE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Gas Exchange / Respiration', 'Mechanical Strength'], 
     'hdpe-monofilm', 'Potentially Suitable', 
     'Rigid polyolefin structure provides high impact protection for bulk fruit transit when configured with macroscopic ventilation openings.', 
     'Initial rule-based demo coverage — requires technical validation. Ventilation openings must be physically die-cut to prevent produce suffocation.', 2),

    -- Fresh Vegetables (Breathable)
    ('rule-veg-microperf', 'Fresh Vegetables Aerobic Respiration', 'Fresh Vegetables', 'Chilled', 1, 21, TRUE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation'], 
     ARRAY['Gas Exchange / Respiration', 'Moisture Protection'], 
     'micro-perf-pp', 'Recommended for Evaluation', 
     'Micro-perforations maintain aerobic respiration and prevent water fogging and anaerobic rot inside salad and leafy vegetable packaging.', 
     'Initial rule-based demo coverage — requires technical validation. High transpiration rates require anti-fog surfactant coatings alongside perforation.', 1),

    ('rule-veg-hdpe', 'Fresh Vegetables Wholesale Rigidity', 'Fresh Vegetables', 'Chilled', 1, 21, TRUE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Gas Exchange / Respiration', 'Mechanical Strength'], 
     'hdpe-monofilm', 'Potentially Suitable', 
     'Perforated mono-material polyolefin provides structural rigidity and moisture resistance for wholesale vegetable handling.', 
     'Initial rule-based demo coverage — requires technical validation. Vent holes mandatory to prevent anaerobic off-odor development.', 2),

    -- Frozen Food
    ('rule-frozen-hdpe', 'Frozen Ductile Cold Resistance', 'Frozen Food', 'Frozen', 1, 365, FALSE, 
     ARRAY['Frozen Transportation', 'Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Temperature Resistance', 'Moisture Protection', 'Sustainability', 'Cost Efficiency'], 
     'hdpe-monofilm', 'Recommended for Evaluation', 
     'Maintains ductile impact strength and seal integrity without cold embrittlement down to -40°C in mono-material recycling streams.', 
     'Initial rule-based demo coverage — requires technical validation. Verify puncture resistance if frozen product contains sharp contours.', 1),

    ('rule-frozen-evoh', 'Frozen Lipid Oxidation Protection', 'Frozen Food', 'Frozen', 1, 365, FALSE, 
     ARRAY['Frozen Transportation', 'Normal Transportation'], 
     ARRAY['Oxygen Protection', 'Temperature Resistance', 'Extended Shelf Life'], 
     'evoh-multilayer-pe', 'Recommended for Evaluation', 
     'Provides high oxygen barrier under low temperatures, delaying lipid rancidity and freezer burn during extended frozen storage.', 
     'Initial rule-based demo coverage — requires technical validation. Seal layer thickness must ensure hermetic integrity under thermal contraction.', 2),

    ('rule-frozen-opa', 'Frozen Puncture Resistance', 'Frozen Food', 'Frozen', 1, 365, FALSE, 
     ARRAY['Frozen Transportation', 'Long-Distance Transportation', 'High Vibration / Mechanical Stress'], 
     ARRAY['Mechanical Strength', 'Temperature Resistance'], 
     'opa-cpp-laminate', 'Potentially Suitable', 
     'Delivers exceptional puncture and pinhole resistance against abrasive frozen contours during transit and rough handling.', 
     'Initial rule-based demo coverage — requires technical validation. Verify low-temperature seal initiation temperature on packaging lines.', 3),

    -- Snacks (Ambient Moisture Sensitive)
    ('rule-snack-met-bopp', 'Dry Snack Ambient Moisture Barrier', 'Snacks', 'Ambient', 1, 180, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Moisture Protection', 'Light Protection', 'Cost Efficiency', 'Extended Shelf Life'], 
     'bopp-met-cpp', 'Recommended for Evaluation', 
     'Balanced moisture vapor and visible light barrier preserves crispness and delays oxidative rancidity in fried and dehydrated snack foods.', 
     'Initial rule-based demo coverage — requires technical validation. Verify seal hermeticity along lap and fin seals.', 1),

    ('rule-snack-pet-alox', 'Dry Snack Transparent Barrier', 'Snacks', 'Ambient', 1, 180, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Moisture Protection', 'Oxygen Protection', 'Extended Shelf Life'], 
     'pet-alox-pe', 'Potentially Suitable', 
     'High-barrier transparent laminate permitting consumer product visibility while offering robust moisture and gas protection.', 
     'Initial rule-based demo coverage — requires technical validation. AlOx coating requires care during converting to avoid micro-cracks.', 2),

    -- Baked Goods
    ('rule-bakery-bopp', 'Dry Bakery Ambient Moisture Barrier', 'Baked Goods', 'Ambient', 1, 180, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Moisture Protection', 'Light Protection', 'Extended Shelf Life'], 
     'bopp-met-cpp', 'Recommended for Evaluation', 
     'Protects low-moisture biscuits and crackers against ambient humidity ingress that causes textural softening.', 
     'Initial rule-based demo coverage — requires technical validation.', 1),

    ('rule-bakery-kraft-pbs', 'Renewable Short Shelf-life Ambient Bakery', 'Baked Goods', 'Ambient', 1, 60, FALSE, 
     ARRAY['Normal Transportation'], 
     ARRAY['Sustainability', 'Cost Efficiency', 'Moisture Protection'], 
     'kraft-bio-pbs', 'Requires Technical Validation', 
     'Bio-based dispersion coated paperboard suitable for short shelf-life dry bakery goods where renewable packaging is prioritized.', 
     'Initial rule-based demo coverage — requires technical validation. Moisture barrier diminishes in high ambient relative humidity (>75% RH).', 2),

    -- Dairy Products
    ('rule-dairy-chilled-evoh', 'Chilled Dairy Oxygen Shield', 'Dairy Products', 'Chilled', 1, 30, FALSE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation'], 
     ARRAY['Oxygen Protection', 'Extended Shelf Life', 'Moisture Protection'], 
     'evoh-multilayer-pe', 'Recommended for Evaluation', 
     'High oxygen barrier delays oxidative spoilage and aerobic fungal growth in chilled dairy products like paneer and curd.', 
     'Initial rule-based demo coverage — requires technical validation. Ensure outer polyolefin protects EVOH core from high humidity plastification.', 1),

    ('rule-dairy-powder-alu', 'Hygroscopic Powder Hermetic Barrier', 'Dairy Products', 'Ambient', 60, 730, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Moisture Protection', 'Oxygen Protection', 'Light Protection', 'Extended Shelf Life'], 
     'pet-alu-pe', 'Recommended for Evaluation', 
     'Hermetic aluminum foil laminate providing near-zero moisture and gas transmission for extended storage of hygroscopic milk powders.', 
     'Initial rule-based demo coverage — requires technical validation. Seal layer thickness must prevent microscopic pinholes during pouch formation.', 1),

    -- Meat Products
    ('rule-meat-chilled-evoh', 'Chilled Meat Oxygen Shield', 'Meat Products', 'Chilled', 1, 30, FALSE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation'], 
     ARRAY['Oxygen Protection', 'Extended Shelf Life'], 
     'evoh-multilayer-pe', 'Recommended for Evaluation', 
     'Low oxygen permeability prevents rapid microbial growth and metmyoglobin brown discoloration in chilled meat.', 
     'Initial rule-based demo coverage — requires technical validation. Compatible with modified atmosphere packaging (MAP) gas mixtures.', 1),

    ('rule-meat-pet-alox', 'Chilled Meat Transparent Barrier', 'Meat Products', 'Chilled', 1, 30, FALSE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation'], 
     ARRAY['Oxygen Protection', 'Moisture Protection'], 
     'pet-alox-pe', 'Potentially Suitable', 
     'Transparent high-gas-barrier top web enabling clear product visibility for retail chilled meats while preventing drying.', 
     'Initial rule-based demo coverage — requires technical validation.', 2),

    -- Fish and Seafood
    ('rule-fish-chilled-evoh', 'Chilled Seafood Oxygen Barrier', 'Fish and Seafood', 'Chilled', 1, 14, FALSE, 
     ARRAY['Refrigerated Transportation', 'Normal Transportation'], 
     ARRAY['Oxygen Protection', 'Extended Shelf Life'], 
     'evoh-multilayer-pe', 'Recommended for Evaluation', 
     'Gas-tight barrier preserves freshness and restricts oxygen contact to slow lipid oxidation in fatty and lean fish.', 
     'Initial rule-based demo coverage — requires technical validation. Strict cold chain maintenance (<3°C) required to prevent anaerobic bacterial development.', 1),

    -- Cereals and Grains
    ('rule-grains-hdpe', 'Grain Moisture and Infestation Barrier', 'Cereals and Grains', 'Ambient', 30, 730, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Moisture Protection', 'Cost Efficiency', 'Sustainability'], 
     'hdpe-monofilm', 'Recommended for Evaluation', 
     'Water vapor barrier protects bulk grains from ambient humidity migration that induces mold growth and infestation.', 
     'Initial rule-based demo coverage — requires technical validation. Fully compatible with mono-material PE recycling streams.', 1),

    -- Pulses
    ('rule-pulses-opa', 'Pulses Puncture-Resistant Laminate', 'Pulses', 'Ambient', 30, 730, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation', 'High Vibration / Mechanical Stress'], 
     ARRAY['Mechanical Strength', 'Moisture Protection'], 
     'opa-cpp-laminate', 'Recommended for Evaluation', 
     'Biaxially oriented polyamide outer layer prevents punctures from sharp, dry pulse edges during packing and stacking.', 
     'Initial rule-based demo coverage — requires technical validation.', 1),

    ('rule-pulses-hdpe', 'Pulses Economy Moisture Barrier', 'Pulses', 'Ambient', 30, 730, FALSE, 
     ARRAY['Normal Transportation'], 
     ARRAY['Cost Efficiency', 'Moisture Protection', 'Sustainability'], 
     'hdpe-monofilm', 'Potentially Suitable', 
     'Economical mono-material barrier film providing moisture protection for standard retail pulse packaging.', 
     'Initial rule-based demo coverage — requires technical validation.', 2),

    -- Spices
    ('rule-spices-alu', 'Spices Total Aroma and Light Shield', 'Spices', 'Ambient', 30, 730, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Light Protection', 'Oxygen Protection', 'Moisture Protection', 'Extended Shelf Life'], 
     'pet-alu-pe', 'Recommended for Evaluation', 
     'Foil barrier prevents photo-oxidation and escape of aromatic essential oils and color pigments in whole and ground spices.', 
     'Initial rule-based demo coverage — requires technical validation.', 1),

    ('rule-spices-met-bopp', 'Spices Economy Light and Moisture Barrier', 'Spices', 'Ambient', 30, 365, FALSE, 
     ARRAY['Normal Transportation'], 
     ARRAY['Light Protection', 'Moisture Protection', 'Cost Efficiency'], 
     'bopp-met-cpp', 'Potentially Suitable', 
     'Cost-effective metallized laminate offering good light and moisture shielding for retail spice pouches.', 
     'Initial rule-based demo coverage — requires technical validation.', 2),

    -- Heavy Transit Focus Rule (STRICTLY SCOPED to Mechanical Stress & Long-Distance)
    ('rule-transit-opa', 'Heavy-Duty Transit Puncture Shield', NULL, 'Ambient', 1, 730, FALSE, 
     ARRAY['High Vibration / Mechanical Stress', 'Long-Distance Transportation'], 
     ARRAY['Mechanical Strength'], 
     'opa-cpp-laminate', 'Recommended for Evaluation', 
     'High flex-crack resistance and burst strength engineered for severe transit vibration and prolonged distribution stress.', 
     'Initial rule-based demo coverage — requires technical validation. Restricted strictly to rugged transit conditions and non-respiring commodities.', 1),

    -- Other / General Custom Food Commodity
    ('rule-other-ambient-hdpe', 'General Commodity Moisture Barrier', 'Other', 'Ambient', 1, 180, FALSE, 
     ARRAY['Normal Transportation', 'Long-Distance Transportation'], 
     ARRAY['Moisture Protection', 'Cost Efficiency'], 
     'hdpe-monofilm', 'Potentially Suitable', 
     'Standard polyolefin packaging providing foundational moisture resistance for general shelf-stable commodities.', 
     'Initial rule-based demo coverage — requires technical validation.', 2)

ON CONFLICT (id) DO UPDATE SET
    rule_name = EXCLUDED.rule_name,
    commodity_category = EXCLUDED.commodity_category,
    storage_type = EXCLUDED.storage_type,
    min_shelf_life_days = EXCLUDED.min_shelf_life_days,
    max_shelf_life_days = EXCLUDED.max_shelf_life_days,
    requires_breathability = EXCLUDED.requires_breathability,
    applicable_transportation = EXCLUDED.applicable_transportation,
    applicable_concerns = EXCLUDED.applicable_concerns,
    suitable_material_id = EXCLUDED.suitable_material_id,
    recommendation_status = EXCLUDED.recommendation_status,
    primary_reason = EXCLUDED.primary_reason,
    technical_note = EXCLUDED.technical_note,
    priority_order = EXCLUDED.priority_order;
