import { getFirebaseDb } from "../config/firebase.config.js";
import { FieldValue } from 'firebase-admin/firestore';

// We call the function once to get the database instance.
const db = getFirebaseDb();
const usersCollection = db.collection("users");

export const createUser = async (userData) => {
    if (!userData?.uid) throw new Error("UID is required.");

    const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    const dataToSet = {
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: displayName,
        role: userData.role || "student",
        country: userData.country || null,
        currentRole: userData.currentRole || null, // The new field
        enrollment: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        profileComplete: false,
        profilePicture: "",
        bio: "",
    };
    await usersCollection.doc(dataToSet.uid).set(dataToSet);
    return await getUserById(dataToSet.uid);
};

// updateUser is updated to handle 'currentRole' and not 'church'.
export const updateUser = async (userId, updateData) => {
    if (!userId) throw new Error("User ID is required.");
    const dataToUpdate = { ...updateData, updatedAt: FieldValue.serverTimestamp() };
    if (dataToUpdate.firstName || dataToUpdate.lastName) {
        const currentData = await getUserById(userId);
        const firstName = dataToUpdate.firstName ?? currentData.firstName;
        const lastName = dataToUpdate.lastName ?? currentData.lastName;
        dataToUpdate.displayName = `${firstName} ${lastName}`.trim();
    }
    await usersCollection.doc(userId).update(dataToUpdate);
    return await getUserById(userId);
};

// No changes needed for the rest of these well-written functions.
export const getUserById = async (userId) => {
    const doc = await usersCollection.doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

export const deleteUser = async (userId) => {
    await usersCollection.doc(userId).delete();
    return { success: true };
};

export const getUserByEmail = async (email) => {
    try {
        const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;
        const userDoc = snapshot.docs[0];
        return { id: userDoc.id, ...convertTimestamps(userDoc.data()) };
    } catch (error) {
        throw new Error(`Database error finding user by email: ${error.message}`);
    }
};

export const setUserEnrollment = async (userId, cohortId, paymentDetails = {}) => {
    // This function can be kept for future use when you add subscriptions.
    const enrollmentData = {
        cohortId: cohortId, // You might change this to 'planId' or similar later.
        enrollmentDate: FieldValue.serverTimestamp(),
        ...paymentDetails
    };
    return await updateUser(userId, { enrollment: enrollmentData });
};

export const getAllUsers = async () => {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) }));
};

