
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
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none dark:border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-200 dark:bg-gray-700/50 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            <div className="col-span-2">Reference #</div>
            <div className="col-span-3">Origin / Destination</div>
            <div className="col-span-2">Pickup Date</div>
            <div className="col-span-2">Equipment</div>
            <div className="col-span-2 text-right">Current Bid</div>
            <div className="col-span-1 text-center">Actions</div>
        </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {loads.map((load) => (
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
