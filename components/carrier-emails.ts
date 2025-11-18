
import { db } from '../firebase-config.ts';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

interface AddEmailResult {
    success: boolean;
    message: string;
}

// Retrieves the list of carrier emails from Firestore.
export const getCarrierEmails = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'carriers'));
    return querySnapshot.docs.map(doc => doc.data().email);
  } catch (error) {
    console.error("Error fetching carrier emails from Firestore: ", error);
    return [];
  }
};

// Adds a new carrier email to the subscription list in Firestore.
export const addCarrierEmail = async (email: string): Promise<AddEmailResult> => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    const normalizedEmail = email.toLowerCase();

    try {
        // Check if email already exists
        const q = query(collection(db, 'carriers'), where("email", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return { success: false, message: 'This email is already subscribed.' };
        }

        // Add the new email
        await addDoc(collection(db, 'carriers'), { 
          email: normalizedEmail, 
          subscribedAt: new Date().toISOString() 
        });

        return { success: true, message: 'You have been successfully subscribed!' };
    } catch (error) {
        console.error("Failed to save carrier email to Firestore", error);
        return { success: false, message: 'An error occurred. Please try again.' };
    }
};