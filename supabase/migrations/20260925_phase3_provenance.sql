-- ========================================================================
-- SmartPack — Phase 3 Verified Source Links and Data Provenance Migration
-- Target: PostgreSQL / Supabase
-- Description: Adds verified data provenance, source URLs, and verification 
--              tracking columns to packaging_materials without deleting or 
--              overwriting existing catalog and barrier properties.
-- ========================================================================

-- 1. Add provenance columns to packaging_materials table
ALTER TABLE public.packaging_materials
    ADD COLUMN IF NOT EXISTS source_title TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS source_page TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_available'
        CHECK (verification_status IS NULL OR verification_status IN ('verified', 'unverified', 'not_available')),
    ADD COLUMN IF NOT EXISTS last_verified_at DATE DEFAULT NULL;

-- Also add nullable provenance reference columns to material_barrier_properties for data lineage completeness
ALTER TABLE public.material_barrier_properties
    ADD COLUMN IF NOT EXISTS source_title TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS source_page TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS last_verified_at DATE DEFAULT NULL;

-- 2. Populate verified manufacturer source records for verified materials
-- (A) bopp-met-cpp: Celplast Metallized Products — Polypropylene (BOPP) Barrier Films
UPDATE public.packaging_materials
SET 
    source_title = 'Celplast Metallized Products — Polypropylene (BOPP) Barrier Films',
    source_url = 'https://www.celplast.com/material/polypropylene/',
    source_page = 'Product Catalog / Overview',
    verification_status = 'verified',
    last_verified_at = '2026-09-25'
WHERE id = 'bopp-met-cpp';

UPDATE public.material_barrier_properties
SET
    source_title = 'Celplast Metallized Products — Polypropylene (BOPP) Barrier Films',
    source_url = 'https://www.celplast.com/material/polypropylene/',
    source_page = 'Product Catalog / Overview',
    last_verified_at = '2026-09-25'
WHERE material_id = 'bopp-met-cpp';

-- (B) pet-alox-pe: Jindal Films — Alox-Lyte™ Transparent High-Barrier Films
UPDATE public.packaging_materials
SET 
    source_title = 'Jindal Films — Alox-Lyte™ Transparent High-Barrier Films',
    source_url = 'https://www.jindalfilms.com/alox-lyte-transparent/',
    source_page = 'Product Family Overview',
    verification_status = 'verified',
    last_verified_at = '2026-09-25'
WHERE id = 'pet-alox-pe';

UPDATE public.material_barrier_properties
SET
    source_title = 'Jindal Films — Alox-Lyte™ Transparent High-Barrier Films',
    source_url = 'https://www.jindalfilms.com/alox-lyte-transparent/',
    source_page = 'Product Family Overview',
    last_verified_at = '2026-09-25'
WHERE material_id = 'pet-alox-pe';

-- (C) evoh-multilayer-pe: Kuraray — EVAL™ EVOH High Gas Barrier Resins
UPDATE public.packaging_materials
SET 
    source_title = 'Kuraray — EVAL™ EVOH High Gas Barrier Resins',
    source_url = 'https://eval.kuraray.com/',
    source_page = 'Technical Overview',
    verification_status = 'verified',
    last_verified_at = '2026-09-25'
WHERE id = 'evoh-multilayer-pe';

UPDATE public.material_barrier_properties
SET
    source_title = 'Kuraray — EVAL™ EVOH High Gas Barrier Resins',
    source_url = 'https://eval.kuraray.com/',
    source_page = 'Technical Overview',
    last_verified_at = '2026-09-25'
WHERE material_id = 'evoh-multilayer-pe';

-- 3. Explicitly set 'not_available' verification status for generic materials without verified manufacturer URLs
UPDATE public.packaging_materials
SET 
    source_title = NULL,
    source_url = NULL,
    source_page = NULL,
    verification_status = 'not_available',
    last_verified_at = NULL
WHERE id IN ('micro-perf-pp', 'hdpe-monofilm', 'opa-cpp-laminate', 'kraft-bio-pbs', 'pet-alu-pe');
