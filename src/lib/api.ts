import { supabase, isSupabaseConfigured } from './supabase';
import { 
  mockStats, 
  mockBloodRequests, 
  mockDonors, 
  mockDonations 
} from './mockData';
import { BloodRequest, DonorProfile, DonationRecord, DashboardStats, RequestStatus } from './types';

// In-memory state for local mock mutation
let localBloodRequests = [...mockBloodRequests];
let localDonors = [...mockDonors];

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured || !supabase) {
    return mockStats;
  }

  try {
    const [
      { count: usersCount },
      { count: donorsCount },
      { count: activeReqCount },
      { count: criticalReqCount },
      { count: fulfilledCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_available', true),
      supabase.from('blood_requests').select('*', { count: 'exact', head: true }).in('status', ['OPEN', 'IN_PROGRESS']),
      supabase.from('blood_requests').select('*', { count: 'exact', head: true }).eq('urgency', 'CRITICAL').in('status', ['OPEN', 'IN_PROGRESS']),
      supabase.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED')
    ]);

    return {
      totalUsers: usersCount || mockStats.totalUsers,
      totalDonors: donorsCount || mockStats.totalDonors,
      activeRequests: activeReqCount || mockStats.activeRequests,
      criticalRequests: criticalReqCount || mockStats.criticalRequests,
      fulfilledDonations: fulfilledCount || mockStats.fulfilledDonations,
      livesSaved: Math.round((fulfilledCount || mockStats.fulfilledDonations) * 1.5),
    };
  } catch (error) {
    console.warn('Falling back to mock stats due to:', error);
    return mockStats;
  }
}

export async function getBloodRequests(): Promise<BloodRequest[]> {
  if (!isSupabaseConfigured || !supabase) {
    return localBloodRequests;
  }

  try {
    const { data, error } = await supabase
      .from('blood_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return localBloodRequests;
    }

    return data as BloodRequest[];
  } catch {
    return localBloodRequests;
  }
}

export async function updateBloodRequestStatus(id: string, status: RequestStatus): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    localBloodRequests = localBloodRequests.map((req) => 
      req.id === id ? { ...req, status, updated_at: new Date().toISOString() } : req
    );
    return true;
  }

  try {
    const { error } = await supabase
      .from('blood_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function getDonors(): Promise<DonorProfile[]> {
  if (!isSupabaseConfigured || !supabase) {
    return localDonors;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return localDonors;
    }

    return data as DonorProfile[];
  } catch {
    return localDonors;
  }
}

export async function toggleDonorAvailability(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    localDonors = localDonors.map((d) => 
      d.id === id ? { ...d, is_available: !d.is_available } : d
    );
    return true;
  }

  try {
    const donor = localDonors.find(d => d.id === id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_available: !donor?.is_available })
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function getDonations(): Promise<DonationRecord[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockDonations;
  }

  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('donated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockDonations;
    }

    return data as DonationRecord[];
  } catch {
    return mockDonations;
  }
}
