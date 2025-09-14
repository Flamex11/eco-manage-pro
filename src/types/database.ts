export type UserRole = 'admin' | 'collector' | 'resident';
export type WasteType = 'wet' | 'dry' | 'hazardous';
export type CollectionStatus = 'collected' | 'pending';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

export interface User {
  id: string;
  auth_user_id: string;
  phone_number?: string;
  email?: string;
  google_id?: string;
  role: UserRole;
  name: string;
  ward_id?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: string;
  name: string;
  zone: string;
  created_at: string;
}

export interface WasteCollection {
  id: string;
  collector_id: string;
  ward_id: string;
  date: string;
  waste_type: WasteType;
  status: CollectionStatus;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  resident_id: string;
  ward_id: string;
  title: string;
  description: string;
  photo_url?: string;
  status: ComplaintStatus;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  date: string;
  ward_id: string;
  total_collections: number;
  segregated_percentage: number;
  complaints_count: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}