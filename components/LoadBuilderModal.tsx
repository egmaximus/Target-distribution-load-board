
import * as React from 'react';
import { useState, useEffect } from 'react';
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

type DestinationForm = {
  selection: string;
  city: string;
  state: string;
  referenceNumber: string;
};

const LoadBuilderModal: React.FC<LoadBuilderModalProps> = ({ isOpen, onClose, onPostLoad, onUpdateLoad, loadToEdit }) => {
  const isEditMode = !!loadToEdit;

  const initialFormState = {
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
  const [itemDescriptions, setItemDescriptions] = useState<string[]>(['']);
  const [originSelection, setOriginSelection] = useState('');
  const [destinations, setDestinations] = useState<DestinationForm[]>([{ selection: '', city: '', state: '', referenceNumber: '' }]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && loadToEdit) {
      const originInPredefined = Object.keys(PREDEFINED_ORIGINS).includes(loadToEdit.origin);
      setOriginSelection(originInPredefined ? loadToEdit.origin : 'Other');
      
      setItemDescriptions(loadToEdit.itemDescriptions.length > 0 ? [...loadToEdit.itemDescriptions] : ['']);
      
      const dests: DestinationForm[] = loadToEdit.destinations.map((d, i) => {
        const inPredefined = Object.keys(PREDEFINED_DESTINATIONS).includes(d);
        const [city, state] = !inPredefined && d.includes(',') ? d.split(', ') : [!inPredefined ? d : '', ''];
        const ref = loadToEdit.destinationRefs?.[i] || '';
        return {
          selection: inPredefined ? d : 'Other',
          city: city,
          state: state || '',
          referenceNumber: ref,
        };
      });
      setDestinations(dests.length ? dests : [{ selection: '', city: '', state: '', referenceNumber: '' }]);

      const [originCity, originState] = !originInPredefined && loadToEdit.origin.includes(',') ? loadToEdit.origin.split(', ') : [!originInPredefined ? loadToEdit.origin : '', ''];

      setFormData({
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
      setItemDescriptions(['']);
      setOriginSelection('');
      setDestinations([{ selection: '', city: '', state: '', referenceNumber: '' }]);
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
  
  const handleItemDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...itemDescriptions];
    newDescriptions[index] = value;
    setItemDescriptions(newDescriptions);
  };

  const handleAddItemDescription = () => {
    if (itemDescriptions.length < 6) {
      setItemDescriptions([...itemDescriptions, '']);
    }
  };

  const handleRemoveItemDescription = (index: number) => {
    if (itemDescriptions.length > 1) {
      setItemDescriptions(itemDescriptions.filter((_, i) => i !== index));
    }
  };


  const handleDestinationChange = (index: number, field: keyof DestinationForm, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index][field] = value;
    setDestinations(newDestinations);
  };

  const handleAddDestination = () => {
    if (destinations.length < 3) {
      setDestinations([...destinations, { selection: '', city: '', state: '', referenceNumber: '' }]);
    }
  };

  const handleRemoveDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
    const originValue = originSelection === 'Other'
        ? `${formData.originCity}, ${formData.originState}`
        : originSelection;
       
    const destinationValues = destinations.map(dest => 
        dest.selection === 'Other' 
            ? `${dest.city}, ${dest.state}` 
            : dest.selection
    ).filter(d => d.trim() && d.trim() !== ',');
    
    const destinationRefs = destinations.map(dest => dest.referenceNumber);

    const validDescriptions = itemDescriptions.filter(d => d.trim() !== '');

    if (validDescriptions.length === 0) {
      alert('Please select at least one publication.');
      return;
    }

    if (!originValue.trim() || originValue.trim() === ',') {
      alert('Please provide a valid origin.');
      return;
    }

    if (destinationValues.length === 0) {
      alert('Please provide at least one valid destination.');
      return;
    }

    const commonLoadData = {
      itemDescriptions: validDescriptions,
      referenceNumber: formData.referenceNumber || undefined,
      origin: originValue,
      destinations: destinationValues,
      destinationRefs: destinationRefs,
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
            
            <div className="space-y-4">
              {itemDescriptions.map((desc, index) => (
                <div key={index} className="space-y-2 p-4 border dark:border-gray-700 rounded-lg relative">
                  <div className="flex justify-between items-center">
                    <label htmlFor={`itemDescription-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Publication {index + 1}
                    </label>
                    {itemDescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemDescription(index)}
                        className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <select
                    name={`itemDescription-${index}`}
                    id={`itemDescription-${index}`}
                    value={desc}
                    onChange={(e) => handleItemDescriptionChange(index, e.target.value)}
                    className={inputStyles}
                    required
                  >
                    <option value="" disabled>Select a publication...</option>
                    {PUBLICATION_NAMES.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              ))}
              {itemDescriptions.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddItemDescription}
                  className="w-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-semibold py-2 px-4 rounded-md hover:bg-green-200 dark:hover:bg-green-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                >
                  + Add Publication
                </button>
              )}
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
              <div key={index} className="space-y-4 p-4 border dark:border-gray-700 rounded-lg relative">
                 <div className="flex justify-between items-center">
                    <label htmlFor={`destinationSelection-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Destination {index + 1}
                    </label>
                    {destinations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(index)}
                        className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                 </div>
                
                {/* NEW Reference Number Field */}
                <div>
                    <label htmlFor={`destinationRef-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Destination Reference #
                    </label>
                    <input
                        type="text"
                        name={`destinationRef-${index}`}
                        id={`destinationRef-${index}`}
                        value={dest.referenceNumber}
                        onChange={(e) => handleDestinationChange(index, 'referenceNumber', e.target.value)}
                        className={inputStyles}
                        placeholder="e.g., PO-998877"
                    />
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
              <button
                type="button"
                onClick={handleAddDestination}
                className="w-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-semibold py-2 px-4 rounded-md hover:bg-green-200 dark:hover:bg-green-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
              >
                + Add Destination
              </button>
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
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Date</label>
                <input type="date" name="deliveryDate" id="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className={inputStyles} required />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Date</label>
                <input type="date" name="appointmentDate" id="appointmentDate" value={formData.appointmentDate} onChange={handleChange} className={inputStyles} />
              </div>
              <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Time</label>
                <input type="time" name="appointmentTime" id="appointmentTime" value={formData.appointmentTime} onChange={handleChange} className={inputStyles} />
              </div>
            </div>
            <div>
              <label htmlFor="appointmentNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Number</label>
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
