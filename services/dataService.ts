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

/**
 * Fetches the entire application data state from local storage.
 * If local storage is empty, it initializes it with default data.
 * On any access error, it returns the default data as a fallback.
 */
export const fetchData = async (): Promise<AppData> => {
    try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            const data: AppData = JSON.parse(storedData);
            // Basic validation to ensure data has the expected shape
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
};

/**
 * Saves the entire application data state to local storage.
 * Re-throws errors to allow the UI to handle them (e.g., rollback optimistic updates).
 * @param data The complete application data object to save.
 */
export const saveData = async (data: AppData): Promise<void> => {
    try {
        const stringifiedData = JSON.stringify(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, stringifiedData);
    } catch (error) {
        console.error("Failed to save data to local storage.", error);
        throw error;
    }
};
