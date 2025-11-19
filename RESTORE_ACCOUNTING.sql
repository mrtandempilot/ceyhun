-- ============================================
-- RESTORE ACCOUNTING & FINANCE TABLES
-- Copy and paste this entire file into Supabase SQL Editor and click RUN
-- ============================================

-- 1. CREATE INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT,
  
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 20.00,
  tax_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  
  notes TEXT,
  payment_terms TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. CREATE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id),
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID REFERENCES public.customers(id),
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other')),
  
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. CREATE EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN (
    'fuel', 'equipment', 'maintenance', 'insurance', 'salaries', 
    'marketing', 'rent', 'utilities', 'supplies', 'licenses', 
    'training', 'food_beverage', 'transportation', 'other'
  )),
  
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  vendor TEXT,
  receipt_number TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'other')),
  
  is_recurring BOOLEAN DEFAULT FALSE,
  is_tax_deductible BOOLEAN DEFAULT TRUE,
  
  notes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 4. CREATE TAX RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.tax_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_revenue DECIMAL(12,2) NOT NULL,
  total_expenses DECIMAL(12,2) NOT NULL,
  taxable_income DECIMAL(12,2) NOT NULL,
  
  vat_collected DECIMAL(12,2) DEFAULT 0,
  vat_paid DECIMAL(12,2) DEFAULT 0,
  vat_payable DECIMAL(12,2) DEFAULT 0,
  
  income_tax DECIMAL(12,2) DEFAULT 0,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'filed', 'paid')),
  filed_date DATE,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_booking ON public.invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(issue_date);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP OLD POLICIES (if they exist)
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated users full access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated users full access to payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated users full access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow authenticated users full access to tax_records" ON public.tax_records;

DROP POLICY IF EXISTS "Allow service role full access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow service role full access to payments" ON public.payments;
DROP POLICY IF EXISTS "Allow service role full access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow service role full access to tax_records" ON public.tax_records;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users full access to invoices"
ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to payments"
ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to expenses"
ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to tax_records"
ON public.tax_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to invoices"
ON public.invoices FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to payments"
ON public.payments FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to expenses"
ON public.expenses FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to tax_records"
ON public.tax_records FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.expenses TO authenticated;
GRANT ALL ON public.tax_records TO authenticated;

GRANT ALL ON public.invoices TO service_role;
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.expenses TO service_role;
GRANT ALL ON public.tax_records TO service_role;

-- ============================================
-- CREATE UPDATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_records_updated_at ON public.tax_records;
CREATE TRIGGER update_tax_records_updated_at
    BEFORE UPDATE ON public.tax_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! 
-- ============================================
-- Your accounting tables are now restored:
-- ✅ invoices
-- ✅ payments  
-- ✅ expenses
-- ✅ tax_records
-- 
-- All permissions, indexes, and triggers are set up.
-- Your Accounting & Finance dashboard should work now!
-- ============================================
