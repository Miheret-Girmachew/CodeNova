// server/controllers/auth.controller.js

import jwt from "jsonwebtoken";
// import { auth } from "../config/firebase.config.js";
import * as UserModel from "../models/user.model.js";

import { getFirebaseAuth } from "../config/firebase.config.js"; // <-- CHANGE HERE

// Then, at the very top of the file, get the auth instance once.
const auth = getFirebaseAuth(); 

function convertToDate(timestampField) {
    if (!timestampField) return null;
    if (typeof timestampField.toDate === 'function') return timestampField.toDate();
    return new Date(timestampField);
}

// -- REGISTER --
export const registerAndEnroll = async (req, res) => {
  let userRecord = null;
  try {
    const {
      email, password, firstName, lastName,
      country, currentRole, selectedCohortId // The 'cohortId' is the plan ID from the form
    } = req.body;

    // Validate all required fields from the form
    if (!email || !password || !firstName || !lastName || !country || !selectedCohortId) {
      return res.status(400).json({ message: "All fields are required for registration." });
    }

    // Check if user already exists in Firebase Auth to prevent duplicates
    try {
        const existingUser = await auth.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
    } catch (error) {
        // This is expected if the user does not exist, so we can ignore the 'auth/user-not-found' error.
        if (error.code !== 'auth/user-not-found') {
            throw error; // Re-throw any other unexpected errors.
        }
    }
    
    // 1. Create the user in Firebase Auth
    userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // 2. Set their role
    await auth.setCustomUserClaims(userRecord.uid, { role: "student" });

    // 3. Prepare data for our Firestore database
    const userDataForFirestore = {
        uid: userRecord.uid,
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role: "student",
        country,
        currentRole: currentRole || null,
        profileComplete: true, // The multi-step form ensures the profile is complete.
    };

    // 4. Create the user profile in our database
    await UserModel.createUser(userDataForFirestore);
    
    // 5. Enroll the user in the selected plan/cohort
    await UserModel.setUserEnrollment(userRecord.uid, selectedCohortId);

    // This endpoint no longer initiates payment directly.
    // It successfully creates and enrolls the user.
    // The redirect to payment should be handled differently if still needed.
    // For now, we return a success message.
    res.status(201).json({
      message: "Registration and enrollment successful! Please log in.",
      userId: userRecord.uid,
    });

  } catch (error) {
    // If anything goes wrong, delete the Firebase user to prevent orphaned accounts.
    if (userRecord?.uid) {
        await auth.deleteUser(userRecord.uid).catch(e => console.error("Critical: Failed to clean up user after registration error:", e));
    }
    console.error("Registration Error:", error);
    res.status(500).json({ message: "An unexpected error occurred during registration." });
  }
};


