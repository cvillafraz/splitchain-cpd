-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  chain TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('owed', 'owing', 'settled')),
  paid_by TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  shares JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies: anyone can view/insert for now (since we use wallet addresses)
-- In a production app, you'd want to restrict this to involved participants
CREATE POLICY "transactions_select_all"
  ON public.transactions FOR SELECT
  USING (true);

CREATE POLICY "transactions_insert_all"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_paid_by ON public.transactions(paid_by);
