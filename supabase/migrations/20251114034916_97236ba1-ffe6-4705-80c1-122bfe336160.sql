-- Allow residents to create pickup requests (with null collector_id for pending assignment)
CREATE POLICY "Residents can create pickup requests"
ON public.waste_collections
FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = 'resident'::user_role AND
  collector_id IS NULL AND
  status = 'pending'::collection_status
);

-- Allow residents to view waste collections in their ward
CREATE POLICY "Residents can view collections in their ward"
ON public.waste_collections
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'resident'::user_role AND
  ward_id = get_current_user_ward()
);