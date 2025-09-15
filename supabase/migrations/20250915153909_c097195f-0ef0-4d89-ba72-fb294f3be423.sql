-- Fix RLS policies for user profile creation
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Allow users to create their own profile during signup
CREATE POLICY "Allow profile creation during signup" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = auth_user_id);

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.users 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Create phone verification table for OTP
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on phone_verifications
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Policy for phone verification
CREATE POLICY "Users can manage their phone verification" 
ON public.phone_verifications 
FOR ALL 
USING (true);

-- Add indexes for better performance
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone_number);
CREATE INDEX idx_phone_verifications_expires ON public.phone_verifications(expires_at);