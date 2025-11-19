import type { Load } from './types';

 

export const MOCK_LOADS: Load[] = [

  {

    id: 'load-1',

    itemDescriptions: ['Palm Beach Illustrated'],

    referenceNumber: 'TR-PBI-001',

    origin: 'New York, NY',

    destinations: ['Los Angeles, CA'],

    pickupDate: '2024-08-01',

    deliveryDate: '2024-08-07',

    palletCount: 26,

    weight: 40000,

    equipmentType: '53ft Dry Van',

    details: 'Full truckload of "Palm Beach Illustrated" magazines. Pickup by 5 PM.',

    bids: [

      { id: 'bid-101', carrierName: 'Cross Country Movers', amount: 4500, timestamp: '2024-07-20T10:00:00Z' },

      { id: 'bid-102', carrierName: 'Reliable Transport', amount: 4650, timestamp: '2024-07-20T11:30:00Z' },

    ],

  },

  {

    id: 'load-2',

    itemDescriptions: ['Tallahassee Magazine'],

    referenceNumber: 'TR-TMAG-005',

    origin: 'Chicago, IL',

    destinations: ['Dallas, TX'],

    pickupDate: '2024-08-03',

    deliveryDate: '2024-08-05',

    palletCount: 12,

    weight: 20000,

    equipmentType: '26ft Box Truck',

    details: 'Partial truckload of "Tallahassee Magazine". Requires liftgate service at delivery.',

    bids: [

        { id: 'bid-201', carrierName: 'Midwest Haulers', amount: 1200, timestamp: '2024-07-21T09:00:00Z' },

    ],

  },

  {

    id: 'load-3',

    itemDescriptions: ['Aventura'],

    referenceNumber: 'TR-AVM-002',

    origin: 'Atlanta, GA',

    destinations: ['Miami, FL'],

    pickupDate: '2024-08-02',

    deliveryDate: '2024-08-03',

    palletCount: 18,

    weight: 24000,

    equipmentType: '53ft Dry Van',

    details: 'Time-sensitive delivery of "Aventura" magazine for a launch event. Must deliver by 9 AM. Delivery appt. is sharp.',

    appointmentDate: '2024-08-03',

    appointmentTime: '08:30',

    appointmentNumber: 'MI-12345',

    bids: [

        { id: 'bid-301', carrierName: 'Sunshine Express', amount: 950, timestamp: '2024-07-22T14:00:00Z' },

        { id: 'bid-302', carrierName: 'Quick Route Logistics', amount: 925, timestamp: '2024-07-22T15:10:00Z' },

        { id: 'bid-303', carrierName: 'Florida Freight', amount: 940, timestamp: '2024-07-22T16:00:00Z' },

    ],

  },

  {

    id: 'load-4',

    itemDescriptions: ['Emerald Coast Magazine'],

    referenceNumber: 'TR-ECM-009',

    origin: 'Denver, CO',

    destinations: ['Seattle, WA'],

    pickupDate: '2024-08-05',

    deliveryDate: '2024-08-08',

    palletCount: 24,

    weight: 38000,

    equipmentType: 'Full Truck Dedicated',

    details: 'Full truckload of "Emerald Coast Magazine". Reefer not required, but trailer must be clean and dry.',

    bids: [],

  },

    {

    id: 'load-5',

    itemDescriptions: ['850 Business Magazine'],

    referenceNumber: 'TR-850B-001',

    origin: 'Boston, MA',

    destinations: ['Philadelphia, PA'],

    pickupDate: '2024-08-01',

    deliveryDate: '2024-08-01',

    palletCount: 8,

    weight: 12000,

    equipmentType: 'Sprinter Van',

    details: 'Expedited, same-day delivery of special edition "850 Business Magazine".',

    bids: [

        { id: 'bid-501', carrierName: 'East Coast Couriers', amount: 600, timestamp: '2024-07-23T08:00:00Z' },

    ],

  },

  {

    id: 'load-6',

    itemDescriptions: ['Naples Illustrated'],

    referenceNumber: 'TR-NPI-011',

    origin: 'Philadelphia, PA',

    destinations: ['Richmond, VA'],

    pickupDate: '2024-08-06',

    deliveryDate: '2024-08-07',

    palletCount: 4,

    weight: 5000,

    equipmentType: 'LTL',

    details: 'Small shipment of "Naples Illustrated" magazine. Delivery to a shared warehouse, check in at front desk.',

    bids: [],

  },

];