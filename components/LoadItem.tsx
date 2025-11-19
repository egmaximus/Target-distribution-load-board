
import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Load, Bid } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TruckIcon } from './icons/TruckIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

// --- Distance Calculation Utilities ---

// A mock database of coordinates for known locations.
const MOCK_COORDINATES: { [key: string]: { lat: number; lon: number } } = {
  'new york, ny': { lat: 40.7128, lon: -74.0060 },
  'los angeles, ca': { lat: 34.0522, lon: -118.2437 },
  'chicago, il': { lat: 41.8781, lon: -87.6298 },
  'dallas, tx': { lat: 32.7767, lon: -96.7970 },
  'atlanta, ga': { lat: 33.7490, lon: -84.3880 },
  'miami, fl': { lat: 25.7617, lon: -80.1918 },
  'denver, co': { lat: 39.7392, lon: -104.9903 },
  'seattle, wa': { lat: 47.6062, lon: -122.3321 },
  'boston, ma': { lat: 42.3601, lon: -71.0589 },
  'philadelphia, pa': { lat: 39.9526, lon: -75.1652 },
  'richmond, va': { lat: 37.5407, lon: -77.4360 },
  'lebanon junction, ky': { lat: 37.8362, lon: -85.7225 },
  'west palm beach, fl': { lat: 26.7153, lon: -80.0534 },
};

/**
 * Simulates geocoding an address by looking up a known city/state in the MOCK_COORDINATES map.
 * @param address - The full address string.
 * @returns A promise that resolves to a coordinate object or null if not found.
 */
const mockGeocode = async (address: string): Promise<{ lat: number; lon: number } | null> => {
  const normalizedAddress = address.toLowerCase();
  for (const key in MOCK_COORDINATES) {
    if (normalizedAddress.includes(key)) {
      return MOCK_COORDINATES[key];
    }
  }
  return null;
};

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param coords1 - The first coordinate object { lat, lon }.
 * @param coords2 - The second coordinate object { lat, lon }.
 * @returns The distance in miles.
 */
