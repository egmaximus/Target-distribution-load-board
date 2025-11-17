
import * as React from 'react';
import type { Load } from '../types';
import LoadItem from './LoadItem';

interface LoadBoardProps {
  loads: Load[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  onPromptLogin: () => void;
  onRemoveLoad: (loadId: string) => void;
  onEditLoad: (load: Load) => void;
}

const LoadBoard: React.FC<LoadBoardProps> = ({ loads, isLoggedIn, isAdmin, onPromptLogin, onRemoveLoad, onEditLoad }) => {
  const validLoads = Array.isArray(loads) ? loads.filter(load => load && typeof load === 'object' && load.id) : [];

  if (validLoads.length === 0) {
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
        {validLoads.map((load) => (
          <LoadItem
            key={load.id}
            load={load}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
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