export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED';

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: BloodGroup;
  units_required: number;
  units_fulfilled: number;
  hospital: string;
  city: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  contact_number: string;
  notes?: string;
  requester_name: string;
  created_at: string;
  updated_at: string;
}

export interface DonorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  blood_group: BloodGroup;
  city: string;
  is_available: boolean;
  total_donations: number;
  last_donation_date: string | null;
  created_at: string;
  verified: boolean;
}

export interface DonationRecord {
  id: string;
  donor_id: string;
  donor_name: string;
  blood_group: BloodGroup;
  patient_name: string;
  hospital: string;
  city: string;
  units: number;
  donated_at: string;
  status: 'COMPLETED' | 'VERIFIED' | 'PENDING';
}

export interface DashboardStats {
  totalUsers: number;
  activeRequests: number;
  criticalRequests: number;
  fulfilledDonations: number;
  livesSaved: number;
  totalDonors: number;
}
