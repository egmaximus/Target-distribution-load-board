
import * as React from 'react';
import type { Load } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TruckIcon } from './icons/TruckIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

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
  if (!address) return null;
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

const LoadItem: React.FC<LoadItemProps> = ({ load: rawLoad, isLoggedIn, isAdmin, onPromptLogin, onRemoveLoad, onEditLoad }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [bidAmount, setBidAmount] = React.useState('');
  const [carrierName, setCarrierName] = React.useState('');
  const [daysInTransit, setDaysInTransit] = React.useState('');
  const [error, setError] = React.useState('');
  const [distance, setDistance] = React.useState<number | 'loading' | 'error' | null>(null);

  // Destructure with default values to prevent crashes from malformed load objects.
  const { 
    id,
    itemDescription = 'N/A',
    referenceNumber,
    origin = 'N/A',
    destinations = [],
    pickupDate = '',
    deliveryDate = '',
    palletCount = 0,
    weight = 0,
    equipmentType = 'N/A',
    details = '',
    bids = [],
    appointmentDate,
    appointmentTime,
    appointmentNumber
  } = rawLoad || {};


  React.useEffect(() => {
    // Only calculate distance if the panel is expanded and we haven't calculated it before.
    if (isExpanded && distance === null) {
      setDistance('loading');
      
      const getDistance = async () => {
        try {
          // Simulate a network request to make the loading state visible
          await new Promise(resolve => setTimeout(resolve, 300));

          const originCoords = await mockGeocode(origin);
          const destCoordsPromises = destinations.map(d => mockGeocode(d));
          const destCoords = (await Promise.all(destCoordsPromises)).filter(c => c !== null) as { lat: number; lon: number }[];
          
          if (originCoords && destCoords.length > 0) {
            let totalDistance = 0;
            let lastCoords = originCoords;
            for (const coord of destCoords) {
                totalDistance += calculateDistance(lastCoords, coord);
                lastCoords = coord;
            }
            setDistance(totalDistance);
          } else {
            setDistance('error');
          }
        } catch (e) {
          console.error("Distance calculation failed", e);
          setDistance('error');
        }
      };

      getDistance();
    }
  }, [isExpanded, origin, destinations, distance]);


  const sortedBids = [...bids].sort((a, b) => a.amount - b.amount);
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
    const subject = `Bid for Load #${referenceNumber || id}: ${formatLocation(origin)} to ${formatLocation(destinations[0] || '')}${destinations.length > 1 ? ' (+ multi-stop)' : ''}`;
    const destinationsText = destinations.map((d, i) => `Destination ${i + 1}: ${d}`).join('\n');
   
    const body = `We can move this shipment for Bid Amount: ${formatCurrency(amount, false)}
Days In Transit: ${transitDays}

Reference #: ${referenceNumber || 'N/A'}
Origin: ${origin}
${destinationsText}
Pickup Date: ${formatDate(pickupDate)}
Delivery Date: ${formatDate(deliveryDate)}
Equipment: ${equipmentType}
Pallet Count: ${palletCount}
Weight: ${weight.toLocaleString()} lbs
Details: ${details}

Thank you,
${carrierName.trim()}
`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
   
    window.location.href = mailtoLink;

    setBidAmount('');
    setCarrierName('');
    setDaysInTransit('');
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

  if (!id) return null; // Don't render if the load is invalid

  return (
    <div className="md:border-b-0">
        {/* Main Row */}
        <div
            className="grid grid-cols-12 gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 items-center"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Hide Details' : 'Show Details'}
        >
            <div className="col-span-12 md:col-span-4 flex flex-col space-y-2">
                 <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-100">
                    <LocationMarkerIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="font-semibold">{formatLocation(origin)}</span>
                    <span className="text-gray-400 dark:text-gray-500 font-light mx-2">&rarr;</span>
                    <span className="font-semibold">
                        {formatLocation(destinations[0] || '')}
                        {destinations.length > 1 && (
                            <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                                (+{destinations.length - 1})
                            </span>
                        )}
                    </span>
                 </div>
                 <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">Pickup: {formatDate(pickupDate)}</div>
            </div>

            <div className="hidden md:flex md:col-span-2 items-center text-gray-700 dark:text-gray-300">
                {formatDate(pickupDate)}
            </div>

            <div className="hidden md:flex md:col-span-2 items-center text-gray-700 dark:text-gray-300 space-x-2">
                <TruckIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span>{equipmentType}</span>
            </div>

            <div className="col-span-6 md:col-span-2 flex flex-col items-end">
                {formatCurrency(lowestBid)}
                {bids.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bids.length} bids</span>
                )}
            </div>
             <div className="col-span-6 md:col-span-2 flex justify-center items-center">
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
                        {isLoggedIn && isAdmin && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditLoad(rawLoad);
                                    }}
                                    className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/80 transition-colors"
                                    aria-label={`Edit load ${referenceNumber || id}`}
                                >
                                    Edit Load
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to remove this load?')) {
                                            onRemoveLoad(id);
                                        }
                                    }}
                                    className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 transition-colors"
                                    aria-label={`Remove load ${referenceNumber || id}`}
                                >
                                    Remove Load
                                </button>
                            </div>
                        )}
                    </div>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong className="dark:text-gray-100">Item:</strong> {itemDescription}</li>
                        {referenceNumber && <li><strong className="dark:text-gray-100">Reference #:</strong> {referenceNumber}</li>}
                        <li><strong className="dark:text-gray-100">Origin:</strong> {origin}</li>
                        <li>
                            <strong className="dark:text-gray-100">Destinations:</strong>
                            <ul className="list-disc list-inside pl-4">
                                {destinations.map((dest, index) => (
                                    <li key={index}>{dest}</li>
                                ))}
                            </ul>
                        </li>
                        <li><strong className="dark:text-gray-100">Weight:</strong> {weight.toLocaleString()} lbs</li>
                        <li><strong className="dark:text-gray-100">Pallet Count:</strong> {palletCount.toLocaleString()}</li>
                        <li><strong className="dark:text-gray-100">Delivery Date:</strong> {formatDate(deliveryDate)}</li>
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
                        {appointmentDate && (
                            <li><strong className="dark:text-gray-100">Appointment:</strong> {formatDate(appointmentDate)}
                                {appointmentTime && ` at ${formatTime(appointmentTime)}`}
                            </li>
                        )}
                        {appointmentNumber && (
                             <li><strong className="dark:text-gray-100">Appointment Number:</strong> {appointmentNumber}</li>
                        )}
                        <li className="pt-2">
                            <p className="text-sm italic text-gray-600 dark:text-gray-400">{details}</p>
                        </li>
                    </ul>
                </div>

                <div className="md:col-span-4 mb-6 md:mb-0">
                     <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Bid History ({bids.length})</h4>
                    {bids.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {sortedBids.map(bid => (
                                <div key={bid.id} className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded-md border dark:border-gray-600">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{bid.carrierName}</span>
                                    {formatCurrency(bid.amount)}
                                </div>
                            ))}
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