-- ============================================
-- CREATE EXPENSES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Expense details
  expense_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fuel', 'equipment', 'maintenance', 'insurance', 'salaries', 'marketing', 'rent', 'utilities', 'office_supplies', 'transport', 'food', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  
  -- Vendor info
  vendor TEXT,
  vendor_email TEXT,
  vendor_phone TEXT,
  
  -- Payment info
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'online_payment')),
  payment_reference TEXT,
  
  -- Receipt
  receipt_url TEXT,
  
  -- Tax
  tax_deductible BOOLEAN DEFAULT true,
  vat_amount DECIMAL(10, 2),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- Enable Row Level Security (simplified - admin only)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all for admin" ON public.expenses;

-- Simple admin-only policy
CREATE POLICY "Enable all for admin"
  ON public.expenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mrtandempilot@gmail.com'
    )
  );

-- Add some sample expense data
INSERT INTO public.expenses (
  expense_date,
  category,
  description,
  amount,
  vendor,
  payment_method
) VALUES 
  (
    CURRENT_DATE - INTERVAL '5 days',
    'fuel',
    'Gasoline for company vehicle',
    150.00,
    'Shell Gas Station',
    'credit_card'
  ),
  (
    CURRENT_DATE - INTERVAL '10 days',
    'equipment',
    'New paragliding harness',
    850.00,
    'Sky Equipment Ltd',
    'bank_transfer'
  ),
  (
    CURRENT_DATE - INTERVAL '2 days',
    'maintenance',
    'Parachute inspection and repair',
    320.00,
    'Flight Safety Services',
    'credit_card'
  );

-- ============================================
-- COMPLETE!
-- ============================================
-- You can now:
-- 1. View expenses at /dashboard/accounting/expenses
-- 2. Track spending by category
-- 3. Add expense entry form (coming soon)
-- ============================================
