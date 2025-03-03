export type UserType = 'hospital' | 'ambulance';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  organizationName: string;
  userType: UserType;
  created_at: string;
}

export interface Hospital {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPhone: string;
  contactEmail: string;
  created_at: string;
}

export interface AmbulanceService {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPhone: string;
  contactEmail: string;
  fleetSize: number;
  created_at: string;
}

export interface TransportRequest {
  id: string;
  hospitalId: string;
  patientName: string;
  patientDob: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupZipCode: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffState: string;
  dropoffZipCode: string;
  transportDate: string;
  transportTime: string;
  transportType: 'emergency' | 'non-emergency';
  specialRequirements: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface TransportBid {
  id: string;
  transportRequestId: string;
  ambulanceServiceId: string;
  price: number;
  estimatedArrivalTime: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface TransportAssignment {
  id: string;
  transportRequestId: string;
  ambulanceServiceId: string;
  bidId: string | null;
  status: 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  startTime: string | null;
  endTime: string | null;
  notes: string;
  created_at: string;
} 