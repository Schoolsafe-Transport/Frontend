import axios from 'axios';
import { User, AuthResponse, RegisterPayload, AuthTokens } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer header automatically
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('schoolsafe_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh interceptor on 401 Unauthorized
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('schoolsafe_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post<{ data: AuthTokens }>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );
          const newTokens = res.data.data;
          localStorage.setItem('schoolsafe_access_token', newTokens.accessToken);
          localStorage.setItem('schoolsafe_refresh_token', newTokens.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        } catch (_refreshErr) {
          localStorage.removeItem('schoolsafe_access_token');
          localStorage.removeItem('schoolsafe_refresh_token');
          localStorage.removeItem('schoolsafe_user');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

// System
export const checkServerHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Auth API Calls
export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data.data;
};

export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data.data;
};

export const logoutApi = async (refreshToken?: string): Promise<void> => {
  await apiClient.post('/auth/logout', { refreshToken });
};

export const forgotPasswordApi = async (email: string) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (token: string, newPassword: string) => {
  const response = await apiClient.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
};

export const verifyEmailApi = async (token: string): Promise<{ success: boolean; message: string; user?: User }> => {
  const response = await apiClient.post('/auth/verify-email', { token });
  return response.data;
};

export const resendVerificationEmailApi = async (email?: string): Promise<{ success: boolean; message: string; delivered?: boolean }> => {
  const response = await apiClient.post('/auth/resend-verification', { email });
  return response.data;
};

// RBAC Demo Endpoints
export const testAdminRoute = async () => {
  const response = await apiClient.get('/auth/admin-only');
  return response.data;
};

export const testSchoolRoute = async () => {
  const response = await apiClient.get('/auth/school-only');
  return response.data;
};

export const testProviderRoute = async () => {
  const response = await apiClient.get('/auth/provider-only');
  return response.data;
};

// ==========================================
// Transportation Marketplace API Calls
// ==========================================

export const searchTransportationApi = async (params: {
  school?: string;
  schoolBranch?: string;
  pickupArea?: string;
  route?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  minSeats?: number;
  minRating?: number;
  serviceType?: string;
  verified?: boolean;
}) => {
  const response = await apiClient.get('/transportation/search', { params });
  return response.data.data;
};

export const getRouteDetailsApi = async (routeId: string) => {
  const response = await apiClient.get(`/transportation/routes/${routeId}`);
  return response.data.data;
};

export const getStudentsApi = async () => {
  const response = await apiClient.get('/transportation/students');
  return response.data.data;
};

export const createStudentApi = async (studentData: {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  grade?: string;
  schoolName: string;
  schoolBranch?: string;
  homeAddress?: string;
  emergencyPhone?: string;
}) => {
  const response = await apiClient.post('/transportation/students', studentData);
  return response.data.data;
};

export const getStudentByIdApi = async (studentId: string) => {
  const response = await apiClient.get(`/transportation/students/${studentId}`);
  return response.data.data;
};

export const updateStudentApi = async (
  studentId: string,
  studentData: Partial<{
    firstName: string;
    lastName: string;
    gender?: string;
    dateOfBirth?: string;
    grade?: string;
    schoolName: string;
    schoolBranch?: string;
    homeAddress?: string;
    emergencyPhone?: string;
  }>
) => {
  const response = await apiClient.patch(`/transportation/students/${studentId}`, studentData);
  return response.data.data;
};

export const deleteStudentApi = async (studentId: string) => {
  const response = await apiClient.delete(`/transportation/students/${studentId}`);
  return response.data.data;
};

export const createTransportationRequestApi = async (payload: {
  studentId: string;
  routeId: string;
  pickupStopId?: string;
  pickupStopName: string;
  preferredStartDate: string;
  proposedPrice?: number;
  message?: string;
}) => {
  const response = await apiClient.post('/transportation/requests', payload);
  return response.data.data;
};

export const getTransportationRequestsApi = async (status?: string) => {
  const response = await apiClient.get('/transportation/requests', {
    params: status ? { status } : undefined,
  });
  return response.data.data;
};

export const getRequestDetailsApi = async (requestId: string) => {
  const response = await apiClient.get(`/transportation/requests/${requestId}`);
  return response.data.data;
};

export const counterOfferApi = async (requestId: string, amount: number, message?: string) => {
  const response = await apiClient.post(`/transportation/requests/${requestId}/counter`, {
    amount,
    message,
  });
  return response.data.data;
};

export const acceptOfferApi = async (requestId: string, offerId?: string) => {
  const response = await apiClient.post(`/transportation/requests/${requestId}/accept-offer`, {
    offerId,
  });
  return response.data.data;
};

export const acceptRequestApi = async (requestId: string) => {
  const response = await apiClient.post(`/transportation/requests/${requestId}/accept`);
  return response.data.data;
};

export const rejectRequestApi = async (requestId: string, reason?: string) => {
  const response = await apiClient.post(`/transportation/requests/${requestId}/reject`, { reason });
  return response.data;
};

export const getMyAgreementsApi = async () => {
  const response = await apiClient.get('/transportation/my-agreements');
  return response.data.data;
};

export const cancelAgreementApi = async (agreementId: string, reason?: string) => {
  const response = await apiClient.post(`/transportation/agreements/${agreementId}/cancel`, {
    reason,
  });
  return response.data.data;
};

export const payAgreementApi = async (agreementId: string, paymentMethod: string = 'TELEBIRR_SIMULATED') => {
  const response = await apiClient.post(`/transportation/agreements/${agreementId}/pay`, {
    paymentMethod,
  });
  return response.data.data;
};

export const getActivePassengersApi = async () => {
  const response = await apiClient.get('/transportation/passengers');
  return response.data.data;
};

// ==========================================
// Notifications API
// ==========================================

export const getNotificationsApi = async (limit: number = 50) => {
  const response = await apiClient.get('/notifications', { params: { limit } });
  return response.data.data;
};

export const markNotificationReadApi = async (notificationId: string) => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await apiClient.patch('/notifications/read-all');
  return response.data;
};

