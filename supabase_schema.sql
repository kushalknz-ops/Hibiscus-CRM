-- =========================================================================
-- HIBISCUS CRM - SUPABASE DATABASE SCHEMA FOR CALL LOGS PERSISTENCE
-- =========================================================================

-- 1. Create call_logs Table
CREATE TABLE IF NOT EXISTS public.call_logs (
    id TEXT PRIMARY KEY,
    time_of_call TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_time TEXT,
    caller_full_name TEXT NOT NULL DEFAULT 'Inbound Caller',
    contact_phone_number TEXT DEFAULT 'N/A',
    contact_email TEXT DEFAULT 'Not provided',
    vehicle_registration TEXT DEFAULT 'N/A',
    vehicle_make_model_year TEXT DEFAULT 'Not provided',
    service_requested TEXT DEFAULT 'General Inquiry',
    preferred_date_time TEXT DEFAULT 'N/A',
    urgency_level TEXT DEFAULT 'Normal',
    insurance_company TEXT DEFAULT 'Not provided',
    insurance_claim_number TEXT DEFAULT 'Not provided',
    pickup_address TEXT DEFAULT 'Not provided',
    call_duration TEXT DEFAULT '01:30',
    call_status TEXT DEFAULT 'completed',
    sentiment_score TEXT DEFAULT 'Positive',
    sentiment_summary TEXT,
    recording_url TEXT,
    internal_recording_url TEXT,
    interactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) & Policies for Anonymous / Authenticated Access
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- Grant Table Privileges to anon, authenticated, and service_role
GRANT ALL ON TABLE public.call_logs TO anon, authenticated, service_role;

-- Drop policies if they already exist to prevent 42710 errors
DROP POLICY IF EXISTS "Allow public read access to call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Allow public insert access to call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Allow public update access to call_logs" ON public.call_logs;

-- Allow public read access (for CRM frontend)
CREATE POLICY "Allow public read access to call_logs"
    ON public.call_logs
    FOR SELECT
    USING (true);

-- Allow public insert access (for server webhooks & seeding)
CREATE POLICY "Allow public insert access to call_logs"
    ON public.call_logs
    FOR INSERT
    WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update access to call_logs"
    ON public.call_logs
    FOR UPDATE
    USING (true);

-- 3. Enable Supabase Realtime Broadcasting on call_logs Table
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;
EXCEPTION
    WHEN OTHERS THEN
        -- Table is already part of publication or realtime is enabled
        NULL;
END $$;
