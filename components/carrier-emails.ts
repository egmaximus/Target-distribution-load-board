// This file manages the list of carrier email addresses for notifications.
// It uses localStorage to persist the list of subscribers.

const DEFAULT_CARRIER_EMAILS: string[] = [
  'carrier1@example.com',
  'dispatch@abcfreight.com',
  'bids@quicktransport.net',
  'contact@reliablehaulers.com',
  'freight@crosstownmovers.org',
];

const STORAGE_KEY = 'carrierEmails';

export const getCarrierEmails = (): string[] => {
  try {
    const storedEmails = localStorage.getItem(STORAGE_KEY);
    if (storedEmails) {
      return JSON.parse(storedEmails);
    }
    // If no emails are stored, initialize with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CARRIER_EMAILS));
    return DEFAULT_CARRIER_EMAILS;
  } catch (error) {
    console.error("Failed to retrieve carrier emails from localStorage", error);
    return DEFAULT_CARRIER_EMAILS;
  }
};

interface AddEmailResult {
    success: boolean;
    message: string;
}

export const addCarrierEmail = (email: string): AddEmailResult => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    const currentEmails = getCarrierEmails();
    const normalizedEmail = email.toLowerCase();

    if (currentEmails.map(e => e.toLowerCase()).includes(normalizedEmail)) {
        return { success: false, message: 'This email is already subscribed.' };
    }

    const updatedEmails = [...currentEmails, email];
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
        return { success: true, message: 'You have been successfully subscribed!' };
    } catch (error) {
        console.error("Failed to save carrier email to localStorage", error);
        return { success: false, message: 'An error occurred. Please try again.' };
    }
};