const calculateDistance = (coords1: { lat: number; lon: number }, coords2: { lat: number; lon: number }): number => {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
  const dLon = (coords2.lon - coords1.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1.lat * (Math.PI / 180)) * Math.cos(coords2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


interface LoadItemProps {
  load: Load;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onPromptLogin: () => void;
  onRemoveLoad: (loadId: string) => void;
  onEditLoad: (load: Load) => void;
}

const LoadItem: React.FC<LoadItemProps> = ({ load, isLoggedIn, isAdmin, onPromptLogin, onRemoveLoad, onEditLoad }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [daysInTransit, setDaysInTransit] = useState('');
  const [error, setError] = useState('');
  const [distance, setDistance] = useState<number | 'loading' | 'error' | null>(null);

  useEffect(() => {
    if (isExpanded && distance === null) {
      setDistance('loading');

      const getDistance = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const locations = [load.origin, ...load.destinations];
          const coordsPromises = locations.map(loc => mockGeocode(loc));
          const coords = await Promise.all(coordsPromises);

          if (coords.some(c => c === null)) {
            setDistance('error');
            return;
          }
          
          let totalDistance = 0;
          for (let i = 0; i < coords.length - 1; i++) {
            totalDistance += calculateDistance(coords[i]!, coords[i+1]!);
          }
          
          setDistance(totalDistance);
        } catch (e) {
          console.error("Distance calculation failed", e);
          setDistance('error');
        }
      };

      getDistance();
    }
  }, [isExpanded, load.origin, JSON.stringify(load.destinations)]);


  const sortedBids = [...load.bids].sort((a, b) => a.amount - b.amount);
  const lowestBid = sortedBids.length > 0 ? sortedBids[0].amount : null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Adding a time component to ensure UTC date is parsed correctly
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLocation = (location: string) => {
    if (!location) return '';
    // Check if it's a full street address by looking for numbers at the start
    if (/^\d/.test(location)) {
      const parts = location.split(',');
      if (parts.length >= 3) {
        // e.g., ["3487 South Preston Highway", " Lebanon Junction", " KY 40150"] -> "Lebanon Junction, KY"
        const stateZip = parts[2].trim().split(' ');
        return `${parts[1].trim()}, ${stateZip[0]}`;
      }
    }
    // Otherwise, assume it's "City, State" and return as is
    return location;
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    const transitDays = parseInt(daysInTransit, 10);
   
    if (!carrierName.trim()) {
        setError('Please enter your company name.');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }
    if (isNaN(transitDays) || transitDays <= 0) {
      setError('Please enter a valid number of transit days.');
      return;
    }
    setError('');

    const recipient = 'OMorales@targetdistribution.com';
    const subject = `Bid for Load #${load.referenceNumber || load.id}: ${formatLocation(load.origin)} to ${formatLocation(load.destinations[0])}`;
    
    const destinationsText = load.destinations.length > 1
      ? `Destinations:\n${load.destinations.map((d, i) => `- ${d}${load.destinationRefs?.[i] ? ` (Ref: ${load.destinationRefs[i]})` : ''}`).join('\n')}`
      : `Destination: ${load.destinations[0]}${load.destinationRefs?.[0] ? ` (Ref: ${load.destinationRefs[0]})` : ''}`;
      
    const itemsText = load.itemDescriptions.length > 1
      ? `Items:\n${load.itemDescriptions.map(d => `- ${d}`).join('\n')}`
      : `Item: ${load.itemDescriptions[0]}`;

    const body = `We can move this shipment for Bid Amount: ${formatCurrency(amount, false)}
Days In Transit: ${transitDays}

Reference #: ${load.referenceNumber || 'N/A'}
${itemsText}
Origin: ${load.origin}
${destinationsText}
Pickup Date: ${formatDate(load.pickupDate)}
Delivery Date: ${formatDate(load.deliveryDate)}
Equipment: ${load.equipmentType}
Pallet Count: ${load.palletCount}
Weight: ${load.weight.toLocaleString()} lbs
Notes: ${load.details}

Thank you,
${carrierName.trim()}
`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
   
    window.location.href = mailtoLink;

    setBidAmount('');
    setCarrierName('');
    setDaysInTransit('');
  };

  const handleSelectWinner = (bid: Bid) => {
    if (!isAdmin) return;

    const carrierEmail = bid.carrierEmail || '';
    const subject = `Rate Confirmation: Load #${load.referenceNumber || load.id} Awarded`;
    
    const itemsText = load.itemDescriptions.length > 1
      ? `Items:\n${load.itemDescriptions.map(d => `- ${d}`).join('\n')}`
      : `Item: ${load.itemDescriptions[0]}`;
      
    const destinationsText = load.destinations.length > 1
      ? `Destinations:\n${load.destinations.map((d, i) => `- ${d}${load.destinationRefs?.[i] ? ` (Ref: ${load.destinationRefs[i]})` : ''}`).join('\n')}`
      : `Destination: ${load.destinations[0]}${load.destinationRefs?.[0] ? ` (Ref: ${load.destinationRefs[0]})` : ''}`;

    const body = `Dear ${bid.carrierName},

Congratulations! We are pleased to inform you that you have been awarded the freight load #${load.referenceNumber || load.id} at your bid rate of ${formatCurrency(bid.amount, false)}.

Please review the load details below:

Reference #: ${load.referenceNumber || 'N/A'}
--------------------------------------------------
${itemsText}

Origin: ${load.origin}
${destinationsText}

Pickup Date: ${formatDate(load.pickupDate)}
Delivery Date: ${formatDate(load.deliveryDate)}

Equipment: ${load.equipmentType}
Pallet Count: ${load.palletCount}
Weight: ${load.weight.toLocaleString()} lbs
Notes: ${load.details}
--------------------------------------------------

Please reply to this email to confirm receipt and provide your driver's information to finalize the rate confirmation.

We look forward to working with you.

Best regards,

Target Distribution`;

    window.location.href = `mailto:${carrierEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 === 0 ? 12 : h % 12;
    const formattedMinutes = m < 10 ? `0${m}` : m;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const formatCurrency = (amount: number | null, isDisplay = true): React.ReactNode | string => {
    if (amount === null) {
        return isDisplay ? <span className="text-gray-500 dark:text-gray-400 font-semibold">No Bids</span> : 'No Bids';
    }
    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
   
    if (!isDisplay) {
        return formattedAmount;
    }

    const blurClasses = !isLoggedIn ? 'filter blur-sm transition-all cursor-pointer' : '';
    const handleClick = !isLoggedIn ? onPromptLogin : undefined;

    const isLowest = amount === lowestBid;

    if (isLowest) {
      return (
        <span
          onClick={handleClick}
          className={`px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 font-bold text-lg ${blurClasses}`}
        >
            {formattedAmount}
        </span>
      );
    }
    return (
        <span onClick={handleClick} className={`font-semibold text-gray-700 dark:text-gray-300 ${blurClasses}`}>
            {formattedAmount}
        </span>
    );
  };
  
  const finalDestination = load.destinations[load.destinations.length - 1];

  return (
    <div className="md:border-b-0">
        {/* Main Row */}
        <div
            className="grid grid-cols-12 gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 items-center"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Hide Details' : 'Show Details'}
        >
            {/* Reference Number */}
            <div className="col-span-12 md:col-span-2 flex items-center">
                <span className="md:hidden font-bold mr-2 text-gray-500 dark:text-gray-400">Ref:</span>
                <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={load.referenceNumber}>{load.referenceNumber || 'N/A'}</span>
            </div>

            {/* Origin / Destination */}
            <div className="col-span-12 md:col-span-3 flex flex-col space-y-2">
                 <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-100 flex-wrap">
                    <LocationMarkerIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="font-semibold">{formatLocation(load.origin)}</span>
                    <span className="text-gray-400 dark:text-gray-500 font-light mx-2">&rarr;</span>
                    <span className="font-semibold">{formatLocation(finalDestination)}</span>
                    {load.destinations.length > 1 && (
                      <span className="ml-2 mt-1 md:mt-0 text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">
                        +{load.destinations.length - 1} drop
                      </span>
                    )}
                 </div>
                 <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">Pickup: {formatDate(load.pickupDate)}</div>
            </div>

            {/* Pickup Date */}
            <div className="hidden md:flex md:col-span-2 items-center text-gray-700 dark:text-gray-300">
                {formatDate(load.pickupDate)}
            </div>

            {/* Equipment */}
            <div className="hidden md:flex md:col-span-2 items-center text-gray-700 dark:text-gray-300 space-x-2">
                <TruckIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="truncate" title={load.equipmentType}>{load.equipmentType}</span>
            </div>

            {/* Current Bid */}
            <div className="col-span-6 md:col-span-2 flex flex-col items-end">
                {formatCurrency(lowestBid)}
                {load.bids.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{load.bids.length} bids</span>
                )}
            </div>
             
             {/* Actions */}
             <div className="col-span-6 md:col-span-1 flex justify-center items-center">
                <span className="text-sm font-semibold text-red-600 md:hidden mr-4">Details</span>
                <ChevronDownIcon className={`h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 md:grid md:grid-cols-12 gap-8">
                <div className="md:col-span-5 mb-6 md:mb-0">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Load Details</h4>
                        {isAdmin && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditLoad(load);
                                    }}
                                    className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/80 transition-colors"
                                    aria-label={`Edit load ${load.referenceNumber || load.id}`}
                                >
                                    Edit Load
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to remove this load?')) {
                                            onRemoveLoad(load.id);
                                        }
                                    }}
                                    className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 transition-colors"
                                    aria-label={`Remove load ${load.referenceNumber || load.id}`}
                                >
                                    Remove Load
                                </button>
                            </div>
                        )}
                    </div>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        {load.itemDescriptions.length === 1 ? (
                          <li><strong className="dark:text-gray-100">Item:</strong> {load.itemDescriptions[0]}</li>
                        ) : (
                          <li>
                            <strong className="dark:text-gray-100">Items:</strong>
                            <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                              {load.itemDescriptions.map((desc, index) => <li key={index}>{desc}</li>)}
                            </ul>
                          </li>
                        )}
                        {load.referenceNumber && <li><strong className="dark:text-gray-100">Reference #:</strong> {load.referenceNumber}</li>}
                        <li><strong className="dark:text-gray-100">Origin:</strong> {load.origin}</li>
                        {load.destinations.length === 1 ? (
                          <li>
                              <strong className="dark:text-gray-100">Destination:</strong> {load.destinations[0]}
                              {load.destinationRefs && load.destinationRefs[0] && (
                                  <span className="text-gray-500 text-xs ml-2 font-mono">(Ref: {load.destinationRefs[0]})</span>
                              )}
                          </li>
                        ) : (
                          <li>
                            <strong className="dark:text-gray-100">Destinations:</strong>
                            <ol className="list-decimal list-inside pl-2 mt-1 space-y-1">
                              {load.destinations.map((dest, index) => (
                                  <li key={index}>
                                      {dest}
                                      {load.destinationRefs && load.destinationRefs[index] && (
                                          <span className="text-gray-500 text-xs ml-2 font-mono">(Ref: {load.destinationRefs[index]})</span>
                                      )}
                                  </li>
                              ))}
                            </ol>
                          </li>
                        )}
                        <li><strong className="dark:text-gray-100">Weight:</strong> {load.weight.toLocaleString()} lbs</li>
                        <li><strong className="dark:text-gray-100">Pallet Count:</strong> {load.palletCount.toLocaleString()}</li>
                        <li><strong className="dark:text-gray-100">Delivery Date:</strong> {formatDate(load.deliveryDate)}</li>
                        {/* Distance Calculation Display */}
                        {distance !== null && (
                          <li>
                            <strong className="dark:text-gray-100">Distance:</strong>
                            {' '}
                            {distance === 'loading' && <span className="italic text-gray-500 dark:text-gray-400">Calculating...</span>}
                            {typeof distance === 'number' && <span>~{Math.round(distance).toLocaleString()} miles</span>}
                            {distance === 'error' && <span className="italic text-gray-500 dark:text-gray-400">Not available</span>}
                          </li>
                        )}
                        {load.appointmentDate && (
                            <li><strong className="dark:text-gray-100">Appointment:</strong> {formatDate(load.appointmentDate)}
                                {load.appointmentTime && ` at ${formatTime(load.appointmentTime)}`}
                            </li>
                        )}
                        {load.appointmentNumber && (
                             <li><strong className="dark:text-gray-100">Appointment Number:</strong> {load.appointmentNumber}</li>
                        )}
                        <li className="pt-2">
                            <p className="text-sm italic text-gray-600 dark:text-gray-400">{load.details}</p>
                        </li>
                    </ul>
                </div>

                <div className="md:col-span-4 mb-6 md:mb-0">
                     <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                         Bid History ({load.bids.length})
                     </h4>
                    {load.bids.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {sortedBids.map((bid, index) => {
                                const isLowest = index === 0;
                                return (
                                    <div 
                                        key={bid.id} 
                                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg border ${isLowest ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                                    >
                                        <div className="flex flex-col mb-2 sm:mb-0">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{bid.carrierName}</span>
                                                {isAdmin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectWinner(bid);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                                                        title="Award Load (Email Carrier)"
                                                    >
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {isLowest && <span className="text-[10px] uppercase tracking-wide font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Lowest</span>}
                                            </div>
                                             <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(bid.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between w-full sm:w-auto space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-gray-800 dark:text-gray-100">{formatCurrency(bid.amount)}</span>
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectWinner(bid);
                                                    }}
                                                    className="text-xs bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded transition-colors shadow-sm whitespace-nowrap"
                                                >
                                                    Award Load
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No bids yet. Be the first!</p>
                    )}
                </div>

                <div className="md:col-span-3">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Place Your Bid</h4>
                    <form onSubmit={handleBidSubmit} className="flex flex-col space-y-3">
                        <input
                            type="text"
                            value={carrierName}
                            onChange={(e) => {
                                setCarrierName(e.target.value);
                                if(error) setError('');
                            }}
                            placeholder="Your Company Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500"
                            required
                        />
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">$</span>
                             <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => {
                                    setBidAmount(e.target.value);
                                    if(error) setError('');
                                }}
                                placeholder="Your Bid"
                                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500"
                                step="1"
                                min="0"
                                required
                            />
                        </div>
                        <input
                            type="number"
                            value={daysInTransit}
                            onChange={(e) => {
                                setDaysInTransit(e.target.value);
                                if(error) setError('');
                            }}
                            placeholder="Days In Transit"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500"
                            step="1"
                            min="0"
                            required
                        />
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150">
                            Submit Bid
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default LoadItem;
