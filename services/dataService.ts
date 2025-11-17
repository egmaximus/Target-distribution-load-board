import { CLOUD_STORAGE_URL, MOCK_LOADS } from '../constants';
import type { AppData } from '../types';

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
 * Fetches the entire application data state from the cloud.
 * If the cloud store is empty (404), it initializes it with default data.
 * On any other fetch error, it returns the default data as a fallback.
 */
export const fetchData = async (): Promise<AppData> => {
    try {
        const response = await fetch(CLOUD_STORAGE_URL);
        if (response.status === 404) {
            console.log("No data found in cloud storage, initializing with default data.");
            // Initialize storage if it doesn't exist
            await saveData(INITIAL_STATE);
            return INITIAL_STATE;
        }
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const data: AppData = await response.json();
        // Basic validation to ensure data has the expected shape
        if (data && Array.isArray(data.loads) && Array.isArray(data.carrierEmails)) {
            return data;
        }
        // Return initial state if data is malformed
        return INITIAL_STATE;
    } catch (error) {
        console.error("Failed to fetch data from cloud storage.", error);
        // Fallback to initial state on error for resilience
        return INITIAL_STATE;
    }
};

/**
 * Saves the entire application data state to the cloud.
 * Re-throws errors to allow the UI to handle them (e.g., rollback optimistic updates).
 * @param data The complete application data object to save.
 */
export const saveData = async (data: AppData): Promise<void> => {
    try {
        const response = await fetch(CLOUD_STORAGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to save data to cloud storage.", error);
        throw error;
    }
};
