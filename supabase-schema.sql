-- ==============================================================================
-- DOMINION CITY ASABA — INFORMATION DESK MANAGEMENT SYSTEM
-- COMPLETE POSTGRESQL & SUPABASE DATABASE MIGRATION SCRIPT
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES & ROLES
CREATE TYPE user_role AS ENUM (
  'system_admin',
  'department_leader',
  'secretary',
  'finance_officer',
  'bookstand_officer',
  'general_member',
  'leadership_forum',
  'public_visitor'
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'general_member',
  department_role TEXT NOT NULL DEFAULT 'Department Member',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENT MEMBERS DIRECTORY & BIRTHDAYS
CREATE TABLE IF NOT EXISTS department_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  photo_url TEXT,
  birth_day INT NOT NULL CHECK (birth_day BETWEEN 1 AND 31),
  birth_month INT NOT NULL CHECK (birth_month BETWEEN 1 AND 12),
  birth_year INT,
  department_role TEXT NOT NULL,
  occupation TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  residential_area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  service_unit TEXT DEFAULT 'Information Desk',
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_birthday ON department_members(birth_month, birth_day);
CREATE INDEX idx_members_status ON department_members(status);

-- 3. LOST AND FOUND REGISTER
CREATE TYPE lost_item_status AS ENUM ('Unclaimed', 'Claimed', 'Returned');

CREATE TABLE IF NOT EXISTS lost_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  photo_url TEXT,
  date_found DATE NOT NULL DEFAULT CURRENT_DATE,
  time_found TEXT,
  location_found TEXT NOT NULL,
  date_received DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by TEXT NOT NULL,
  status lost_item_status NOT NULL DEFAULT 'Unclaimed',
  recovery_date DATE,
  collected_by TEXT,
  collector_phone TEXT,
  officer_witness TEXT,
  notes TEXT,
  is_publicly_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lost_item_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NEWS, EVENTS & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_photo TEXT,
  event_date DATE,
  event_time TEXT,
  venue TEXT,
  organizer TEXT,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Published',
  is_urgent BOOLEAN DEFAULT FALSE,
  meeting_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CELL MEETINGS DIRECTORY (ASABA)
CREATE TABLE IF NOT EXISTS cell_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cell_name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_phone TEXT NOT NULL,
  leader_photo TEXT,
  neighborhood TEXT NOT NULL,
  location_address TEXT NOT NULL,
  meeting_day TEXT NOT NULL DEFAULT 'Wednesday',
  meeting_time TEXT NOT NULL DEFAULT '06:00 PM',
  format TEXT NOT NULL DEFAULT 'Physical',
  directions TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SATELLITE CHURCHES DIRECTORY
CREATE TABLE IF NOT EXISTS satellite_churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  resident_pastor TEXT NOT NULL,
  pastor_phone TEXT NOT NULL,
  pastor_photo TEXT,
  venue TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  sunday_service_times TEXT NOT NULL,
  midweek_service_times TEXT NOT NULL,
  directions TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUNDAY DRESS CODES
CREATE TABLE IF NOT EXISTS sunday_dress_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sunday_date DATE NOT NULL UNIQUE,
  theme_title TEXT NOT NULL,
  primary_colors TEXT[] NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SERVICE ROSTERS & DUTIES
CREATE TABLE IF NOT EXISTS service_rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  team_leader TEXT NOT NULL,
  prayer_leader TEXT NOT NULL,
  assignments JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  dress_code_id UUID REFERENCES sunday_dress_codes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MEETINGS & PRAYER WATCH
CREATE TABLE IF NOT EXISTS department_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  agenda TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SERVICE REPORTS
CREATE TABLE IF NOT EXISTS service_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  desk_attendance_count INT DEFAULT 0,
  inquiries_handled INT DEFAULT 0,
  cell_connections_count INT DEFAULT 0,
  lost_items_logged INT DEFAULT 0,
  activities_carried_out TEXT NOT NULL,
  observations TEXT,
  issues_encountered TEXT,
  follow_up_actions TEXT,
  submitted_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FLEXIBLE INFORMATION COLLECTIONS (CUSTOM FORM BUILDER)
CREATE TABLE IF NOT EXISTS information_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  requested_by TEXT NOT NULL,
  purpose TEXT,
  deadline DATE,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES information_collections(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FINANCIAL MANAGEMENT & BUDGETS
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Bank Transfer',
  receipt_number TEXT,
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS department_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  estimated_cost NUMERIC(12, 2) NOT NULL CHECK (estimated_cost > 0),
  amount_raised NUMERIC(12, 2) NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'Medium',
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'In Progress',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BOOKSTAND INVENTORY, SALES & DEBTS
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Dr. David Ogbueli',
  category TEXT NOT NULL,
  cover_photo TEXT,
  cost_price NUMERIC(10, 2) DEFAULT 0,
  selling_price NUMERIC(10, 2) NOT NULL,
  opening_stock INT NOT NULL DEFAULT 0,
  stock_received INT NOT NULL DEFAULT 0,
  quantity_sold INT NOT NULL DEFAULT 0,
  returns INT NOT NULL DEFAULT 0,
  damaged_or_missing INT NOT NULL DEFAULT 0,
  reorder_threshold INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity INT NOT NULL,
  reason TEXT,
  recorded_by TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  outstanding_debt NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'Paid',
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  recorded_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES book_sales(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10, 2) NOT NULL,
  recorded_by TEXT NOT NULL,
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;

-- Public can read approved cell meetings and published announcements
ALTER TABLE cell_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cell meetings" ON cell_meetings FOR SELECT USING (status = 'Active');

ALTER TABLE satellite_churches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read satellites" ON satellite_churches FOR SELECT USING (status = 'Active');

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (status = 'Published');

ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved lost items" ON lost_items FOR SELECT USING (is_publicly_visible = TRUE AND status = 'Unclaimed');
