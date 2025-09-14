-- Create ENUM types
CREATE TYPE public.user_role AS ENUM ('admin', 'collector', 'resident');
CREATE TYPE public.waste_type AS ENUM ('wet', 'dry', 'hazardous');
CREATE TYPE public.collection_status AS ENUM ('collected', 'pending');
CREATE TYPE public.complaint_status AS ENUM ('open', 'in_progress', 'resolved');

-- Create wards table
CREATE TABLE public.wards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  zone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE,
  google_id TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'resident',
  name TEXT NOT NULL,
  ward_id UUID REFERENCES wards(id),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waste_collections table
CREATE TABLE public.waste_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collector_id UUID REFERENCES users(id) NOT NULL,
  ward_id UUID REFERENCES wards(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  waste_type waste_type NOT NULL,
  status collection_status NOT NULL DEFAULT 'pending',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES users(id) NOT NULL,
  ward_id UUID REFERENCES wards(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  status complaint_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ward_id UUID REFERENCES wards(id) NOT NULL,
  total_collections INTEGER NOT NULL DEFAULT 0,
  segregated_percentage FLOAT NOT NULL DEFAULT 0,
  complaints_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, ward_id)
);

-- Create chatbot_logs table
CREATE TABLE public.chatbot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- Create function to get current user ward
CREATE OR REPLACE FUNCTION public.get_current_user_ward()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ward_id FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- RLS Policies for wards table
CREATE POLICY "Everyone can view wards" ON public.wards
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage wards" ON public.wards
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for waste_collections table
CREATE POLICY "Collectors can view their collections" ON public.waste_collections
  FOR SELECT USING (
    public.get_current_user_role() = 'collector' AND 
    collector_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Collectors can update their collections" ON public.waste_collections
  FOR UPDATE USING (
    public.get_current_user_role() = 'collector' AND 
    collector_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all collections" ON public.waste_collections
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for complaints table
CREATE POLICY "Residents can view their complaints" ON public.complaints
  FOR SELECT USING (
    public.get_current_user_role() = 'resident' AND 
    resident_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Residents can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (
    public.get_current_user_role() = 'resident' AND 
    resident_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all complaints" ON public.complaints
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for analytics table
CREATE POLICY "Admins can manage analytics" ON public.analytics
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for notifications table
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for chatbot_logs table
CREATE POLICY "Users can view their chatbot logs" ON public.chatbot_logs
  FOR ALL USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for audit_logs table
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_ward_id ON public.users(ward_id);
CREATE INDEX idx_waste_collections_collector_id ON public.waste_collections(collector_id);
CREATE INDEX idx_waste_collections_ward_id ON public.waste_collections(ward_id);
CREATE INDEX idx_waste_collections_date ON public.waste_collections(date);
CREATE INDEX idx_complaints_resident_id ON public.complaints(resident_id);
CREATE INDEX idx_complaints_ward_id ON public.complaints(ward_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waste_collections_updated_at
  BEFORE UPDATE ON public.waste_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('complaint-photos', 'complaint-photos', true),
  ('profile-images', 'profile-images', true);

-- Storage policies for complaint photos
CREATE POLICY "Users can upload complaint photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'complaint-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view complaint photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'complaint-photos');

-- Storage policies for profile images
CREATE POLICY "Users can upload their profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their profile images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Insert sample wards
INSERT INTO public.wards (name, zone) VALUES
  ('Ward 1', 'North Zone'),
  ('Ward 2', 'North Zone'),
  ('Ward 3', 'South Zone'),
  ('Ward 4', 'South Zone'),
  ('Ward 5', 'East Zone'),
  ('Ward 6', 'West Zone');