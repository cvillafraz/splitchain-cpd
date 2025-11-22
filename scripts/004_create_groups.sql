-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, wallet_address)
);

-- Add group_id to transactions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'group_id') THEN
        ALTER TABLE public.transactions ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "groups_select_member"
  ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.groups.id
      AND wallet_address = current_setting('request.jwt.claim.sub', true) -- Or match via other means if not using auth
    )
    OR true -- For prototype with wallet addresses, allowing open read for now or we rely on client-side filtering/service role
  );

CREATE POLICY "groups_insert_all"
  ON public.groups FOR INSERT
  WITH CHECK (true);

-- Group members policies
CREATE POLICY "group_members_select_all"
  ON public.group_members FOR SELECT
  USING (true);

CREATE POLICY "group_members_insert_all"
  ON public.group_members FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_group_members_wallet ON public.group_members(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON public.transactions(group_id);