// ==========================================
// Vehicle Fleet Management API
// ==========================================

export const getVehiclesApi = async () => {
  const response = await apiClient.get('/transportation/vehicles');
  return response.data.data;
};

export const createVehicleApi = async (payload: {
  make: string;
  model: string;
  year?: number;
  plateNumber: string;
  capacity: number;
  photoUrl?: string;
}) => {
  const response = await apiClient.post('/transportation/vehicles', payload);
  return response.data.data;
};

export const updateVehicleApi = async (vehicleId: string, payload: any) => {
  const response = await apiClient.put(`/transportation/vehicles/${vehicleId}`, payload);
  return response.data.data;
};

export const deleteVehicleApi = async (vehicleId: string) => {
  const response = await apiClient.delete(`/transportation/vehicles/${vehicleId}`);
  return response.data;
};

// ==========================================
// Route Management API
// ==========================================

export const getProviderRoutesApi = async () => {
  const response = await apiClient.get('/transportation/provider/routes');
  return response.data.data;
};

export const createRouteApi = async (payload: {
  vehicleId: string;
  name: string;
  origin: string;
  destinationSchool: string;
  schoolBranch?: string;
  departureTimeMorning?: string;
  departureTimeAfternoon?: string;
  serviceType: string;
  capacity?: number;
  monthlyPrice: number;
  stops?: Array<{ name: string; pickupTimeMorning?: string; dropoffTimeAfternoon?: string; orderIndex?: number }>;
}) => {
  const response = await apiClient.post('/transportation/routes', payload);
  return response.data.data;
};

export const updateRouteApi = async (routeId: string, payload: any) => {
  const response = await apiClient.put(`/transportation/routes/${routeId}`, payload);
  return response.data.data;
};

export const deleteRouteApi = async (routeId: string) => {
  const response = await apiClient.delete(`/transportation/routes/${routeId}`);
  return response.data;
};

// ==========================================
// Trips & Live Transit API
// ==========================================

export const getTripsApi = async (routeId?: string) => {
  const response = await apiClient.get('/transportation/trips', { params: routeId ? { routeId } : undefined });
  return response.data.data;
};

export const createTripApi = async (payload: {
  routeId: string;
  vehicleId: string;
  driverId?: string;
  tripType: string;
  notes?: string;
}) => {
  const response = await apiClient.post('/transportation/trips', payload);
  return response.data.data;
};

export const updateTripStatusApi = async (tripId: string, status: string) => {
  const response = await apiClient.post(`/transportation/trips/${tripId}/status`, { status });
  return response.data.data;
};

export const getTripPassengersApi = async (tripId: string) => {
  const response = await apiClient.get(`/transportation/trips/${tripId}/passengers`);
  return response.data.data;
};

