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

export const resendVerificationEmailApi = async (email?: string): Promise<{ success: boolean; message: string }> => {
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
  grade?: string;
  schoolName: string;
  schoolBranch?: string;
  homeAddress?: string;
  emergencyPhone?: string;
}) => {
  const response = await apiClient.post('/transportation/students', studentData);
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

export const getAdminStatsApi = async () => {
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
  createdAt: string;
  updatedAt: string;
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


