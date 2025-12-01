
export enum VehicleType {
  CAR = 'Car',
  BIKE = 'Bike',
  TRUCK = 'Truck'
}

export type UserRole = 'admin' | 'staff';

export interface Zone {
  id: string;
  name: string;
  capacity: number;
  type: 'standard' | 'priority';
}

export interface Branch {
  id: string;
  name: string;
  capacity: number; // Derived from zones
  zones?: Zone[];
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  branchId?: string; // If staff, they are tied to a branch
  
  // Extended Profile
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  caption?: string; // Job title or short bio
}

export interface ParkingRates {
  [VehicleType.CAR]: number;
  [VehicleType.BIKE]: number;
  [VehicleType.TRUCK]: number;
}

export interface Vehicle {
  id: string;
  branchId: string;
  plateNumber: string;
  type: VehicleType;
  model: string; 
  color: string; 
  entryTime: Date;
  slotId: number;
  contactNumber?: string;
  notes?: string;
  requestedServices?: string[];
}

export interface ParkingSlot {
  id: number;
  isOccupied: boolean;
  vehicleId: string | null;
  type: 'standard' | 'priority';
  zoneId?: string;
  zoneName?: string;
}

export interface Transaction {
  id: string;
  branchId: string;
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
