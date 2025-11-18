
// This file manages the list of carrier email addresses for notifications.
// It uses the browser's local storage to persist the list of subscribers.

import { CARRIER_EMAILS_STORAGE_KEY } from '../constants.ts';

const DEFAULT_CARRIER_EMAILS: string[] = [
  'carrier1@example.com',
  'dispatch@abcfreight.com',
  'bids@quicktransport.net',
  'contact@reliablehaulers.com',
  'freight@crosstownmovers.org',
];

// Retrieves the list of carrier emails from local storage.
// Initializes with default emails if storage is empty.
export const getCarrierEmails = (): string[] => {
  try {
    const storedEmails = localStorage.getItem(CARRIER_EMAILS_STORAGE_KEY);
    
    // Case 1: Data exists
    if (storedEmails) {
      try {
        return JSON.parse(storedEmails);
      } catch (parseError) {
        console.error("Failed to parse carrier emails, resetting.", parseError);
        // Try to clear and reset, but don't crash if it fails
        try {
          localStorage.removeItem(CARRIER_EMAILS_STORAGE_KEY);
          localStorage.setItem(CARRIER_EMAILS_STORAGE_KEY, JSON.stringify(DEFAULT_CARRIER_EMAILS));
        } catch (resetError) {
          console.error("Failed to reset corrupted emails in localStorage.", resetError);
        }
        return DEFAULT_CARRIER_EMAILS;
      }
    }

    // Case 2: No data (first visit)
    try {
      localStorage.setItem(CARRIER_EMAILS_STORAGE_KEY, JSON.stringify(DEFAULT_CARRIER_EMAILS));
    } catch (setItemError) {
       console.error("Failed to save initial emails to localStorage.", setItemError);
    }
    return DEFAULT_CARRIER_EMAILS;

  } catch (storageError) {
    // Case 3: localStorage not available
    console.error("Could not access localStorage for carrier emails.", storageError);
    return DEFAULT_CARRIER_EMAILS;
  }
};

interface AddEmailResult {
    success: boolean;
    message: string;
}

// Adds a new carrier email to the subscription list in local storage.
export const addCarrierEmail = (email: string): AddEmailResult => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    try {
        const currentEmails = getCarrierEmails();
        const normalizedEmail = email.toLowerCase();

        if (currentEmails.map(e => e.toLowerCase()).includes(normalizedEmail)) {
            return { success: false, message: 'This email is already subscribed.' };
        }

        const updatedEmails = [...currentEmails, email];
        localStorage.setItem(CARRIER_EMAILS_STORAGE_KEY, JSON.stringify(updatedEmails));
        return { success: true, message: 'You have been successfully subscribed!' };
    } catch (error) {
        console.error("Failed to save carrier email to local storage", error);
        return { success: false, message: 'An error occurred. Please try again.' };
    }
};