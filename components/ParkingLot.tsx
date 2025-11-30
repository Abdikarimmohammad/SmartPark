
import React, { useState } from 'react';
import { useParking } from '../store';
import { Car, Bike, Truck, Info, X, Clock, DollarSign, Phone, Filter, MapPin, Check } from 'lucide-react';
import { VehicleType, ParkingSlot as ParkingSlotType } from '../types';

type FilterType = 'all' | 'car' | 'bike' | 'truck' | 'occupied' | 'empty';

const ParkingLot: React.FC = () => {
  const { slots, activeVehicles, checkoutVehicle, rates } = useParking();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlotType | null>(null);
  const [showReceipt, setShowReceipt] = useState<{ plate: string; amount: number; duration: number } | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  // Split slots into two zones
  const zoneASlots = slots.slice(0, 20); // Slots 1-20
  const zoneBSlots = slots.slice(20, 40); // Slots 21-40

  const getVehicleIcon = (type: VehicleType) => {
    switch(type) {
      case VehicleType.CAR: return <Car size={24} />;
      case VehicleType.BIKE: return <Bike size={24} />;
      case VehicleType.TRUCK: return <Truck size={24} />;
      default: return <Car size={24} />;
    }
  };

  const handleSlotClick = (slot: ParkingSlotType) => {
    setSelectedSlot(slot);
    setShowReceipt(null);
  };

  const handleQuickCheckout = (vehicleId: string) => {
    try {
      const transaction = checkoutVehicle(vehicleId);
      setShowReceipt({
        plate: transaction.plateNumber,
        amount: transaction.finalAmount,
        duration: transaction.durationMinutes
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isSlotVisible = (slot: ParkingSlotType) => {
      const vehicle = slot.vehicleId ? activeVehicles.find(v => v.id === slot.vehicleId) : null;
      if (filter === 'all') return true;
      if (filter === 'empty') return !slot.isOccupied;
      if (filter === 'occupied') return slot.isOccupied;
      if (filter === 'car') return vehicle?.type === VehicleType.CAR;
      if (filter === 'bike') return vehicle?.type === VehicleType.BIKE;
      if (filter === 'truck') return vehicle?.type === VehicleType.TRUCK;
      return true;
  };

  const getSlotDistance = (id: number) => {
      if(id <= 10) return "20m (Near Entrance)";
      if(id <= 20) return "50m (Zone A)";
      if(id <= 30) return "80m (Zone B)";
      return "120m (Rear Exit)";
  }

  const SlotGrid = ({ data, zoneName }: { data: ParkingSlotType[], zoneName: string }) => (
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-indigo-100 border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 flex items-center text-lg">
                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2"><MapPin size={18}/></span> {zoneName}
            </h3>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wide border border-slate-200">Capacity: {data.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {data.map((slot) => {
                const vehicle = slot.vehicleId ? activeVehicles.find(v => v.id === slot.vehicleId) : null;
                const visible = isSlotVisible(slot);
                
                return (
                    <div 
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className={`
                        relative h-28 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group shadow-sm overflow-hidden
                        ${!visible ? 'opacity-20 pointer-events-none grayscale' : ''}
                        ${slot.isOccupied 
                        ? 'bg-gradient-to-br from-white to-red-50 border-red-200 text-red-600 shadow-red-100' 
                        : slot.type === 'priority' 
                            ? 'bg-gradient-to-br from-white to-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100' 
                            : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1'
                        }
                    `}
                    >
                    <div className="absolute top-2 left-2 flex items-center space-x-1 z-10">
                        <span className="text-[10px] font-black opacity-40">#{slot.id}</span>
                    </div>

                    {slot.isOccupied && vehicle ? (
                        <div className="flex flex-col items-center w-full px-1 animate-scale-in relative z-10">
                        <div className="transform transition-transform group-hover:scale-110 duration-200 drop-shadow-sm">
                            {getVehicleIcon(vehicle.type)}
                        </div>
                        <span className="text-xs font-extrabold mt-2 bg-white/90 px-2 py-0.5 rounded shadow-sm w-full text-center truncate border border-slate-100 text-slate-800 tracking-tight">
                            {vehicle.plateNumber}
                        </span>
                        </div>
                    ) : (
                        <div className="text-slate-300 flex flex-col items-center group-hover:text-indigo-500 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Empty</span>
                        </div>
                    )}

                    {slot.type === 'priority' && !slot.isOccupied && (
                        <div className="absolute bottom-2 right-2">
                            <span className="h-2 w-2 rounded-full bg-amber-400 block animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                        </div>
                    )}
                    </div>
                );
            })}
          </div>
      </div>
  );

  const getSlotDetails = () => {
    if (!selectedSlot) return null;
    const vehicle = selectedSlot.vehicleId ? activeVehicles.find(v => v.id === selectedSlot.vehicleId) : null;
    
    // Calculate current stats if occupied
    let currentCost = 0;
    let durationHours = 0;
    if (vehicle) {
        const now = new Date();
        const diffMs = now.getTime() - vehicle.entryTime.getTime();
        durationHours = Math.ceil(diffMs / (1000 * 60 * 60));
        currentCost = durationHours * rates[vehicle.type];
    }

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-white/10">
          <div className="bg-gradient-to-r from-indigo-900 to-blue-900 px-6 py-5 flex justify-between items-center border-b border-indigo-800 relative">
            <div className="absolute inset-0 bg-white/5 opacity-30 pattern-grid"></div>
            <div className="relative z-10">
                <h3 className="text-white font-bold text-lg flex items-center">
                Slot #{selectedSlot.id}
                </h3>
                <p className="text-indigo-200 text-xs flex items-center mt-1 font-medium">
                    <MapPin size={12} className="mr-1"/> {getSlotDistance(selectedSlot.id)}
                </p>
            </div>
            <button onClick={() => setSelectedSlot(null)} className="relative z-10 text-indigo-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {showReceipt ? (
               <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-short shadow-lg shadow-green-200">
                    <DollarSign size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Checkout Complete</h4>
                  <p className="text-slate-500 mb-6">Payment processed successfully.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left shadow-inner">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-500 font-medium">Vehicle</span>
                      <span className="font-bold text-slate-800">{showReceipt.plate}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-500 font-medium">Duration</span>
                      <span className="font-bold text-slate-800">{showReceipt.duration} min</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                      <span className="font-bold text-slate-800">Total Charged</span>
                      <span className="font-bold text-green-600 text-xl">${showReceipt.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg"
                  >
                    Close
                  </button>
               </div>
            ) : (
                <>
                {selectedSlot.isOccupied && vehicle ? (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 shadow-inner">
                                {getVehicleIcon(vehicle.type)}
                            </div>
                            <div>
                                <div className="text-sm text-slate-500 font-medium">Currently Parked</div>
                                <div className="text-2xl font-bold text-slate-800 tracking-tight">{vehicle.plateNumber}</div>
                                <div className="text-xs text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded inline-block mt-1">
                                    {vehicle.color} {vehicle.model}
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-xs text-slate-400 uppercase font-bold">Entry Time</span>
                                <div className="font-semibold text-slate-700 mt-1 flex items-center">
                                    <Clock size={14} className="mr-1 text-slate-400"/>
                                    {vehicle.entryTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-xs text-slate-400 uppercase font-bold">Current Bill</span>
                                <div className="font-semibold text-slate-700 mt-1 flex items-center">
                                    <DollarSign size={14} className="mr-1 text-slate-400"/>
                                    {currentCost.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {vehicle.contactNumber && (
                             <div className="flex items-center text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <Phone size={16} className="mr-2 text-blue-500"/>
                                <span className="font-bold mr-2">Contact:</span> {vehicle.contactNumber}
                             </div>
                        )}
                        
                        {vehicle.notes && (
                             <div className="text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                                <span className="font-bold not-italic text-amber-600 mr-1">Note:</span> {vehicle.notes}
                             </div>
                        )}

                        <div className="pt-2">
                            <button
                                onClick={() => handleQuickCheckout(vehicle.id)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 transition-colors flex items-center justify-center"
                            >
                                <DollarSign size={18} className="mr-2"/> Quick Checkout
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Car size={32} className="text-slate-300"/>
                        </div>
                        <h4 className="text-lg font-bold text-slate-700">Slot is Empty</h4>
                        <p className="text-slate-400 text-sm mb-6">This parking space is currently available.</p>
                        
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center">
                            <Check size={16} className="mr-2"/> Ready for use
                        </div>
                    </div>
                )}
                </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {selectedSlot && getSlotDetails()}
      
      {/* Map Controls */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide mr-2 flex items-center"><Filter size={16} className="mr-1"/> Filter Map:</span>
            {['all', 'occupied', 'empty', 'car', 'bike', 'truck'].map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f as FilterType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        filter === f 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {f}
                </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center"><span className="w-3 h-3 bg-white border border-slate-300 rounded mr-1"></span> Standard</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-amber-50 border border-amber-200 rounded mr-1"></span> Priority</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-red-50 border border-red-200 rounded mr-1"></span> Occupied</div>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <SlotGrid data={zoneASlots} zoneName="Zone A (Premium Entry)" />
            
            {/* Driveway Visual */}
            <div className="h-16 flex items-center justify-center opacity-40">
                <div className="w-full border-t-2 border-dashed border-slate-400 relative">
                     <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-slate-200 px-3 py-0.5 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">Driveway</span>
                </div>
            </div>

            <SlotGrid data={zoneBSlots} zoneName="Zone B (Standard Rear)" />
          </div>
      </div>
    </div>
  );
};

export default ParkingLot;
