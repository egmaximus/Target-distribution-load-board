import React, { useState, useEffect } from 'react';
import type { Load } from '../types';
import { XIcon } from './icons/XIcon';
import { PREDEFINED_DESTINATIONS } from '../delivery-locations';
import { PUBLICATION_NAMES } from './publication-names';

interface LoadBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostLoad: (newLoadData: Omit<Load, 'id' | 'bids'>) => void;
  onUpdateLoad: (updatedLoad: Load) => void;
  loadToEdit?: Load | null;
}

const PREDEFINED_ORIGINS = {
  '3487 South Preston Highway, Lebanon Junction, KY 40150': 'LSC Lebanon Junction, KY',
  '8420 Resource Rd, West Palm Beach, FL 33404': 'Target Distribution Warehouse'
};

const LoadBuilderModal: React.FC<LoadBuilderModalProps> = ({ isOpen, onClose, onPostLoad, onUpdateLoad, loadToEdit }) => {
  const isEditMode = !!loadToEdit;

  const initialFormState = {
    itemDescription: '',
    referenceNumber: 'TR-',
    originCity: '',
    originState: '',
    pickupDate: '',
    deliveryDate: '',
    palletCount: '',
    weight: '',
    equipmentType: '53ft Dry Van',
    details: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentNumber: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [originSelection, setOriginSelection] = useState('');
  const [destinations, setDestinations] = useState([{ selection: '', city: '', state: '' }]);


  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && loadToEdit) {
      const originInPredefined = Object.keys(PREDEFINED_ORIGINS).includes(loadToEdit.origin);
      
      setOriginSelection(originInPredefined ? loadToEdit.origin : 'Other');

      const [originCity, originState] = !originInPredefined && loadToEdit.origin.includes(',') ? loadToEdit.origin.split(', ').map(s => s.trim()) : [!originInPredefined ? loadToEdit.origin : '', ''];

      const loadedDestinations = loadToEdit.destinations.map(d => {
        const isInPredefined = Object.keys(PREDEFINED_DESTINATIONS).includes(d);
        const [city, state = ''] = !isInPredefined && d.includes(',') ? d.split(', ').map(s => s.trim()) : [!isInPredefined ? d : '', ''];
        return {
            selection: isInPredefined ? d : 'Other',
            city,
            state
        }
      });
      setDestinations(loadedDestinations);

      setFormData({
        itemDescription: loadToEdit.itemDescription,
        referenceNumber: loadToEdit.referenceNumber || 'TR-',
        originCity,
        originState,
        pickupDate: loadToEdit.pickupDate,
        deliveryDate: loadToEdit.deliveryDate,
        palletCount: String(loadToEdit.palletCount),
        weight: String(loadToEdit.weight),
        equipmentType: loadToEdit.equipmentType,
        details: loadToEdit.details,
        appointmentDate: loadToEdit.appointmentDate || '',
        appointmentTime: loadToEdit.appointmentTime || '',
        appointmentNumber: loadToEdit.appointmentNumber || ''
      });
    } else {
      setFormData(initialFormState);
      setOriginSelection('');
      setDestinations([{ selection: '', city: '', state: '' }]);
    }
  }, [isOpen, loadToEdit, isEditMode]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "originSelection") {
        setOriginSelection(value);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDestinationChange = (index: number, field: 'selection' | 'city' | 'state', value: string) => {
      const newDestinations = [...destinations];
      newDestinations[index] = { ...newDestinations[index], [field]: value };
      setDestinations(newDestinations);
  };

  const addDestination = () => {
      if (destinations.length < 3) {
          setDestinations([...destinations, { selection: '', city: '', state: ''}]);
      }
  };

  const removeDestination = (index: number) => {
      if (destinations.length > 1) {
          setDestinations(destinations.filter((_, i) => i !== index));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
    const originValue = originSelection === 'Other'
        ? `${formData.originCity}, ${formData.originState}`
        : originSelection;
       
    const destinationsValue = destinations.map(dest => {
        return dest.selection === 'Other' ? `${dest.city}, ${dest.state}` : dest.selection
    }).filter(d => d && d.trim() !== ',');

    if (destinationsValue.length === 0) {
        // Basic validation: ensure at least one destination is fully entered.
        alert("Please enter at least one valid destination.");
        return;
    }

    const commonLoadData = {
      itemDescription: formData.itemDescription,
      referenceNumber: formData.referenceNumber || undefined,
      origin: originValue,
      destinations: destinationsValue,
      pickupDate: formData.pickupDate,
      deliveryDate: formData.deliveryDate,
      palletCount: parseInt(formData.palletCount, 10),
      weight: parseInt(formData.weight, 10),
      equipmentType: formData.equipmentType,
      details: formData.details,
      appointmentDate: formData.appointmentDate || undefined,
      appointmentTime: formData.appointmentTime || undefined,
      appointmentNumber: formData.appointmentNumber || undefined
    };

    if (isEditMode && loadToEdit) {
        onUpdateLoad({
            ...loadToEdit, // Keep id and bids
            ...commonLoadData,
        });
    } else {
        onPostLoad(commonLoadData);
    }
  };

  if (!isOpen) return null;

  const inputStyles = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{isEditMode ? 'Edit Freight Load' : 'Post a New Freight Load'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" title="Close">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
       
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Description */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600 pb-2 w-full">Item Description</legend>
            <div>
              <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Publication</label>
              <select
                name="itemDescription"
                id="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                className={inputStyles}
                required
              >
                <option value="" disabled>Select a publication...</option>
                {PUBLICATION_NAMES.map((desc) => (
                    <option key={desc} value={desc}>{desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className={inputStyles}
                placeholder="e.g., TR-12345"
              />
            </div>
          </fieldset>

          {/* Route Information */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600 pb-2 w-full">Route Information</legend>
           
            <div>
                <label htmlFor="originSelection" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origin</label>
                 <select
                    name="originSelection"
                    id="originSelection"
                    value={originSelection}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                >
                    <option value="" disabled>Select a warehouse...</option>
                    {Object.entries(PREDEFINED_ORIGINS).map(([fullAddress, displayName]) => (
                        <option key={fullAddress} value={fullAddress}>{displayName}</option>
                    ))}
                    <option value="Other">Other (Manual Entry)</option>
                </select>
            </div>

            {originSelection === 'Other' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-red-200 dark:border-red-500/50">
                    <div>
                        <label htmlFor="originCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origin City</label>
                        <input type="text" name="originCity" id="originCity" value={formData.originCity} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label htmlFor="originState" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origin State</label>
                        <input type="text" name="originState" id="originState" placeholder="e.g., NY" value={formData.originState} onChange={handleChange} className={inputStyles} required />
                    </div>
                </div>
            )}
           
            {destinations.map((dest, index) => (
                <div key={index} className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative">
                    <div className="flex justify-between items-center">
                        <label htmlFor={`destinationSelection-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           Destination {index + 1}
                        </label>
                        {destinations.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeDestination(index)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold"
                                aria-label={`Remove destination ${index + 1}`}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    <select
                        name={`destinationSelection-${index}`}
                        id={`destinationSelection-${index}`}
                        value={dest.selection}
                        onChange={(e) => handleDestinationChange(index, 'selection', e.target.value)}
                        className={inputStyles}
                        required
                    >
                        <option value="" disabled>Select a destination...</option>
                        {Object.entries(PREDEFINED_DESTINATIONS)
                          .sort(([, a], [, b]) => a.localeCompare(b))
                          .map(([fullAddress, displayName]) => (
                            <option key={fullAddress} value={fullAddress}>{displayName}</option>
                        ))}
                        <option value="Other">Other (Manual Entry)</option>
                    </select>

                    {dest.selection === 'Other' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-red-200 dark:border-red-500/50">
                        <div>
                          <label htmlFor={`destinationCity-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination City</label>
                          <input type="text" name={`destinationCity-${index}`} id={`destinationCity-${index}`} value={dest.city} onChange={(e) => handleDestinationChange(index, 'city', e.target.value)} className={inputStyles} required />
                        </div>
                        <div>
                          <label htmlFor={`destinationState-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination State</label>
                          <input type="text" name={`destinationState-${index}`} id={`destinationState-${index}`} placeholder="e.g., CA" value={dest.state} onChange={(e) => handleDestinationChange(index, 'state', e.target.value)} className={inputStyles} required />
                        </div>
                      </div>
                    )}
                </div>
            ))}
             {destinations.length < 3 && (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={addDestination}
                        className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                    >
                        + Add Destination
                    </button>
                </div>
            )}
          </fieldset>

          {/* Schedule */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600 pb-2 w-full">Schedule</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Date</label>
                <input type="date" name="pickupDate" id="pickupDate" value={formData.pickupDate} onChange={handleChange} className={inputStyles} required />
              </div>
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Final Delivery Date</label>
                <input type="date" name="deliveryDate" id="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className={inputStyles} required />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Final Appt. Date</label>
                <input type="date" name="appointmentDate" id="appointmentDate" value={formData.appointmentDate} onChange={handleChange} className={inputStyles} />
              </div>
              <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Final Appt. Time</label>
                <input type="time" name="appointmentTime" id="appointmentTime" value={formData.appointmentTime} onChange={handleChange} className={inputStyles} />
              </div>
            </div>
            <div>
              <label htmlFor="appointmentNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Final Appt. Number</label>
              <input
                type="text"
                name="appointmentNumber"
                id="appointmentNumber"
                value={formData.appointmentNumber}
                onChange={handleChange}
                className={inputStyles}
                placeholder="e.g., C12345"
              />
            </div>
          </fieldset>
         
          {/* Shipment Specs */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600 pb-2 w-full">Shipment Specs</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="palletCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pallet Count</label>
                <input type="number" name="palletCount" id="palletCount" placeholder="e.g., 26" value={formData.palletCount} onChange={handleChange} className={inputStyles} required />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (lbs)</label>
                <input type="number" name="weight" id="weight" placeholder="e.g., 40000" value={formData.weight} onChange={handleChange} className={inputStyles} required />
              </div>
            </div>
            <div>
              <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Equipment Type</label>
              <select name="equipmentType" id="equipmentType" value={formData.equipmentType} onChange={handleChange} className={inputStyles} required>
                  <option>53ft Dry Van</option>
                  <option>26ft Box Truck</option>
                  <option>Full Truck Dedicated</option>
                  <option>Sprinter Van</option>
                  <option>Flatbed</option>
                  <option>LTL</option>
              </select>
            </div>
          </fieldset>
         
          {/* Additional Details */}
          <fieldset>
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600 pb-2 w-full">Additional Details</legend>
            <div className="mt-4">
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Comments</label>
              <textarea name="details" id="details" rows={3} value={formData.details} onChange={handleChange} className={inputStyles} placeholder="e.g., Pickup by 5 PM. Team drivers preferred." required></textarea>
            </div>
          </fieldset>

          <div className="flex justify-end pt-4">
            <button type="submit" className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150">
              {isEditMode ? 'Save Changes' : 'Post Load'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoadBuilderModal;
