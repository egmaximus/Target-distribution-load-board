export interface Bid {
  id: string;
  carrierName: string;
  amount: number;
  timestamp: string;
}

export interface Load {
  id: string;
  itemDescriptions: string[];
  referenceNumber?: string;
  origin: string;
  destinations: string[];
  pickupDate: string;
  deliveryDate: string;
  palletCount: number;
  weight: number;
  equipmentType: string;
  details: string;
  bids: Bid[];
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentNumber?: string;
}