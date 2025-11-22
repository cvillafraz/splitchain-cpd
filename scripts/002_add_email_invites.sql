-- Create email invitations table
CREATE TABLE IF NOT EXISTS public.email_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_wallet TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(inviter_wallet, invitee_email)
);

-- Add email to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS
ALTER TABLE public.email_invites ENABLE ROW LEVEL SECURITY;

-- Email invites policies
CREATE POLICY "email_invites_select_all"
  ON public.email_invites FOR SELECT
  USING (true);

CREATE POLICY "email_invites_insert_own"
  ON public.email_invites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "email_invites_update_own"
  ON public.email_invites FOR UPDATE
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_invites_email ON public.email_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_email_invites_inviter ON public.email_invites(inviter_wallet);
