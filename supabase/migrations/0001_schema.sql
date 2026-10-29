-- CleanPro schema. Paste into Supabase > SQL Editor and run once.
-- The four tables (services, cleaners, jobs, payments) match the P01 spec exactly.
-- Added: profiles (holds each user's role), Row Level Security, and a signup trigger.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. PROFILES: one row per login. Role lives here, not in a cookie.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'cleaner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price_ngn DECIMAL(10, 2) NOT NULL,
    bedroom_rate_ngn DECIMAL(10, 2) DEFAULT 2500.00,
    bathroom_rate_ngn DECIMAL(10, 2) DEFAULT 1500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLEANERS
CREATE TABLE cleaners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    assigned_area VARCHAR(100) DEFAULT 'Benin City',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. JOBS / BOOKINGS
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cleaner_id UUID REFERENCES cleaners(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    property_type VARCHAR(50) DEFAULT 'Residential',
    calculated_price_ngn DECIMAL(10, 2) NOT NULL,
    address_text TEXT NOT NULL,
    landmark VARCHAR(150),
    scheduled_date DATE NOT NULL,
    scheduled_time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Assigned', 'In Progress', 'Completed', 'Cancelled')),
    job_done_photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    paystack_reference VARCHAR(100) UNIQUE NOT NULL,
    amount_ngn DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Success', 'Failed')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX jobs_customer_idx ON jobs(customer_id);
CREATE INDEX jobs_cleaner_date_idx ON jobs(cleaner_id, scheduled_date);

-- SIGNUP TRIGGER: every new login becomes a CUSTOMER. Nobody can sign up as admin or cleaner.
-- Promote staff yourself in SQL (see the end of this file).
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'customer');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Role lookup that bypasses RLS (avoids policies referring to themselves)
CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- ROW LEVEL SECURITY (rules enforced by the database, not just the UI)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile"       ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "admin all profiles" ON profiles FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "anyone reads services" ON services FOR SELECT USING (true);
CREATE POLICY "admin manages services" ON services FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "cleaner reads self" ON cleaners FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin manages cleaners" ON cleaners FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "customer reads own jobs" ON jobs FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "cleaner reads assigned jobs" ON jobs FOR SELECT
  USING (cleaner_id IN (SELECT id FROM cleaners WHERE user_id = auth.uid()));
CREATE POLICY "admin manages jobs" ON jobs FOR ALL USING (current_user_role() = 'admin');

CREATE POLICY "customer reads own payments" ON payments FOR SELECT
  USING (job_id IN (SELECT id FROM jobs WHERE customer_id = auth.uid()));
CREATE POLICY "admin reads payments" ON payments FOR SELECT USING (current_user_role() = 'admin');

-- Deliberately NO insert/update policies for customers or cleaners on jobs and payments.
-- Jobs are created by a server route that calculates the price itself (so nobody can
-- book a 5-bedroom clean for N1). Payments are written only by the Paystack webhook.
-- Cleaner status/photo updates also go through a server route. Both use the service key.

-- SEED DATA (real Benin City prices)
INSERT INTO services (name, description, base_price_ngn) VALUES
('Standard Deep Clean', 'Thorough home cleaning covering all accessible rooms, dusting, and mopping.', 10000.00),
('Move-In / Move-Out Clean', 'Heavy-duty deep cleaning for vacant apartments or new properties.', 18000.00),
('Office & Commercial Clean', 'Professional sanitization and cleaning for office spaces and desks.', 25000.00);

-- AFTER you create your test users in Supabase > Authentication, promote them:
--   UPDATE profiles SET role = 'admin'   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@cleanpro.ng');
--   UPDATE profiles SET role = 'cleaner' WHERE id = (SELECT id FROM auth.users WHERE email = 'cleaner@cleanpro.ng');
--   INSERT INTO cleaners (user_id, full_name, phone_number, assigned_area)
--   SELECT id, 'Osaze Igbinedion', '08030000001', 'Ugbowo' FROM auth.users WHERE email = 'cleaner@cleanpro.ng';
