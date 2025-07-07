// src/services/AuthService.ts

import { API } from "./api"; // Your API client setup

// This interface is for your backend JWT-based login, which expects an idToken from Firebase client SDK.
export interface LoginCredentials {
  idToken: string;
}

// 1. UPDATED: This interface now matches our new, simplified registration form.
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // role is set on the backend by default, not sent from the client.
}

export interface RegisterResponse {
    message: string;
    userId: string;
}

// 2. UPDATED: The User interface now has 'currentRole' instead of 'church'.
export interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: 'student' | 'admin' | 'instructor';
  country?: string;
  currentRole?: string | null; // <-- REPLACED 'church'
  enrollment?: any | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  profileComplete?: boolean;
  profilePicture?: string | null;
  bio?: string | null;
}

export interface AuthResponse {
  token: string; // The JWT access token from your backend
  user: User;
}

export interface MessageResponse {
  message: string;
}

const AuthService = {
  // --- NO CHANGES NEEDED TO THE LOGIC OF THESE FUNCTIONS ---
  // The logic is robust and will work correctly with the updated types.

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await API.post<AuthResponse>("/auth/login", credentials);
    if (response.data.token && response.data.user) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await API.post<RegisterResponse>("/auth/register", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  },

  async logout(): Promise<void> {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Error during server logout, proceeding with client cleanup.", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("No authentication token found.");
    try {
      const response = await API.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw error;
    }
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },
  
  // NOTE: Your ForgotPasswordPage uses the Firebase client SDK directly,
  // so these backend-driven methods are likely not used in that specific flow,
  // but they are good to have for other potential uses (e.g., admin-initiated resets).
  async requestPasswordReset(email: string): Promise<MessageResponse> {
    const response = await API.post<MessageResponse>("/auth/request-password-reset", { email });
    return response.data;
  },

  async confirmPasswordReset(token: string, newPassword: string): Promise<MessageResponse> {
    const response = await API.post<MessageResponse>("/auth/confirm-password-reset", { token, newPassword });
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required.");
    
    const response = await API.put<{ message: string, user: User }>("/auth/profile", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  async changePassword(newPassword: string): Promise<MessageResponse> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required.");
    
    const response = await API.post<MessageResponse>("/auth/change-password", { newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default AuthService;