// -- LOGIN --
// Your login function is excellent. The only change is to adapt the user profile data.
export const login = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decodedToken.uid);
    if (userRecord.disabled) return res.status(403).json({ message: "Account disabled." });
    
    const userProfile = await UserModel.getUserById(userRecord.uid);
    const userRole = userRecord.customClaims?.role || 'student';
    
    const accessToken = jwt.sign({ uid: userRecord.uid, role: userRole }, process.env.JWT_SECRET, { expiresIn: "2h" });
    const refreshToken = jwt.sign({ uid: userRecord.uid }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userProfile?.displayName || userRecord.displayName,
        firstName: userProfile?.firstName,
        lastName: userProfile?.lastName,
        role: userRole,
        country: userProfile?.country,
        currentRole: userProfile?.currentRole, // The new field
        bio: userProfile?.bio,
        profilePicture: userProfile?.profilePicture,
        profileComplete: userProfile?.profileComplete,
        createdAt: convertToDate(userProfile?.createdAt),
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(401).json({ message: "Login failed. Please try again." });
  }
};
export const refreshToken = async (req, res) => {
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    if (!refreshTokenFromCookie) {
        return res.status(401).json({ message: "Authentication required. Please log in." });
    }
    try {
        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.uid;
        if (!userId) {
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            return res.status(403).json({ message: "Invalid session token. Please log in again." });
        }
        const userRecord = await auth.getUser(userId);
        if (userRecord.disabled) {
            res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            return res.status(401).json({ message: "Your account has been disabled." });
        }
        const newAccessToken = jwt.sign(
            { uid: userId, role: userRecord.customClaims?.role || 'student' },
            process.env.JWT_SECRET,
            { expiresIn: "2h" } 
        );
        res.status(200).json({
            message: "Token refreshed successfully",
            token: newAccessToken,
        });
    } catch (error) {
        res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: "Your session has expired. Please log in again." });
        }
        if (error.code === 'auth/user-not-found') {
            return res.status(401).json({ message: "User account associated with this session no longer exists." });
        }
        return res.status(500).json({ message: "Failed to refresh session due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(200).json({ message: "Logout processed, client should clear local session." });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: "Unauthorized: Invalid authentication token." });
        }
        const userId = req.user.uid;
        const userRoleFromToken = req.user.role; 
        
        const userRecord = await auth.getUser(userId); 

        if (userRecord.disabled) {
             return res.status(403).json({ message: "Account is disabled." });
        }

        const authoritativeRole = userRecord.customClaims?.role || 'student';
        if (userRoleFromToken !== authoritativeRole) {
            console.warn(`Role mismatch for UID ${userId}: Token role "${userRoleFromToken}", Firebase Auth role "${authoritativeRole}". Using Firebase Auth role.`);
        }

        let userProfileData = null;
        try {
            userProfileData = await UserModel.getUserById(userId);
            if (!userProfileData) {
                 console.warn(`Firestore profile not found for UID ${userId}. User exists in Auth. Will use Auth data as fallback.`);
                 userProfileData = { 
                    firstName: userRecord.displayName?.split(' ')[0] || null,
                    lastName: userRecord.displayName?.split(' ').slice(1).join(' ') || null,
                    displayName: userRecord.displayName,
                    // other fields might be null or default
                 }; 
            }
        } catch (dbError) {
            console.error(`Error fetching Firestore profile for UID ${userId}:`, dbError);
            return res.status(500).json({ message: "Failed to retrieve user profile data." });
        }

        const responseUserData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userProfileData?.displayName || userRecord.displayName,
            firstName: userProfileData?.firstName,
            lastName: userProfileData?.lastName,
            role: authoritativeRole, 
            country: userProfileData?.country,
            church: userProfileData?.church,
            enrollment: userProfileData?.enrollment,
            createdAt: convertToDate(userProfileData?.createdAt) || convertToDate(userRecord.metadata.creationTime),
            updatedAt: convertToDate(userProfileData?.updatedAt) || convertToDate(userRecord.metadata.lastSignInTime),
            profileComplete: userProfileData?.profileComplete,
            profilePicture: userProfileData?.profilePicture || userRecord.photoURL, // Prefer Firestore, fallback to Auth
            bio: userProfileData?.bio,
        };
        res.status(200).json(responseUserData);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User account not found." });
        }
        console.error("Error in getCurrentUser:", error); // Log the actual error object
        res.status(500).json({ message: "Failed to fetch user details due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};


export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    const successMessage = "If an account with that email exists, a password reset link has been sent.";

    try {
        const actionCodeSettings = {
            url: process.env.PASSWORD_RESET_REDIRECT_URL || 'http://localhost:5173/reset-password-confirm',
            handleCodeInApp: false,
        };

        const resetLink = await auth.generatePasswordResetLink(email, actionCodeSettings);

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: process.env.MAIL_SECURE === 'true', 
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.MAIL_FROM, 
            to: email,
            subject: "Password Reset Request for Your App", 
            text: `Hello, \n\nPlease click on the following link to reset your password: \n\n${resetLink}\n\nIf you did not request this, please ignore this email.`, // Plain text body
            html: `<p>Hello,</p>
                   <p>Please click on the button below to reset your password.</p>
                   <a href="${resetLink}" style="background-color: #C5A467; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">Reset Password</a>
                   <p>If you did not request this, please ignore this email.</p>`,
        });

        res.status(200).json({ message: successMessage });

    } catch (error) {
        console.error("Error in requestPasswordReset:", error);

        if (error.code === 'auth/user-not-found') {
            return res.status(200).json({ message: successMessage });
        }

        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ message: "The email address provided is not valid." });
        }

        res.status(500).json({
            message: "Failed to send password reset email due to a server error.",
            detail: process.env.NODE_ENV !== 'production' ? error.message : undefined
        });
    }
};

