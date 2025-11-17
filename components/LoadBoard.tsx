import React from 'react';
import type { Load } from '../types';
import LoadItem from './LoadItem';

interface LoadBoardProps {
  loads: Load[];
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  onPromptLogin: () => void;
  onRemoveLoad: (loadId: string) => void;
  onEditLoad: (load: Load) => void;
}

const LoadBoard: React.FC<LoadBoardProps> = ({ loads, isLoading, error, isLoggedIn, onPromptLogin, onRemoveLoad, onEditLoad }) => {
  if (isLoading) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none dark:border dark:border-gray-700 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 animate-pulse">Loading Loads...</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Fetching the latest data.</p>
        </div>
    );
  }

  if (error) {
     return (
        <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-6 rounded-lg" role="alert">
            <h3 className="text-xl font-bold">Error Loading Data</h3>
            <p className="mt-2">{error}</p>
        </div>
    );
  }

  if (loads.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none dark:border dark:border-gray-700 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">No Loads Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">There are currently no open freight loads. Please check back later.</p>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none dark:border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-200 dark:bg-gray-700/50 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            <div className="col-span-4">Origin / Destination</div>
            <div className="col-span-2">Pickup Date</div>
            <div className="col-span-2">Equipment</div>
            <div className="col-span-2 text-right">Current Bid</div>
            <div className="col-span-2 text-center">Actions</div>
        </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {loads.map((load) => (
          <LoadItem
            key={load.id}
            load={load}
            isLoggedIn={isLoggedIn}
            onPromptLogin={onPromptLogin}
            onRemoveLoad={onRemoveLoad}
            onEditLoad={onEditLoad}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadBoard;
