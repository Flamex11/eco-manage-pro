-- Step 1: Create user_roles table with proper structure
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Step 2: Migrate existing role data from users table to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT auth_user_id, role 
FROM public.users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Enable Row Level Security on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: Update get_current_user_role() to query user_roles table instead
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Step 6: Add RLS policies on user_roles table
CREATE POLICY "Only admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Step 7: Drop the old storage policy that depends on users.role column
DROP POLICY IF EXISTS "Admins can view all pickup request files" ON storage.objects;

-- Step 8: Create new storage policy using the has_role() function
CREATE POLICY "Admins can view all pickup request files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pickup-requests' AND 
  public.has_role(auth.uid(), 'admin'::user_role)
);

-- Step 9: Now we can safely drop the role column from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS role;