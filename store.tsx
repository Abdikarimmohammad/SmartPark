
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Vehicle, ParkingSlot, Transaction, VehicleType, ActivityLog, ActivityType, ParkingRates, Branch, User, Zone } from './types';
import { HOURLY_RATE as DEFAULT_RATES } from './constants';

interface ParkingContextType {
  // Global State
  user: User | null;
  allUsers: User[]; 
  branches: Branch[];
  currentBranch: Branch | null;
  
  // Branch-Scoped Data
  slots: ParkingSlot[];
  activeVehicles: Vehicle[];
  transactions: Transaction[];
  recentLogs: ActivityLog[];
  rates: ParkingRates;
  highlightedSlot: number | null;
  
  // Actions
  login: (username: string) => boolean;
  logout: () => void;
  switchBranch: (branchId: string) => void;
  
  // CRUD Actions
  addBranch: (branchData: Branch) => void;
  updateBranch: (id: string, branchData: Partial<Branch>) => void;
  removeBranch: (id: string) => void;
  
  registerUser: (userData: User) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  removeUser: (userId: string) => void;

  updateRates: (newRates: ParkingRates) => void;
  registerVehicle: (data: { plate: string; type: VehicleType; model: string; color: string; contact: string; notes?: string; services?: string[] }, slotId?: number) => Vehicle | null;
  checkoutVehicle: (vehicleId: string, extras?: { amount: number; items: string[] }, discount?: number) => Transaction;
  getSlotStatus: (slotId: number) => ParkingSlot | undefined;
  resetSystem: () => void;
  setHighlightedSlot: (id: number | null) => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SLOTS: 'smartpark_slots',
  VEHICLES: 'smartpark_vehicles',
  TRANSACTIONS: 'smartpark_transactions',
  LOGS: 'smartpark_logs',
  RATES: 'smartpark_rates',
  BRANCHES: 'smartpark_branches_v2', // Versioned for new structure
  USERS: 'smartpark_users',
};

const DEFAULT_BRANCHES: Branch[] = [
    { 
        id: 'b1', 
        name: 'Downtown Main', 
        capacity: 40,
        zones: [
            { id: 'z1', name: 'Zone A (VIP)', capacity: 15, type: 'priority' },
            { id: 'z2', name: 'Zone B (Standard)', capacity: 25, type: 'standard' }
        ]
    },
    { 
        id: 'b2', 
        name: 'Airport West', 
        capacity: 60,
        zones: [
            { id: 'z1', name: 'Terminal Front', capacity: 20, type: 'priority' },
            { id: 'z2', name: 'Long Term', capacity: 40, type: 'standard' }
        ]
    },
];

