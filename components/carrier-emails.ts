
// This file manages the list of carrier email addresses for notifications.
// It uses the browser's local storage to persist the list of subscribers.

import { CARRIER_EMAILS_STORAGE_KEY } from '../constants';

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
    if (storedEmails) {
        return JSON.parse(storedEmails);
    }
    // If storage is empty, initialize it with the default list.
    localStorage.setItem(CARRIER_EMAILS_STORAGE_KEY, JSON.stringify(DEFAULT_CARRIER_EMAILS));
    return DEFAULT_CARRIER_EMAILS;
  } catch (error) {
    console.error("Failed to retrieve carrier emails from local storage", error);
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