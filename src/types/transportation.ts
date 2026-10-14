export interface RouteStop {
  id: string;
  name: string;
  pickupTimeMorning?: string;
  dropoffTimeAfternoon?: string;
  orderIndex: number;
}

export interface TransportationListing {
  routeId: string;
  routeName: string;
  origin: string;
  destinationSchool: string;
  schoolBranch?: string;
  departureTimeMorning?: string;
  departureTimeAfternoon?: string;
  serviceType: string;
  monthlyPrice: number;
  capacity: number;
  availableSeats: number;
  completedTrips: number;
  averageRating: number;
  provider: {
    id: string;
    name: string;
    profilePhoto?: string;
    isVerified: boolean;
    phone?: string;
  };
  vehicle: {
    id: string;
    model: string;
    plateNumber: string;
    capacity: number;
    photoUrl?: string;
    isVerified: boolean;
  };
  stops: RouteStop[];
}

export interface Student {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  grade?: string;
  schoolName: string;
  schoolBranch?: string;
  homeAddress?: string;
  emergencyPhone?: string;
}

export interface TransportationOffer {
  id: string;
  requestId: string;
  senderId: string;
  amount: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED';
  createdAt: string;
}

export interface TransportationRequest {
  id: string;
  parentId: string;
  studentId: string;
  providerId: string;
  routeId: string;
  pickupStopId?: string;
  pickupStopName: string;
  preferredStartDate: string;
  proposedPrice: number;
  currentPrice: number;
  message?: string;
  status: 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  student: Student;
  route: {
    id: string;
    name: string;
    origin: string;
    destinationSchool: string;
    departureTimeMorning?: string;
    departureTimeAfternoon?: string;
    monthlyPrice: number;
    vehicle: {
      make?: string;
      model: string;
      plateNumber: string;
    };
  };
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
  };
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isVerified: boolean;
  };
  offers: TransportationOffer[];
  agreement?: {
    id: string;
    status: string;
    monthlyPrice: number;
  };
}

export interface TransportationAgreement {
  id: string;
  requestId: string;
  parentId: string;
  studentId: string;
  providerId: string;
  vehicleId: string;
  routeId: string;
  pickupStopName: string;
  monthlyPrice: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  student: Student;
  route: {
    id: string;
    name: string;
    origin: string;
    destinationSchool: string;
    departureTimeMorning?: string;
    departureTimeAfternoon?: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
  };
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    phone?: string;
    isVerified: boolean;
  };
  payments: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  agreementId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: string;
  reference: string;
  paidAt?: string;
  createdAt: string;
}

export interface ActivePassenger {
  agreementId: string;
  student: {
    id: string;
    name: string;
    grade?: string;
    schoolName: string;
    emergencyPhone?: string;
  };
  parent: {
    id: string;
    name: string;
    phone?: string;
    email: string;
  };
  route: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    plateNumber: string;
    model: string;
  };
  pickupStopName: string;
  monthlyPrice: number;
  agreementStatus: string;
  latestPayment?: {
    status: string;
    amount: number;
    paidAt?: string;
  } | null;
}