const DEFAULT_USERS: User[] = [
    { 
        id: 'u1', 
        username: 'admin', 
        role: 'admin', 
        fullName: 'System Administrator',
        email: 'admin@smartpark.com',
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
        caption: 'Head of Operations'
    },
    { 
        id: 'u2', 
        username: 'staff_downtown', 
        role: 'staff', 
        branchId: 'b1',
        fullName: 'Sarah Connor',
        email: 'sarah@smartpark.com',
        phoneNumber: '(555) 123-4567',
        avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=random',
        caption: 'Senior Attendant'
    },
];

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- 1. Global Data State ---
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (saved) return JSON.parse(saved).map((v: any) => ({ ...v, entryTime: new Date(v.entryTime) }));
    } catch (e) {}
    return [];
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved).map((t: any) => ({ ...t, entryTime: new Date(t.entryTime), exitTime: new Date(t.exitTime) }));
    } catch (e) {}
    return [];
  });

  const [allLogs, setAllLogs] = useState<ActivityLog[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
        if (saved) return JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
    } catch (e) {}
    return [];
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
          return saved ? JSON.parse(saved) : DEFAULT_BRANCHES;
      } catch (e) { return DEFAULT_BRANCHES; }
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEYS.USERS);
          return saved ? JSON.parse(saved) : DEFAULT_USERS;
      } catch (e) { return DEFAULT_USERS; }
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
  const [highlightedSlot, setHighlightedSlot] = useState<number | null>(null);

  // --- 3. Derived State ---
  const currentBranch = useMemo(() => {
    if (selectedBranchId === 'all') {
         return {
             id: 'all',
             name: 'All Branches (Overview)',
             capacity: branches.reduce((acc, b) => acc + b.capacity, 0),
             zones: []
         } as Branch;
    }
    return branches.find(b => b.id === selectedBranchId) || null;
  }, [branches, selectedBranchId]);
  
  const activeVehicles = useMemo(() => {
    if (selectedBranchId === 'all') return allVehicles;
    return allVehicles.filter(v => v.branchId === selectedBranchId);
  }, [allVehicles, selectedBranchId]);

  const transactions = useMemo(() => {
    if (selectedBranchId === 'all') return allTransactions;
    return allTransactions.filter(t => t.branchId === selectedBranchId);
  }, [allTransactions, selectedBranchId]);

  const recentLogs = useMemo(() => {
    if (selectedBranchId === 'all') return allLogs.slice(0, 50);
    return allLogs.filter(l => l.branchId === selectedBranchId).slice(0, 50);
  }, [allLogs, selectedBranchId]);

  // Dynamic Slot Generation based on Branch Zones
  const slots = useMemo(() => {
      // If we are in 'all' mode (id='all'), we return empty slots because we can't map aggregate slots easily
      if (!currentBranch || currentBranch.id === 'all') return [];

      let generatedSlots: ParkingSlot[] = [];
      let currentId = 1;

      // Use zones if available, otherwise fallback to capacity (Legacy support)
      const zones = currentBranch.zones || [{ id: 'default', name: 'General', capacity: currentBranch.capacity, type: 'standard' }];

      zones.forEach(zone => {
          for (let i = 0; i < zone.capacity; i++) {
              const slotId = currentId++;
              const vehicle = activeVehicles.find(v => v.slotId === slotId);
              
              generatedSlots.push({
                  id: slotId,
                  isOccupied: !!vehicle,
                  vehicleId: vehicle ? vehicle.id : null,
                  type: zone.type,
                  zoneId: zone.id,
                  zoneName: zone.name
              });
          }
      });
      
      return generatedSlots;
  }, [currentBranch, activeVehicles]);

  // --- 4. Persistence ---
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(allVehicles)); }, [allVehicles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions)); }, [allTransactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(allLogs)); }, [allLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates)); }, [rates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers)); }, [allUsers]);

  // --- 5. Actions ---

  const login = (username: string): boolean => {
      const foundUser = allUsers.find(u => u.username === username);
      if (foundUser) {
          setUser(foundUser);
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
      setHighlightedSlot(null);
  };

  const switchBranch = (branchId: string) => {
      if (user?.role === 'admin') {
          setSelectedBranchId(branchId);
          setHighlightedSlot(null);
      }
  };

  // CRUD: Branches
  const addBranch = (branchData: Branch) => {
      setBranches(prev => [...prev, branchData]);
  };

  const updateBranch = (id: string, branchData: Partial<Branch>) => {
      setBranches(prev => prev.map(b => b.id === id ? { ...b, ...branchData } : b));
  };

  const removeBranch = (id: string) => {
      setBranches(prev => prev.filter(b => b.id !== id));
      if (selectedBranchId === id) setSelectedBranchId(branches[0]?.id || null);
  };

  // CRUD: Users
  const registerUser = (userData: User) => {
      setAllUsers(prev => [...prev, userData]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
  };

  const removeUser = (userId: string) => {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addLog = (message: string, type: ActivityType, plate?: string) => {
    if (!currentBranch || currentBranch.id === 'all') return;
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

  const registerVehicle = (data: { plate: string; type: VehicleType; model: string; color: string; contact: string; notes?: string; services?: string[] }, slotId?: number): Vehicle | null => {
    if (!currentBranch || currentBranch.id === 'all') return null;
    if (activeVehicles.some(v => v.plateNumber === data.plate.toUpperCase())) return null;

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
      notes: data.notes,
      requestedServices: data.services
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
      branchId: vehicle.branchId, // Use vehicle branch ID to ensure correct assignment in overview
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
    
    // Only add log if not in overview mode or handle specifically
    if(currentBranch.id !== 'all') {
         addLog(`Vehicle ${vehicle.plateNumber} checked out. Rev: $${finalAmount.toFixed(2)}`, 'exit', vehicle.plateNumber);
    }
    
    return transaction;
  };

  const getSlotStatus = (slotId: number) => slots.find(s => s.id === slotId);

  const resetSystem = () => {
    if(user?.role !== 'admin') return;
    if(currentBranch?.id === 'all') return; // Cannot reset all at once safely
    
    setAllVehicles(prev => prev.filter(v => v.branchId !== currentBranch?.id));
    setAllTransactions(prev => prev.filter(t => t.branchId !== currentBranch?.id));
    setAllLogs(prev => prev.filter(l => l.branchId !== currentBranch?.id));
    setRates(DEFAULT_RATES);
  };

  return (
    <ParkingContext.Provider value={{ 
        user, allUsers, branches, currentBranch, slots, activeVehicles, transactions, recentLogs, rates, highlightedSlot,
        login, logout, switchBranch, 
        addBranch, updateBranch, removeBranch, 
        registerUser, updateUser, removeUser,
        updateRates, registerVehicle, checkoutVehicle, getSlotStatus, resetSystem, setHighlightedSlot
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
