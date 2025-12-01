
export enum VehicleType {
  CAR = 'Car',
  BIKE = 'Bike',
  TRUCK = 'Truck'
}

export type UserRole = 'admin' | 'staff';

export interface Branch {
  id: string;
  name: string;
  capacity: number;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  branchId?: string; // If staff, they are tied to a branch
}

export interface ParkingRates {
  [VehicleType.CAR]: number;
  [VehicleType.BIKE]: number;
  [VehicleType.TRUCK]: number;
}

export interface Vehicle {
  id: string;
  branchId: string; // New field
  plateNumber: string;
  type: VehicleType;
  model: string; 
  color: string; 
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
  branchId: string; // New field
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
  items?: string[]; 
}

export type ActivityType = 'entry' | 'exit' | 'system';

export interface ActivityLog {
  id: string;
  branchId: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  vehiclePlate?: string;
}

export type ViewState = 'dashboard' | 'entry' | 'map' | 'history' | 'assistant' | 'settings';
