
import { VehicleType } from './types';

export const TOTAL_SLOTS = 40;
export const HOURLY_RATE = {
  [VehicleType.CAR]: 5,
  [VehicleType.BIKE]: 2,
  [VehicleType.TRUCK]: 10,
};

export const SERVICES_DATA = [
    { id: 'tyreChange', label: 'Tyre Changing', price: 2.99, icon: '🔧' },
    { id: 'oilChange', label: 'Oil Changing', price: 4.99, icon: '🛢️' },
    { id: 'keyReplace', label: 'Key Replacing', price: 14.99, icon: '🔑' },
    { id: 'carWash', label: 'Car Washing', price: 3.99, icon: '🚿' },
    { id: 'battery', label: 'Battery Services', price: 2.99, icon: '🔋' },
    { id: 'electricRepair', label: 'Electrical System Repairing', price: 24.99, icon: '⚡' },
    { id: 'fullCheckup', label: 'Full Check-up', price: 44.99, icon: '🩺' },
];

// Mock initial data populated with specific zones
// Slots 1-20: Zone A (Premium/Near Entrance)
// Slots 21-40: Zone B (Premium/Rear Section) - Now identical structure to A
export const INITIAL_SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const slotId = i + 1;
    // Make slots 1-10 and 21-30 priority to ensure both zones have premium spots
    const isPriority = (slotId >= 1 && slotId <= 10) || (slotId >= 21 && slotId <= 30);
    
    return {
        id: slotId,
        isOccupied: false,
        vehicleId: null,
        type: isPriority ? 'priority' : 'standard', 
    };
});
