export interface LegalSubService {
  id: string;
  titleHindi: string;
  titleEnglish: string;
  descriptionHindi?: string;
  keyActsOrProvisions?: string;
}

export interface LegalServiceSubCategory {
  id: string;
  category: 'civil' | 'criminal';
  titleHindi: string;
  titleEnglish: string;
  iconName: string;
  descriptionHindi: string;
  items: LegalSubService[];
  feeStarting?: number;
  badge?: string;
}

export interface LegalServiceMainCategory {
  id: 'civil' | 'criminal';
  categoryNumber: 1 | 2;
  titleHindi: string;
  titleEnglish: string;
  badge: string;
  iconName: string;
  descriptionHindi: string;
  subCategories: LegalServiceSubCategory[];
}

export interface Service {
  id: string;
  name: string;
  fee?: number;
  icon: string;
  category?: 'civil' | 'criminal';
  hindiTitle?: string;
  subItems?: string[];
}

export interface Lawyer {
  id: string;
  uid?: string;
  name: string;
  email?: string;
  specialization: string;
  experience: string;
  consultation_fee?: number;
  city: string;
  state?: string;
  address?: string;
  pincode?: string;
  language: string[];
  rating: number;
  image: string;
  upi_id?: string;
  mobile_number?: string;
  whatsapp_number?: string;
  office_phone?: string;
  consultation_mode?: string;
  bar_enrollment?: string;
  bio?: string;
  is_verified?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approval_remarks?: string;
  portal_fee_paid?: boolean;
  created_at?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  phone?: string;
  whatsappNumber?: string;
  officePhone?: string;
  role?: 'admin' | 'client' | 'lawyer';
  lawyerId?: string;
  barEnrollment?: string;
  isVerifiedLawyer?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalRemarks?: string;
  portalFeePaid?: boolean;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'admin' | 'client' | 'lawyer';
  approval_status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  bar_enrollment?: string;
  city?: string;
}

export type AppointmentStatus = 'Pending' | 'Accepted' | 'Disposed' | 'Cancelled';

export interface BookingRequest {
  name: string;
  mobile: string;
  case_type: string;
  appointment_date: string;
  lawyer_id: string;
  consultation_mode?: string;
  userId?: string;
  userEmail?: string;
}

export interface BookingRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  name: string;
  mobile: string;
  case_type: string;
  appointment_date: string;
  lawyer_id: string;
  lawyer_name?: string;
  lawyer_specialization?: string;
  lawyer_city?: string;
  consultation_mode?: string;
  status: AppointmentStatus;
  remarks?: string;
  payment_status: string;
  created_at: string;
}

export interface BookingResponse {
  message: string;
  booking: BookingRecord;
}


