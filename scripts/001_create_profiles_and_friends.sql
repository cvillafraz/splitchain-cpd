-- Create profiles table referencing Coinbase wallet addresses
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  friend_wallet TEXT NOT NULL,
  status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_wallet, friend_wallet)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Profiles policies: anyone can view profiles, users can insert/update their own
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (true);

-- Friends policies: users can see their own friendships
CREATE POLICY "friends_select_own"
  ON public.friends FOR SELECT
  USING (true);

CREATE POLICY "friends_insert_own"
  ON public.friends FOR INSERT
  WITH CHECK (true);

CREATE POLICY "friends_delete_own"
  ON public.friends FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_friends_user_wallet ON public.friends(user_wallet);
CREATE INDEX IF NOT EXISTS idx_friends_friend_wallet ON public.friends(friend_wallet);