export const recordBoardingApi = async (tripId: string, payload: {
  studentId: string;
  eventType: 'BOARDED' | 'DROPPED_OFF';
  scannedStop?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const response = await apiClient.post(`/transportation/trips/${tripId}/boarding`, payload);
  return response.data.data;
};

export const recordTripLocationApi = async (tripId: string, coords: {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}) => {
  const response = await apiClient.post(`/transportation/trips/${tripId}/location`, coords);
  return response.data.data;
};

export const getLatestTripLocationApi = async (tripId: string) => {
  const response = await apiClient.get(`/transportation/trips/${tripId}/location`);
  return response.data.data;
};

// ==========================================
// Child Safety & Authorized Pickups API
// ==========================================

export const getAuthorizedPickupsApi = async (studentId: string) => {
  const response = await apiClient.get(`/transportation/students/${studentId}/authorized-pickups`);
  return response.data.data;
};

export const createAuthorizedPickupApi = async (payload: {
  studentId: string;
  fullName: string;
  relationship: string;
  phone: string;
  idNumber?: string;
  photoUrl?: string;
  isEmergencyContact?: boolean;
}) => {
  const response = await apiClient.post(`/transportation/students/${payload.studentId}/authorized-pickups`, payload);
  return response.data.data;
};

export const deleteAuthorizedPickupApi = async (studentId: string, pickupId: string) => {
  const response = await apiClient.delete(`/transportation/students/${studentId}/authorized-pickups/${pickupId}`);
  return response.data;
};

export const createSafetyIncidentApi = async (payload: {
  title: string;
  description: string;
  severity: string;
  tripId?: string;
  routeId?: string;
  vehicleId?: string;
  location?: string;
}) => {
  const response = await apiClient.post('/transportation/safety/incidents', payload);
  return response.data.data;
};

export const getSafetyIncidentsApi = async () => {
  const response = await apiClient.get('/transportation/safety/incidents');
  return response.data.data;
};

// ==========================================
// Fayda National Digital ID Verification API
// ==========================================

export const getFaydaAuthUrlApi = async () => {
  const response = await apiClient.get('/fayda/auth-url');
  return response.data.data;
};

export const initiateFaydaFinApi = async (finNumber: string) => {
  const response = await apiClient.post('/fayda/initiate-fin', { finNumber });
  return response.data;
};

export const verifyFaydaFinApi = async (finNumber: string, otp?: string, transactionId?: string) => {
  const response = await apiClient.post('/fayda/verify-fin', { finNumber, otp, transactionId });
  return response.data;
};

export const getFaydaStatusApi = async () => {
  const response = await apiClient.get('/fayda/status');
  return response.data.data;
};

// ==========================================
// User Profile & Password Change API
// ==========================================

export const changePasswordApi = async (currentPassword: string, newPassword: string) => {
  const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

export const updateProfileApi = async (payload: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePhoto?: string;
}) => {
  const response = await apiClient.patch('/auth/profile', payload);
  return response.data.data;
};

// ==========================================
// Ratings & Reviews API
// ==========================================

export const submitProviderRatingApi = async (payload: {
  providerId: string;
  rating: number;
  comment?: string;
}) => {
  const response = await apiClient.post('/ratings', payload);
  return response.data.data;
};

export const getProviderRatingsApi = async (providerId: string) => {
  const response = await apiClient.get(`/ratings/provider/${providerId}`);
  return response.data.data;
};

// ==========================================
// Business Advertising API
// ==========================================

export const getActiveAdsApi = async (placement?: string) => {
  const response = await apiClient.get('/advertising/active', {
    params: placement ? { placement } : undefined,
  });
  return response.data.data;
};

export const getAdPackagesApi = async () => {
  const response = await apiClient.get('/advertising/packages');
  return response.data.data;
};

export const createAdCampaignApi = async (payload: {
  title: string;
  description?: string;
  bannerUrl: string;
  targetUrl?: string;
  packageId?: string;
  placement?: string;
}) => {
  const response = await apiClient.post('/advertising/campaigns', payload);
  return response.data.data;
};

export const getMyAdCampaignsApi = async () => {
  const response = await apiClient.get('/advertising/my-campaigns');
  return response.data.data;
};

export const recordAdEventApi = async (campaignId: string, eventType: 'IMPRESSION' | 'CLICK') => {
  const response = await apiClient.post(`/advertising/campaigns/${campaignId}/events`, { eventType });
  return response.data;
};

export const getAllAdCampaignsApi = async () => {
  const response = await apiClient.get('/advertising/all-campaigns');
  return response.data.data;
};

export const updateAdCampaignStatusApi = async (campaignId: string, status: 'ACTIVE' | 'REJECTED' | 'PAUSED') => {
  const response = await apiClient.patch(`/advertising/campaigns/${campaignId}/status`, { status });
  return response.data.data;
};

// ==========================================
// Platform Administration API
// ==========================================

export const getAdminUsersApi = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}) => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data.data;
};

