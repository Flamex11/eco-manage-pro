-- Make collector_id nullable to allow resident pickup requests without assigned collectors
ALTER TABLE public.waste_collections 
ALTER COLUMN collector_id DROP NOT NULL;