export const confirmPasswordReset = async (req, res) => {
    try {
        const { oobCode, newPassword } = req.body;

        if (!oobCode || !newPassword) {
            return res.status(400).json({ message: "Reset code and new password are required." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        // Verify the password reset code.
        const email = await auth.verifyPasswordResetCode(oobCode);

        // If the code is valid, update the user's password.
        await auth.confirmPasswordReset(oobCode, newPassword);

        // Optionally, you might want to get the user and update their Firestore record
        // if you store any password-related metadata there (though typically not needed for just password reset).
        // const userRecord = await auth.getUserByEmail(email);
        // await UserModel.updateUser(userRecord.uid, { /* some_field_if_needed: true */ });

        res.status(200).json({ message: "Password has been reset successfully. You can now log in with your new password." });

    } catch (error) {
        console.error("Error in confirmPasswordReset:", error);
        let errorMessage = "Failed to reset password. The link may be invalid or expired.";
        let statusCode = 400; // Default for invalid code type errors

        if (error.code === 'auth/expired-action-code') {
            errorMessage = "The password reset link has expired. Please request a new one.";
        } else if (error.code === 'auth/invalid-action-code') {
            errorMessage = "The password reset link is invalid. It may have already been used or malformed. Please request a new one.";
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = "Your account has been disabled.";
            statusCode = 403;
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = "User not found. The account may have been deleted.";
            statusCode = 404;
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "The new password is too weak.";
        } else {
            // Generic server error
            errorMessage = "An unexpected error occurred while resetting your password.";
            statusCode = 500;
        }
        res.status(statusCode).json({ message: errorMessage, detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        if (!req.user?.uid) return res.status(401).json({ message: "Unauthorized." });
        const { uid } = req.user;
        // -- CHANGE: Replaced 'church' with 'currentRole'.
        const { firstName, lastName, country, currentRole, bio, profilePicture } = req.body;
        
        const updatedFirestoreData = {};
        if (firstName !== undefined) updatedFirestoreData.firstName = firstName;
        if (lastName !== undefined) updatedFirestoreData.lastName = lastName;
        if (country !== undefined) updatedFirestoreData.country = country;
        // -- CHANGE: Update 'currentRole' instead of 'church'.
        if (currentRole !== undefined) updatedFirestoreData.currentRole = currentRole || null;
        if (bio !== undefined) updatedFirestoreData.bio = bio || null;
        if (profilePicture !== undefined) updatedFirestoreData.profilePicture = profilePicture || null;

        const newDisplayName = `${firstName || user.firstName} ${lastName || user.lastName}`.trim();
        if (newDisplayName) updatedFirestoreData.displayName = newDisplayName;

        const profileComplete = !!(updatedFirestoreData.firstName && updatedFirestoreData.lastName && updatedFirestoreData.country);
        updatedFirestoreData.profileComplete = profileComplete;

        await auth.updateUser(uid, { displayName: newDisplayName, photoURL: profilePicture || null });
        await UserModel.updateUser(uid, updatedFirestoreData);
        
        const finalUserDoc = await UserModel.getUserById(uid);
        res.status(200).json({ message: "Profile updated successfully", user: finalUserDoc });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile.", detail: error.message });
    }
};


export const changePassword = async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: "Unauthorized: Invalid authentication token." });
        }
        const { uid } = req.user;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        await auth.updateUser(uid, {
            password: newPassword,
        });

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error in changePassword:", error);
        if (error.code === 'auth/requires-recent-login') {
            return res.status(403).json({
                message: "This operation requires you to have logged in recently. Please log out and log back in to change your password.",
                code: error.code 
            });
        }
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User account not found." });
        }
        if (error.code === 'auth/weak-password') { 
             return res.status(400).json({ message: "Password is too weak. Please choose a stronger password." });
        }
        res.status(500).json({ message: "Failed to change password due to a server error.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

// Admin specific functions
export const createUserByAdmin = async (req, res) => {
    let userRecord = null;
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            country,
            church,
            role 
        } = req.body;

        if (!email || !password || !firstName || !lastName || !country || !role) {
            return res.status(400).json({ message: "Missing required fields (email, password, firstName, lastName, country, role)." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }
        if (!['student', 'admin', 'instructor'].includes(role)) {
             return res.status(400).json({ message: "Invalid role specified. Allowed roles: student, admin, instructor." });
        }

        userRecord = await auth.createUser({
            email,
            password: password,
            displayName: `${firstName} ${lastName}`,
        });

        await auth.setCustomUserClaims(userRecord.uid, { role: role });

        // UserModel.createUser should set createdAt/updatedAt with FieldValue.serverTimestamp()
        const userDataForFirestore = {
            uid: userRecord.uid,
            email: email,
            firstName: firstName,
            lastName: lastName,
            displayName: `${firstName} ${lastName}`,
            role: role, 
            country: country,
            church: church || null,
            enrollment: null, 
            profileComplete: !!(firstName && lastName && country), 
        };
        await UserModel.createUser(userDataForFirestore);

        res.status(201).json({
            message: `User '${email}' created successfully with role '${role}'.`,
            userId: userRecord.uid,
            user: { 
               uid: userRecord.uid,
               email: email,
               displayName: `${firstName} ${lastName}`,
               role: role,
               country: country
            }
        });
    } catch (error) {
        let errorMessage = "User creation failed due to an internal server error.";
        let statusCode = 500;

        if (error.message && error.message.includes("Firestore") && userRecord && userRecord.uid) {
            errorMessage = "User creation partially failed (profile storage). Please try again or contact support.";
            try {
                await auth.deleteUser(userRecord.uid); 
            } catch (deleteError) {
                console.error(`CRITICAL: Failed to delete Firebase Auth user ${userRecord.uid} after Firestore save error:`, deleteError);
                errorMessage = "User creation failed critically. Orphaned account may exist. Contact support immediately.";
            }
        }
        else if (error.code === "auth/email-already-exists") {
            errorMessage = "The email address is already in use.";
            statusCode = 409;
        } else if (error.code === "auth/invalid-password") {
            errorMessage = "Password should be at least 6 characters.";
            statusCode = 400;
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "The email address is not valid.";
            statusCode = 400;
        } else if (error.code?.startsWith('auth/')) { 
             errorMessage = `User creation failed: ${error.message}`;
             statusCode = 400;
        }

        const responsePayload = { message: errorMessage };
        if (process.env.NODE_ENV !== 'production' && error.message) {
            responsePayload.detail = error.message;
            responsePayload.code = error.code; 
        }
        console.error("Error in createUserByAdmin:", error);
        res.status(statusCode).json(responsePayload);
    }
};

export const getAllUsersForAdmin = async (req, res) => {
    try {
        const listUsersResult = await auth.listUsers(1000); 
        
        const usersWithFirestoreData = await Promise.all(
            listUsersResult.users.map(async (userRecord) => {
                let firestoreData = null;
                try {
                    firestoreData = await UserModel.getUserById(userRecord.uid);
                } catch (dbError) {
                    console.warn(`Could not fetch Firestore data for user ${userRecord.uid}:`, dbError.message);
                }
                return {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: firestoreData?.displayName || userRecord.displayName,
                    firstName: firestoreData?.firstName,
                    lastName: firestoreData?.lastName,
                    role: userRecord.customClaims?.role || 'student', 
                    country: firestoreData?.country,
                    church: firestoreData?.church,
                    enrollment: firestoreData?.enrollment,
                    createdAt: convertToDate(firestoreData?.createdAt) || convertToDate(userRecord.metadata.creationTime),
                    lastSignInTime: convertToDate(userRecord.metadata.lastSignInTime),
                    disabled: userRecord.disabled,
                    emailVerified: userRecord.emailVerified,
                };
            })
        );
        res.status(200).json(usersWithFirestoreData);
    } catch (error) {
        console.error("Error in getAllUsersForAdmin:", error);
        res.status(500).json({ message: "Failed to retrieve user list.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const deleteUserAdmin = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }
    try {
        await auth.deleteUser(userId); 
        
        try {
            await UserModel.deleteUser(userId); 
        } catch (dbError) {
            console.warn(`User ${userId} deleted from Auth, but failed to delete from Firestore:`, dbError.message);
        }
        
        res.status(200).json({ message: `User ${userId} deleted successfully.` });
    } catch (error) {
        console.error(`Error deleting user ${userId} by admin:`, error);
        if (error.code === 'auth/user-not-found') {
             try {
                await UserModel.deleteUser(userId);
                return res.status(200).json({ message: `User ${userId} not found in Authentication but was removed from database if present.` });
             } catch (dbError) {
                return res.status(404).json({ message: "User not found in Firebase Authentication and database record could not be verified/removed." });
             }
        }
        res.status(500).json({ message: "Failed to delete user.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};

export const updateUserStatusAdmin = async (req, res) => {
    const { userId } = req.params;
    const { role, disabled } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }
    if (role === undefined && disabled === undefined) {
        return res.status(400).json({ message: "At least one field (role or disabled status) must be provided for update." });
    }

    const updates = {};
    const firestoreUpdates = {};

    if (role !== undefined) {
        if (!['student', 'admin', 'instructor'].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified. Allowed roles: student, admin, instructor." });
        }
        updates.customClaims = { role }; 
        firestoreUpdates.role = role;     
    }

    if (disabled !== undefined) {
        if (typeof disabled !== 'boolean') {
            return res.status(400).json({ message: "Disabled status must be a boolean." });
        }
        updates.disabled = disabled; 
    }

    try {
        await auth.updateUser(userId, updates);
        if (Object.keys(firestoreUpdates).length > 0) {
            // UserModel.updateUser should also set updatedAt via FieldValue.serverTimestamp()
            await UserModel.updateUser(userId, firestoreUpdates);
        }
        
        const updatedUserRecord = await auth.getUser(userId);
        const updatedFirestoreUser = await UserModel.getUserById(userId);

        res.status(200).json({
            message: `User ${userId} status updated successfully.`,
            user: {
                uid: updatedUserRecord.uid,
                email: updatedUserRecord.email,
                displayName: updatedFirestoreUser?.displayName || updatedUserRecord.displayName,
                role: updatedUserRecord.customClaims?.role,
                disabled: updatedUserRecord.disabled,
            }
        });
    } catch (error) {
        console.error(`Error updating status for user ${userId} by admin:`, error);
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(500).json({ message: "Failed to update user status.", detail: process.env.NODE_ENV !== 'production' ? error.message : undefined });
    }
};