export const updateAdminUserStatusApi = async (userId: string, status: string) => {
  const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
  return response.data.data;
};

export interface AdminPlatformStats {
  metrics?: {
    totalUsers: number;
    parents: number;
    pendingProviders: number;
    approvedProviders: number;
    pendingBusinesses: number;
    approvedBusinesses: number;
    pendingVehicles: number;
    approvedVehicles: number;
    totalVehicles: number;
    activeRoutes: number;
    totalRoutes: number;
    activeTrips: number;
    totalTrips: number;
    openIncidents: number;
    pendingPayments: number;
    pendingCampaigns: number;
    activeCampaigns: number;
    totalCampaigns: number;
    totalPaidVolumeETB: number;
    paidTransactionsCount: number;
  };
  pendingApprovals?: {
    providers: number;
    vehicles: number;
    businesses: number;
    campaigns: number;
    payments: number;
    total: number;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  transportation: {
    activeRoutes: number;
    totalVehicles: number;
    activeAgreements: number;
    activeTrips: number;
  };
  financials: {
    totalPaidVolumeETB: number;
    paidTransactionsCount: number;
  };
  safety: {
    incidents: Record<string, number>;
  };
  advertising: {
    activeCampaigns: number;
  };
}

export const getAdminStatsApi = async (): Promise<AdminPlatformStats> => {
  const response = await apiClient.get('/admin/stats');
  return response.data.data;
};

export const getAdminSafetyIncidentsApi = async (params?: { status?: string; severity?: string }) => {
  const response = await apiClient.get('/admin/safety-incidents', { params });
  return response.data.data;
};

export const resolveAdminIncidentApi = async (incidentId: string, resolution: string) => {
  const response = await apiClient.patch(`/admin/safety-incidents/${incidentId}/resolve`, { resolution });
  return response.data.data;
};

export interface AccountDocument {
  id: string;
  userId: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileMimeType: string;
  fileSize: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  expiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  targetUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  createdAt: string;
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  targetUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AdminApplication {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  status: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string | null;
  isVerified: boolean;
  rejectionReason?: string | null;
  businessName?: string | null;
  licenseNumber?: string | null;
  serviceArea?: string | null;
  createdAt: string;
  updatedAt: string;
  accountDocuments?: AccountDocument[];
  vehicles?: Array<{
    id: string;
    make: string;
    model: string;
    year?: number | null;
    plateNumber: string;
    capacity: number;
    isVerified: boolean;
    status: string;
    documents?: Array<{
      id: string;
      documentType: string;
      documentUrl: string;
      isVerified: boolean;
    }>;
  }>;
}

export const getAdminApplicationsApi = async (params?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<AdminApplication[]> => {
  const response = await apiClient.get('/admin/applications', { params });
  return response.data.data;
};

export const reviewAdminApplicationApi = async (
  userId: string,
  decision: 'APPROVE' | 'REJECT' | 'SUSPEND',
  reason?: string
): Promise<User> => {
  const response = await apiClient.post(`/admin/applications/${userId}/review`, { decision, reason });
  return response.data.data;
};

// ==========================================
// Payment Receipt & Multi-Role Review API
// ==========================================

export interface PaymentRecord {
  id: string;
  agreementId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  reference: string;
  receiptUrl?: string | null;
  receiptOriginalName?: string | null;
  receiptMimeType?: string | null;
  receiptSize?: number | null;
  receiptUploadedAt?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    schoolName: string;
  };
  route?: {
    id: string;
    name: string;
    origin: string;
    destinationSchool: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
  };
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export const uploadPaymentReceiptApi = async (agreementId: string, formData: FormData) => {
  const response = await apiClient.post(`/transportation/agreements/${agreementId}/payments/upload-receipt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const getAdminPaymentsApi = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; limit: number; totalPages: number; payments: PaymentRecord[] }> => {
  const response = await apiClient.get('/admin/payments', { params });
  return response.data.data;
};

export const reviewAdminPaymentApi = async (
  paymentId: string,
  payload: {
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_NEW_RECEIPT';
    reason?: string;
  }
) => {
  const response = await apiClient.patch(`/admin/payments/${paymentId}/review`, payload);
  return response.data.data;
};

export const getPaymentReceiptUrl = (paymentId: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${baseUrl}/transportation/payments/${paymentId}/receipt`;
};

// ==========================================
// Student Transport QR Pass & Boarding API
// ==========================================

export interface StudentTransportPassData {
  id: string;
  passCode: string;
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED' | 'EXPIRED';
  issuedAt: string;
  lastScannedAt?: string | null;
  scanCount: number;
  qrDataUrl: string;
  qrToken: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    grade?: string;
    schoolName: string;
    schoolBranch?: string;
    emergencyPhone?: string;
  };
  school: {
    name: string;
    branch: string;
  };
  provider: {
    id: string;
    name: string;
    phone?: string;
    isVerified: boolean;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
  };
  route: {
    id: string;
    name: string;
    origin: string;
    destinationSchool: string;
    pickupStopName: string;
    pickupTimeMorning?: string;
    dropoffTimeAfternoon?: string;
  };
  agreement: {
    id: string;
    status: string;
    monthlyPrice: number;
    currency: string;
  };
  branding: {
    appName: string;
    systemName: string;
    tagline: string;
  };
}

export interface StudentTripStatusData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    schoolName: string;
    schoolBranch?: string;
  };
  hasActiveBooking: boolean;
  pass: {
    id: string;
    passCode: string;
    status: string;
  } | null;
  statusLabel: string;
  statusBadgeColor: string;
  detailMessage: string;
  latestEvent: {
    id: string;
    eventType: string;
    timestamp: string;
    scannedStop?: string;
    tripId: string;
    driverName?: string | null;
    driverPhone?: string | null;
    vehiclePlate?: string | null;
  } | null;
  activeAgreement: {
    id: string;
    routeId: string;
    routeName: string;
    pickupStopName: string;
    providerName: string;
    providerPhone?: string;
    vehiclePlate: string;
    vehicleModel: string;
  } | null;
}

export const getStudentTransportPassApi = async (agreementId: string): Promise<StudentTransportPassData> => {
  const response = await apiClient.get(`/transportation/agreements/${agreementId}/pass`);
  return response.data.data;
};

export const regenerateStudentTransportPassApi = async (agreementId: string): Promise<StudentTransportPassData> => {
  const response = await apiClient.post(`/transportation/agreements/${agreementId}/pass/regenerate`);
  return response.data.data;
};

export const getStudentTripStatusApi = async (studentId: string): Promise<StudentTripStatusData> => {
  const response = await apiClient.get(`/transportation/students/${studentId}/trip-status`);
  return response.data.data;
};

export const scanStudentPassApi = async (
  tripId: string,
  payload: {
    qrToken: string;
    eventType: 'BOARDED' | 'ARRIVED_AT_SCHOOL' | 'BOARDED_FOR_RETURN' | 'DROPPED_OFF';
    scannedStop?: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
  }
) => {
  const response = await apiClient.post(`/transportation/trips/${tripId}/scan-pass`, payload);
  return response.data;
};

// ==========================================
// Onboarding & Document Verification API
// ==========================================

export const saveOnboardingApi = async (payload: {
  businessName?: string;
  licenseNumber?: string;
  serviceArea?: string;
  registrationStep?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}) => {
  const response = await apiClient.post('/auth/onboarding', payload);
  return response.data.data;
};

export const uploadAccountDocumentApi = async (formData: FormData): Promise<AccountDocument> => {
  const response = await apiClient.post('/auth/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const getMyDocumentsApi = async (): Promise<AccountDocument[]> => {
  const response = await apiClient.get('/auth/documents');
  return response.data.data;
};

export const getAccountDocumentUrl = (documentId: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('schoolsafe_access_token');
  return `${baseUrl}/auth/documents/${documentId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
};

// ==========================================
// Parent Payments API
// ==========================================

export const getMyPaymentsApi = async (): Promise<PaymentRecord[]> => {
  const response = await apiClient.get('/transportation/payments/my');
  return response.data.data;
};

// ==========================================
// Admin Audit Logs & Document Reviews
// ==========================================

export const listAuditLogsApi = async (params?: {
  targetUserId?: string;
  limit?: number;
}): Promise<AuditLog[]> => {
  const response = await apiClient.get('/admin/audit-logs', { params });
  return response.data.data;
};

export const reviewAccountDocumentApi = async (
  documentId: string,
  payload: {
    decision: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
  }
): Promise<AccountDocument> => {
  const response = await apiClient.patch(`/admin/documents/${documentId}/review`, payload);
  return response.data.data;
};

// ==========================================
// Admin Vehicles Fleet API
// ==========================================

export interface AdminVehicle {
  id: string;
  providerId: string;
  make: string;
  model: string;
  year?: number | null;
  plateNumber: string;
  capacity: number;
  photoUrl?: string | null;
  inspectionExpiry?: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    businessName?: string | null;
    isVerified: boolean;
    status: string;
  };
  documents?: Array<{
    id: string;
    documentType: string;
    documentUrl: string;
    expiryDate?: string | null;
    isVerified: boolean;
  }>;
  routes?: Array<{
    id: string;
    name: string;
    status: string;
    origin: string;
    destinationSchool: string;
  }>;
}

export const getAdminVehiclesApi = async (params?: {
  status?: string;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; limit: number; totalPages: number; vehicles: AdminVehicle[] }> => {
  const response = await apiClient.get('/admin/vehicles', { params });
  return response.data.data;
};

export const reviewAdminVehicleApi = async (
  vehicleId: string,
  payload: {
    decision: 'APPROVE' | 'REJECT';
    reason?: string;
  }
): Promise<AdminVehicle> => {
  const response = await apiClient.patch(`/admin/vehicles/${vehicleId}/review`, payload);
  return response.data.data;
};

// ==========================================
// Admin User Management API
// ==========================================

export interface AdminUserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  status: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  businessName?: string | null;
  licenseNumber?: string | null;
  serviceArea?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Admin Routes & Trips API
// ==========================================

export interface AdminRouteRecord {
  id: string;
  name: string;
  origin: string;
  destinationSchool: string;
  schoolBranch?: string | null;
  departureTimeMorning?: string | null;
  departureTimeAfternoon?: string | null;
  serviceType: string;
  capacity: number;
  availableSeats: number;
  monthlyPrice: number;
  status: string;
  completedTrips: number;
  averageRating: number;
  createdAt: string;
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    businessName?: string | null;
    isVerified: boolean;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
    capacity: number;
    isVerified: boolean;
    status: string;
  };
  stops?: Array<{
    id: string;
    name: string;
    pickupTimeMorning?: string | null;
    dropoffTimeAfternoon?: string | null;
    orderIndex: number;
  }>;
  _count?: {
    agreements: number;
    requests: number;
  };
}

export const getAdminRoutesApi = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; limit: number; totalPages: number; routes: AdminRouteRecord[] }> => {
  const response = await apiClient.get('/admin/routes', { params });
  return response.data.data;
};

export interface AdminTripRecord {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  route?: {
    id: string;
    name: string;
    origin: string;
    destinationSchool: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  passengers?: Array<{
    id: string;
    status: string;
    student?: {
      id: string;
      firstName: string;
      lastName: string;
      schoolName: string;
    };
  }>;
  locations?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
}

export const getAdminTripsApi = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; limit: number; totalPages: number; trips: AdminTripRecord[] }> => {
  const response = await apiClient.get('/admin/trips', { params });
  return response.data.data;
};

// ==========================================
// Admin Advertising Campaigns API
// ==========================================

export interface AdminCampaignRecord {
  id: string;
  businessId: string;
  packageId?: string | null;
  title: string;
  description?: string | null;
  bannerUrl: string;
  targetUrl?: string | null;
  placement: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'REJECTED' | 'COMPLETED';
  startDate?: string | null;
  endDate?: string | null;
  impressionsCount: number;
  clicksCount: number;
  createdAt: string;
  business?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    businessName?: string | null;
    isVerified: boolean;
    status: string;
  };
  package?: {
    name: string;
    durationDays: number;
    price: number;
    placement: string;
  } | null;
}

export const getAdminCampaignsApi = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ total: number; page: number; limit: number; totalPages: number; campaigns: AdminCampaignRecord[] }> => {
  const response = await apiClient.get('/admin/campaigns', { params });
  return response.data.data;
};

export const reviewAdminCampaignApi = async (
  campaignId: string,
  payload: {
    decision: 'APPROVE' | 'REJECT';
    reason?: string;
  }
): Promise<AdminCampaignRecord> => {
  const response = await apiClient.patch(`/admin/campaigns/${campaignId}/review`, payload);
  return response.data.data;
};

