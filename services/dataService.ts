import { MOCK_LOADS } from '../constants';
import type { AppData } from '../types';

const LOCAL_STORAGE_KEY = 'targetDistributionLoadboardData';

const DEFAULT_CARRIER_EMAILS: string[] = [
  'carrier1@example.com',
  'dispatch@abcfreight.com',
  'bids@quicktransport.net',
  'contact@reliablehaulers.com',
  'freight@crosstownmovers.org',
];

const INITIAL_STATE: AppData = {
    loads: MOCK_LOADS,
    carrierEmails: DEFAULT_CARRIER_EMAILS,
};

let memoryStore: AppData | null = null;

const isLocalStorageAvailable = (): boolean => {
    try {
        const testKey = '__test_local_storage__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
};

const storageAvailable = isLocalStorageAvailable();

if (!storageAvailable) {
    console.warn("localStorage is not available. Data will not be persisted across sessions. Changes will be lost on page refresh.");
}

/**
 * Fetches the entire application data state.
 * It tries to use local storage first. If not available or fails,
 * it falls back to an in-memory store for the current session.
 * If local storage is empty, it initializes it with default data.
 */
export const fetchData = async (): Promise<AppData> => {
    if (storageAvailable) {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                const data: AppData = JSON.parse(storedData);
                // Basic validation
                if (data && Array.isArray(data.loads) && Array.isArray(data.carrierEmails)) {
                    return data;
                }
            }
            // If no data or malformed, initialize
            console.log("No data found in local storage, initializing with default data.");
            await saveData(INITIAL_STATE);
            return INITIAL_STATE;
        } catch (error) {
            console.error("Failed to fetch data from local storage.", error);
            // Fallback to initial state on error for resilience
            return INITIAL_STATE;
        }
    } else {
        // Use in-memory store
        if (memoryStore) {
            return memoryStore;
        }
        // Deep copy to avoid mutation issues with the original constant
        memoryStore = JSON.parse(JSON.stringify(INITIAL_STATE)); 
        return memoryStore;
    }
};

/**
 * Saves the entire application data state.
 * Tries to save to local storage. If not available, saves to an in-memory store
 * for the current session and does not throw an error.
 * Re-throws errors from local storage to allow UI to handle them (e.g., rollback).
 * @param data The complete application data object to save.
 */
export const saveData = async (data: AppData): Promise<void> => {
    if (storageAvailable) {
        try {
            const stringifiedData = JSON.stringify(data);
            localStorage.setItem(LOCAL_STORAGE_KEY, stringifiedData);
        } catch (error) {
            console.error("Failed to save data to local storage.", error);
            throw error; // Re-throw to be caught by UI logic
        }
    } else {
        // Save to in-memory store
        memoryStore = data;
        // Don't throw error, just resolve. This prevents UI rollback on optimistic updates.
        return Promise.resolve();
    }
};
