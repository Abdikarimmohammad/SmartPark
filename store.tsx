
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Vehicle, ParkingSlot, Transaction, VehicleType, ActivityLog, ActivityType, ParkingRates, Branch, User } from './types';
import { HOURLY_RATE as DEFAULT_RATES } from './constants';

interface ParkingContextType {
  // Global State
  user: User | null;
  branches: Branch[];
  currentBranch: Branch | null;
  
  // Branch-Scoped Data (Filtered)
  slots: ParkingSlot[];
  activeVehicles: Vehicle[];
  transactions: Transaction[];
  recentLogs: ActivityLog[];
  rates: ParkingRates;
  
  // Actions
  login: (username: string) => boolean;
  logout: () => void;
  switchBranch: (branchId: string) => void;
  addBranch: (name: string, capacity: number) => void;
  removeBranch: (id: string) => void;
  
  updateRates: (newRates: ParkingRates) => void;
  registerVehicle: (data: { plate: string; type: VehicleType; model: string; color: string; contact: string; notes?: string }, slotId?: number) => Vehicle | null;
  checkoutVehicle: (vehicleId: string, extras?: { amount: number; items: string[] }, discount?: number) => Transaction;
  getSlotStatus: (slotId: number) => ParkingSlot | undefined;
  resetSystem: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SLOTS: 'smartpark_slots', // Deprecated in favor of dynamic generation
  VEHICLES: 'smartpark_vehicles',
  TRANSACTIONS: 'smartpark_transactions',
  LOGS: 'smartpark_logs',
  RATES: 'smartpark_rates',
  BRANCHES: 'smartpark_branches',
  INIT: 'smartpark_initialized_v2'
};

const DEFAULT_BRANCHES: Branch[] = [
    { id: 'b1', name: 'Downtown Main', capacity: 40 },
    { id: 'b2', name: 'Airport West', capacity: 60 },
    { id: 'b3', name: 'Mall South', capacity: 30 },
];

const MOCK_USERS: User[] = [
    { id: 'u1', username: 'admin', role: 'admin' },
    { id: 'u2', username: 'staff_downtown', role: 'staff', branchId: 'b1' },
    { id: 'u3', username: 'staff_airport', role: 'staff', branchId: 'b2' },
];

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- 1. Global Data State ---
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (saved) {
        return JSON.parse(saved).map((v: any) => ({ ...v, entryTime: new Date(v.entryTime) }));
      }
    } catch (e) {}
    return [];
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        return JSON.parse(saved).map((t: any) => ({ ...t, entryTime: new Date(t.entryTime), exitTime: new Date(t.exitTime) }));
      }
    } catch (e) {}
    return [];
  });

  const [allLogs, setAllLogs] = useState<ActivityLog[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
        if (saved) {
            return JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
        }
    } catch (e) {}
    return [];
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
          return saved ? JSON.parse(saved) : DEFAULT_BRANCHES;
      } catch (e) { return DEFAULT_BRANCHES; }
  });

  const [rates, setRates] = useState<ParkingRates>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RATES);
      return saved ? JSON.parse(saved) : DEFAULT_RATES;
    } catch (e) { return DEFAULT_RATES; }
  });

  // --- 2. Session State ---
  const [user, setUser] = useState<User | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // --- 3. Derived/Filtered State (The "View") ---
  
  const currentBranch = useMemo(() => 
    branches.find(b => b.id === selectedBranchId) || null, 
  [branches, selectedBranchId]);

  // Filter Vehicles for current branch
  const activeVehicles = useMemo(() => 
    allVehicles.filter(v => v.branchId === selectedBranchId), 
  [allVehicles, selectedBranchId]);

  // Filter Transactions for current branch
  const transactions = useMemo(() => 
    allTransactions.filter(t => t.branchId === selectedBranchId), 
  [allTransactions, selectedBranchId]);

  // Filter Logs for current branch
  const recentLogs = useMemo(() => 
    allLogs.filter(l => l.branchId === selectedBranchId).slice(0, 50), 
  [allLogs, selectedBranchId]);

  // Generate Slots based on Current Branch Capacity + Active Vehicles
  const slots = useMemo(() => {
      if (!currentBranch) return [];
      
      return Array.from({ length: currentBranch.capacity }, (_, i) => {
        const slotId = i + 1;
        // Simple zoning logic: First 25% and middle 25% are priority
        const isPriority = (slotId <= Math.ceil(currentBranch.capacity * 0.25)) || 
                           (slotId > Math.ceil(currentBranch.capacity * 0.5) && slotId <= Math.ceil(currentBranch.capacity * 0.75));
        
        const vehicle = activeVehicles.find(v => v.slotId === slotId);

        return {
            id: slotId,
            isOccupied: !!vehicle,
            vehicleId: vehicle ? vehicle.id : null,
            type: isPriority ? 'priority' : 'standard',
        } as ParkingSlot;
      });
  }, [currentBranch, activeVehicles]);

  // --- 4. Effects (Persistence) ---
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(allVehicles)); }, [allVehicles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions)); }, [allTransactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(allLogs)); }, [allLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates)); }, [rates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches)); }, [branches]);

  // --- 5. Actions ---

  const login = (username: string): boolean => {
      const foundUser = MOCK_USERS.find(u => u.username === username);
      if (foundUser) {
          setUser(foundUser);
          // If staff, force their branch. If admin, default to first branch.
          if (foundUser.role === 'staff' && foundUser.branchId) {
              setSelectedBranchId(foundUser.branchId);
          } else {
              setSelectedBranchId(branches[0]?.id || null);
          }
          return true;
      }
      return false;
  };

  const logout = () => {
      setUser(null);
      setSelectedBranchId(null);
  };

  const switchBranch = (branchId: string) => {
      if (user?.role === 'admin') {
          setSelectedBranchId(branchId);
      }
  };

  const addBranch = (name: string, capacity: number) => {
      const newBranch: Branch = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          capacity
      };
      setBranches(prev => [...prev, newBranch]);
  };

  const removeBranch = (id: string) => {
      setBranches(prev => prev.filter(b => b.id !== id));
      if (selectedBranchId === id) {
          setSelectedBranchId(branches[0]?.id || null);
      }
  };

  const addLog = (message: string, type: ActivityType, plate?: string) => {
    if (!currentBranch) return;
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      branchId: currentBranch.id,
      message,
      type,
      timestamp: new Date(),
      vehiclePlate: plate
    };
    setAllLogs(prev => [newLog, ...prev]);
  };

  const updateRates = (newRates: ParkingRates) => {
      setRates(newRates);
      addLog('Parking rates updated', 'system');
  };

  const registerVehicle = (data: { plate: string; type: VehicleType; model: string; color: string; contact: string; notes?: string }, slotId?: number): Vehicle | null => {
    if (!currentBranch) return null;

    // Check duplicate in current branch
    if (activeVehicles.some(v => v.plateNumber === data.plate.toUpperCase())) {
        return null;
    }

    let targetSlotId = slotId;
    if (!targetSlotId) {
        const firstFree = slots.find(s => !s.isOccupied);
        if (firstFree) targetSlotId = firstFree.id;
    }

    if (!targetSlotId) return null;

    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      branchId: currentBranch.id,
      plateNumber: data.plate.toUpperCase(),
      type: data.type,
      model: data.model || 'Unknown',
      color: data.color || 'Unknown',
      entryTime: new Date(),
      slotId: targetSlotId,
      contactNumber: data.contact,
      notes: data.notes
    };

    setAllVehicles(prev => [newVehicle, ...prev]);
    addLog(`Vehicle ${newVehicle.plateNumber} checked in at Slot ${targetSlotId}`, 'entry', newVehicle.plateNumber);
    return newVehicle;
  };

  const checkoutVehicle = (vehicleId: string, extras = { amount: 0, items: [] as string[] }, discount = 0): Transaction => {
    if (!currentBranch) throw new Error("No branch selected");
    
    const vehicle = activeVehicles.find(v => v.id === vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const exitTime = new Date();
    const durationMs = exitTime.getTime() - vehicle.entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / 60000);
    const hours = Math.ceil(durationMinutes / 60);
    
    const baseAmount = hours * rates[vehicle.type];
    const finalAmount = Math.max(0, baseAmount + extras.amount - discount);

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      branchId: currentBranch.id,
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

    setAllTransactions(prev => [transaction, ...prev]);
    setAllVehicles(prev => prev.filter(v => v.id !== vehicleId));
    addLog(`Vehicle ${vehicle.plateNumber} checked out. Rev: $${finalAmount.toFixed(2)}`, 'exit', vehicle.plateNumber);

    return transaction;
  };

  const getSlotStatus = (slotId: number) => slots.find(s => s.id === slotId);

  const resetSystem = () => {
    // Only resets current branch vehicles/logs for safety, or implement full nuke if needed
    if(user?.role !== 'admin') return;
    setAllVehicles([]);
    setAllTransactions([]);
    setAllLogs([]);
    setRates(DEFAULT_RATES);
    // Note: Not resetting branches configuration
  };

  return (
    <ParkingContext.Provider value={{ 
        user, branches, currentBranch, slots, activeVehicles, transactions, recentLogs, rates, 
        login, logout, switchBranch, addBranch, removeBranch,
        updateRates, registerVehicle, checkoutVehicle, getSlotStatus, resetSystem 
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) throw new Error("useParking must be used within a ParkingProvider");
  return context;
};
