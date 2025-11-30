
export enum VehicleType {
  CAR = 'Car',
  BIKE = 'Bike',
  TRUCK = 'Truck'
}

export interface ParkingRates {
  [VehicleType.CAR]: number;
  [VehicleType.BIKE]: number;
  [VehicleType.TRUCK]: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string; // e.g. Toyota Camry
  color: string; // e.g. Silver
  entryTime: Date;
  slotId: number;
  contactNumber?: string;
  notes?: string;
}

export interface ParkingSlot {
  id: number;
  isOccupied: boolean;
  vehicleId: string | null;
  type: 'standard' | 'priority';
}

export interface Transaction {
  id: string;
  vehicleId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  entryTime: Date;
  exitTime: Date;
  durationMinutes: number;
  baseAmount: number;
  extraAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'paid';
  items?: string[]; // e.g., "Car Wash", "Lost Ticket"
}

export type ActivityType = 'entry' | 'exit' | 'system';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  vehiclePlate?: string;
}

export type ViewState = 'dashboard' | 'entry' | 'map' | 'history' | 'assistant' | 'settings';
