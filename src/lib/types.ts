export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'normal' | 'urgent' | 'critical';

export type RequestStatus = 'open' | 'partially_fulfilled' | 'fulfilled' | 'expired' | 'cancelled';

export interface BloodRequestItem {
  id: string;
  patient_name: string;
  contact_number: string;
  blood_group: BloodGroup;
  units_required: number;
  fulfilled_units: number;
  hospital_name: string;
  city_id: string;
  urgency: UrgencyLevel;
  case_description?: string;
  status: RequestStatus;
  is_verified?: boolean;
  is_reported?: boolean;
  created_at: string;
  required_date: string;
  requester?: {
    id: string;
    full_name: string;
    phone: string;
    profile_image?: string;
    blood_group?: string;
  };
}

export interface ReportItem {
  id: string;
  request_id: string;
  reporter_name: string;
  reporter_phone: string;
  reason: 'commercial_selling' | 'fraud_fake' | 'wrong_number' | 'spam' | 'already_fulfilled';
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  request?: BloodRequestItem;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  subject: string;
  message: string;
  category: 'donation_issue' | 'account' | 'technical_bug' | 'hospital_coordination' | 'feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  admin_notes?: string;
  reply_message?: string;
}

export interface DonorUser {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  blood_group: BloodGroup;
  city: string;
  province?: string;
  donations_count: number;
  lives_saved: number;
  last_donated_at?: string;
  is_eligible: boolean;
  is_verified_badge?: boolean;
  is_suspended?: boolean;
  created_at: string;
}

export interface DashboardKPI {
  totalUsers: number;
  activeDonors: number;
  totalRequests: number;
  activeRequests: number;
  totalDonations: number;
  livesSaved: number;
  pendingTickets: number;
  openReports: number;
  fulfillmentRate: number;
}
