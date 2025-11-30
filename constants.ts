
import { VehicleType } from './types';

export const TOTAL_SLOTS = 40;
export const HOURLY_RATE = {
  [VehicleType.CAR]: 5,
  [VehicleType.BIKE]: 2,
  [VehicleType.TRUCK]: 10,
};

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
