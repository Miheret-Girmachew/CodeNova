// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, Auth } from "firebase/auth";
import * as apiService from "../services/api";
import { getToken } from "../services/api";
import { Loader2 } from "lucide-react";

export interface AppUser {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: 'student' | 'instructor' | 'admin';
    country?: string | null;
    church?: string | null; // Note: This might be 'currentRole' in your new user model
    enrollment?: {
        cohortId: string;
        enrollmentDate: Date | string;
    } | null;
    profileComplete?: boolean;
    profilePicture?: string | null;
    bio?: string | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
    currentRole?: string;

}

interface AuthContextType {
    currentUser: AppUser | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<AppUser | null>;
    register: (userData: any) => Promise<AppUser | null>;
    logout: () => Promise<void>;
    updateProfile: (userData: Partial<Pick<AppUser, 'firstName' | 'lastName' | 'country' | 'church'>>) => Promise<AppUser | null>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isInstructor: boolean;
    isStudent: boolean;
    fetchCurrentUser: () => Promise<AppUser | null>;
    updateUserContextProfile: (updatedProfileData: Partial<AppUser>) => void;
}

// --- THIS IS THE CORRECTED PART ---
// We now read the configuration from the .env.local file via Vite's import.meta.env
// This ensures you are using the correct credentials for your 'codenova-15faa' project.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// This log will print to your browser's developer console.
// After you apply this fix, it should show "codenova-15faa" as the projectId.
console.log("🔥 AuthContext Firebase Config:", firebaseConfig);


// Initialize Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);
const authInstance: Auth = getAuth(app);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// These are just styling constants, no changes needed here.
const goldAccent = 'text-[#C5A467]';
const sectionBgLight = "bg-[#FFF8F0]";
const sectionBgDark = "dark:bg-gray-950";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCurrentUser = useCallback(async (): Promise<AppUser | null> => {
        try {
            const token = getToken();
            if (!token) {
                setCurrentUser(null);
                return null;
            }
            const userData: AppUser = await apiService.getCurrentUser();
            setCurrentUser(userData);
            setError(null);
            return userData;
        } catch (err: any) {
            setCurrentUser(null);
            if (err.response?.status === 401 || err.response?.status === 403) {
                apiService.removeToken();
            }
            return null;
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            await fetchCurrentUser();
            setLoading(false);
        };
        initializeAuth();
    }, [fetchCurrentUser]);

    const login = async (email: string, password: string): Promise<AppUser | null> => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
            const firebaseUser = userCredential.user;
            const idToken = await firebaseUser.getIdToken(true);
            const backendResponse = await apiService.loginUser({ idToken });
            setCurrentUser(backendResponse.user);
            return backendResponse.user;
        } catch (err: any) {
            setCurrentUser(null);
            apiService.removeToken();
            let errorMessage = "Login failed. Please check credentials.";
            if (err.code?.startsWith('auth/')) {
                // You can add more specific firebase auth client errors here if you want
                errorMessage = "Invalid email or password.";
            }
            else if (err.response?.data?.message) { errorMessage = err.response.data.message; }
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any): Promise<AppUser | null> => {
        setLoading(true);
        setError(null);
        try {
            await apiService.registerUser(userData);
            setError("Registration successful! Please log in.");
            return null;
        } catch (err: any) {
            setCurrentUser(null);
            apiService.removeToken();
            let errorMessage = "Registration failed. Please try again.";
            if (err.response?.data?.message) { errorMessage = err.response.data.message; }
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await firebaseSignOut(authInstance);
            await apiService.logoutUser();
        } catch (err: any) {
            console.error("AuthContext: Logout error:", err);
        } finally {
            setCurrentUser(null);
            apiService.removeToken();
            setLoading(false);
        }
    };

    const updateProfile = async (
        profileDataToUpdate: Partial<Pick<AppUser, 'firstName' | 'lastName' | 'country' | 'church'>>
    ): Promise<AppUser | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.updateUserProfile(profileDataToUpdate);
            setCurrentUser(response.user);
            return response.user;
        } catch (err: any) {
            let errorMessage = "Failed to update profile.";
            if (err.response?.data?.message) { errorMessage = err.response.data.message; }
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const updateUserContextProfile = (updatedProfileData: Partial<AppUser>): void => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                ...updatedProfileData,
            };
        });
    };

    const isAuthenticated = !!currentUser;
    const isAdmin = currentUser?.role === "admin";
    const isInstructor = currentUser?.role === "instructor" || isAdmin;
    const isStudent = currentUser?.role ==='student';

    const value: AuthContextType = {
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
        isAdmin,
        isInstructor,
        isStudent,
        fetchCurrentUser,
        updateUserContextProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div
                    className={`flex items-center justify-center min-h-screen ${sectionBgLight} ${sectionBgDark}`}
                    role="status"
                    aria-label="Loading application state"
                >
                    <Loader2 className={`h-12 w-12 animate-spin ${goldAccent}`} />
                </div>
            )}
        </AuthContext.Provider>
    );
};