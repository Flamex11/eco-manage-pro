-- Insert default wards if they don't exist
INSERT INTO public.wards (name, zone) 
VALUES 
  ('North Ward', 'north'),
  ('East Ward', 'east'),
  ('West Ward', 'west'),
  ('South Ward', 'south')
ON CONFLICT DO NOTHING;

-- Create storage bucket for pickup request attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pickup-requests', 'pickup-requests', true)
ON CONFLICT DO NOTHING;

-- Create RLS policies for pickup requests bucket
CREATE POLICY "Users can upload their pickup request files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pickup-requests' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their pickup request files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pickup-requests' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all pickup request files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pickup-requests' AND 
  (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) = 'admin'
);