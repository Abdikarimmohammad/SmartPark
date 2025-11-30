
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, ParkingSlot, Transaction, VehicleType, ActivityLog, ActivityType, ParkingRates } from './types';
import { INITIAL_SLOTS, HOURLY_RATE as DEFAULT_RATES } from './constants';

interface ParkingContextType {
  slots: ParkingSlot[];
  activeVehicles: Vehicle[];
  transactions: Transaction[];
  recentLogs: ActivityLog[];
  rates: ParkingRates;
  updateRates: (newRates: ParkingRates) => void;
  registerVehicle: (data: { plate: string; type: VehicleType; model: string; color: string; contact: string; notes?: string }, slotId?: number) => Vehicle | null;
  checkoutVehicle: (vehicleId: string, extras?: { amount: number; items: string[] }, discount?: number) => Transaction;
  getSlotStatus: (slotId: number) => ParkingSlot | undefined;
  resetSystem: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>(INITIAL_SLOTS);
  const [activeVehicles, setActiveVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [rates, setRates] = useState<ParkingRates>(DEFAULT_RATES);

  const addLog = (message: string, type: ActivityType, plate?: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date(),
      vehiclePlate: plate
    };
    setRecentLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Seed some data on mount
  useEffect(() => {
    if (activeVehicles.length === 0 && transactions.length === 0) {
      const demoVehicles: Vehicle[] = [
        { id: 'v1', plateNumber: 'ABC-1234', type: VehicleType.CAR, model: 'Toyota Camry', color: 'Silver', entryTime: new Date(Date.now() - 3600000), slotId: 1 },
        { id: 'v2', plateNumber: 'XYZ-9876', type: VehicleType.BIKE, model: 'Honda CBR', color: 'Red', entryTime: new Date(Date.now() - 7200000), slotId: 7 },
      ];
      
      const newSlots = [...INITIAL_SLOTS];
      demoVehicles.forEach(v => {
        newSlots[v.slotId - 1] = { ...newSlots[v.slotId - 1], isOccupied: true, vehicleId: v.id };
      });

      setActiveVehicles(demoVehicles);
      setSlots(newSlots);
      
      // Mock logs
      setRecentLogs([
          { id: 'l1', type: 'entry', message: 'Vehicle ABC-1234 checked in', timestamp: new Date(Date.now() - 3600000), vehiclePlate: 'ABC-1234' },
          { id: 'l2', type: 'entry', message: 'Vehicle XYZ-9876 checked in', timestamp: new Date(Date.now() - 7200000), vehiclePlate: 'XYZ-9876' },
      ]);
    }
  }, []);

  const updateRates = (newRates: ParkingRates) => {
      setRates(newRates);
      addLog('Parking rates updated by admin', 'system');
  };

  const registerVehicle = (data: { plate: string; type: VehicleType; model: string; color: string; contact: string; notes?: string }, slotId?: number): Vehicle | null => {
    // Check for duplicate plate
    if (activeVehicles.some(v => v.plateNumber === data.plate.toUpperCase())) {
        return null;
    }

    let targetSlot: ParkingSlot | undefined;

    if (slotId) {
        targetSlot = slots.find(s => s.id === slotId && !s.isOccupied);
    } else {
        targetSlot = slots.find(s => !s.isOccupied);
    }

    if (!targetSlot) return null;

    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      plateNumber: data.plate.toUpperCase(),
      type: data.type,
      model: data.model || 'Unknown',
      color: data.color || 'Unknown',
      entryTime: new Date(),
      slotId: targetSlot.id,
      contactNumber: data.contact,
      notes: data.notes
    };

    const updatedSlots = slots.map(s => 
      s.id === targetSlot!.id ? { ...s, isOccupied: true, vehicleId: newVehicle.id } : s
    );

    setSlots(updatedSlots);
    setActiveVehicles(prev => [newVehicle, ...prev]);
    addLog(`Vehicle ${newVehicle.plateNumber} checked in at Slot ${targetSlot!.id}`, 'entry', newVehicle.plateNumber);
    
    return newVehicle;
  };

  const checkoutVehicle = (vehicleId: string, extras = { amount: 0, items: [] as string[] }, discount = 0): Transaction => {
    const vehicle = activeVehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const exitTime = new Date();
    const durationMs = exitTime.getTime() - vehicle.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / 60000);
    const hours = Math.ceil(durationMinutes / 60);
    
    // Calculate Base Amount using current rates
    const baseAmount = hours * rates[vehicle.type];
    const finalAmount = Math.max(0, baseAmount + extras.amount - discount);

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.type,
      entryTime: vehicle.entryTime,
      exitTime,
      durationMinutes,
      baseAmount,
      extraAmount: extras.amount,
      discountAmount: discount,
      finalAmount,
      status: 'paid',
      items: extras.items
    };

    setTransactions(prev => [transaction, ...prev]);
    setActiveVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setSlots(prev => prev.map(s => s.id === vehicle.slotId ? { ...s, isOccupied: false, vehicleId: null } : s));
    addLog(`Vehicle ${vehicle.plateNumber} checked out. Rev: $${finalAmount.toFixed(2)}`, 'exit', vehicle.plateNumber);

    return transaction;
  };

  const getSlotStatus = (slotId: number) => slots.find(s => s.id === slotId);

  const resetSystem = () => {
    setSlots(INITIAL_SLOTS);
    setActiveVehicles([]);
    setTransactions([]);
    setRecentLogs([]);
    setRates(DEFAULT_RATES);
    addLog('System reset initiated by admin', 'system');
  };

  return (
    <ParkingContext.Provider value={{ slots, activeVehicles, transactions, recentLogs, rates, updateRates, registerVehicle, checkoutVehicle, getSlotStatus, resetSystem }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) throw new Error("useParking must be used within a ParkingProvider");
  return context;
};
