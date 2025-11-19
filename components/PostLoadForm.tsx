import * as React from 'react';
import { useState } from 'react';

import type { Load } from '../types';

interface PostLoadFormProps {
  onPostLoad: (newLoadData: Omit<Load, 'id' | 'bids'>) => void;
  onClose: () => void;
}

const PostLoadForm: React.FC<PostLoadFormProps> = ({ onPostLoad, onClose }) => {
    // FIX: Renamed `quantity` to `palletCount` to align with the `Load` type definition.
    const [formData, setFormData] = useState({
        // FIX: Added `itemDescription` to the form state to satisfy the `Load` type.
        itemDescription: '',
        referenceNumber: 'TR-',
        originCity: '',
        originState: '',
        destinationCity: '',
        destinationState: '',
        pickupDate: '',
        deliveryDate: '',
        palletCount: '',
        weight: '',
        equipmentType: '53ft Dry Van',
        details: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
       
        // FIX: The `onPostLoad` function expects `origin` and `destination` to be strings.
        // The original code passed objects, causing a type mismatch. This combines
        // the city and state into a single string for each, resolving the error.
        const newLoadData = {
            itemDescriptions: [formData.itemDescription],
            referenceNumber: formData.referenceNumber || undefined,
            origin: `${formData.originCity}, ${formData.originState}`,
            destinations: [`${formData.destinationCity}, ${formData.destinationState}`],
            pickupDate: formData.pickupDate,
            deliveryDate: formData.deliveryDate,
            palletCount: parseInt(formData.palletCount, 10),
            weight: parseInt(formData.weight, 10),
            equipmentType: formData.equipmentType,
            details: formData.details
        };

        onPostLoad(newLoadData);
    };

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-20 p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Create a New Load</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* FIX: Added an input field for `itemDescription` to be collected from the user. */}
                <div>
                    <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700">Item Description</label>
                    <input type="text" name="itemDescription" id="itemDescription" value={formData.itemDescription} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="e.g., Modern Living Magazine" required />
                </div>
                 <div>
                    <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">Reference Number</label>
                    <input type="text" name="referenceNumber" id="referenceNumber" value={formData.referenceNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="e.g., TR-12345" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="originCity" className="block text-sm font-medium text-gray-700">Origin City</label>
                        <input type="text" name="originCity" id="originCity" value={formData.originCity} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="originState" className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" name="originState" id="originState" value={formData.originState} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="destinationCity" className="block text-sm font-medium text-gray-700">Destination City</label>
                        <input type="text" name="destinationCity" id="destinationCity" value={formData.destinationCity} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="destinationState" className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" name="destinationState" id="destinationState" value={formData.destinationState} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Pickup Date</label>
                        <input type="date" name="pickupDate" id="pickupDate" value={formData.pickupDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">Delivery Date</label>
                        <input type="date" name="deliveryDate" id="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="palletCount" className="block text-sm font-medium text-gray-700">Pallet Count</label>
                        <input type="number" name="palletCount" id="palletCount" placeholder="e.g., 26" value={formData.palletCount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
                        <input type="number" name="weight" id="weight" placeholder="e.g., 40000" value={formData.weight} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required />
                    </div>
                </div>
                 <div>
                    <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700">Equipment Type</label>
                    <select name="equipmentType" id="equipmentType" value={formData.equipmentType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" required>
                        <option>53ft Dry Van</option>
                        <option>26ft Box Truck</option>
                        <option>Full Truck Dedicated</option>
                        <option>Sprinter Van</option>
                        <option>Flatbed</option>
                        <option>LTL</option>
                    </select>
                </div>
                <div>
                     <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details</label>
                     <textarea name="details" id="details" rows={2} value={formData.details} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="e.g., Pickup by 5 PM." required></textarea>
                </div>
                <div className="flex justify-end pt-2">
                     <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150">
                        Submit Load
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostLoadForm;