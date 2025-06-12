import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Dynamic base URL based on platform
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Web platform - use current domain or localhost for development
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Development environment - assume Flask backend on port 5000
      return `${protocol}//${hostname}:5000/api`;
    } else {
      // Production environment - use same domain
      return 'https://41kbc50b-5000.euw.devtunnels.ms/api';
    }
  } else {
    // Mobile platform - use your server URL
    return 'https://41kbc50b-5000.euw.devtunnels.ms/api';; // Replace with your actual server URL
  }
};

const BASE_URL = getBaseURL();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    this.authToken = null;
    delete this.api.defaults.headers.common['Authorization'];
  }

  private async handleRequest<T>(request: Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> {
    try {
      const response = await request;
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.handleRequest(
      this.api.post('/auth/login', { email, password })
    );
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.handleRequest(
      this.api.post('/auth/register', userData)
    );
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse<{ user: any; profile: any }>> {
    return this.handleRequest(
      this.api.get('/user/profile')
    );
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse<{ message: string }>> {
    return this.handleRequest(
      this.api.put('/user/profile', profileData)
    );
  }

  // Survey endpoints
  async getSurveys(): Promise<ApiResponse<{ surveys: any[] }>> {
    return this.handleRequest(
      this.api.get('/surveys')
    );
  }

  async getSurveyDetail(surveyId: number): Promise<ApiResponse<{ survey: any }>> {
    return this.handleRequest(
      this.api.get(`/surveys/${surveyId}`)
    );
  }

  async startSurvey(surveyId: number): Promise<ApiResponse<{ survey_url: string; survey: any }>> {
    return this.handleRequest(
      this.api.post(`/surveys/${surveyId}/start`)
    );
  }

  async completeSurvey(surveyId: number, limesurveyResponseId?: number): Promise<ApiResponse<{ message: string; points_awarded: number }>> {
    const payload = limesurveyResponseId ? { limesurvey_response_id: limesurveyResponseId } : {};
    return this.handleRequest(
      this.api.post(`/surveys/${surveyId}/complete`, payload)
    );
  }

  // Rewards endpoints
  async getRewards(): Promise<ApiResponse<{ rewards: any[] }>> {
    return this.handleRequest(
      this.api.get('/rewards')
    );
  }

  async redeemReward(rewardId: number): Promise<ApiResponse<{ message: string; redemption: any }>> {
    return this.handleRequest(
      this.api.post(`/rewards/${rewardId}/redeem`)
    );
  }

  async getUserRewards(): Promise<ApiResponse<{ redemptions: any[] }>> {
    return this.handleRequest(
      this.api.get('/user/rewards')
    );
  }

  // Points endpoints
  async getUserPoints(): Promise<ApiResponse<{ summary: any; history: any[] }>> {
    return this.handleRequest(
      this.api.get('/user/points')
    );
  }

  // Dashboard endpoint
  async getDashboardData(): Promise<ApiResponse<{ user: any; stats: any; recent_activity: any[] }>> {
    return this.handleRequest(
      this.api.get('/dashboard')
    );
  }
}

// Create and export the API service instance
export const apiService = new ApiService();

// Add convenience methods for direct HTTP calls
export const api = {
  get: async (url: string) => {
    try {
      const response = await apiService['api'].get(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  },
  post: async (url: string, data?: any) => {
    try {
      const response = await apiService['api'].post(url, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  },
  put: async (url: string, data?: any) => {
    try {
      const response = await apiService['api'].put(url, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  },
  delete: async (url: string) => {
    try {
      const response = await apiService['api'].delete(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  },
};

export default apiService;