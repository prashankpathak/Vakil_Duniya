export interface Service {
  id: string;
  name: string;
  fee: number;
  icon: string;
}

export interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  consultation_fee: number;
  city: string;
  language: string[];
  rating: number;
  image: string;
  upi_id?: string;
  mobile_number?: string;
}

export interface BookingRequest {
  name: string;
  mobile: string;
  case_type: string;
  appointment_date: string;
  lawyer_id: string;
}

export interface BookingResponse {
  message: string;
  booking: {
    id: string;
    name: string;
    mobile: string;
    case_type: string;
    appointment_date: string;
    lawyer_id: string;
    payment_status: string;
    created_at: string;
  }
}
