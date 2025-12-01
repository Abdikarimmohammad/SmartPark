
import React, { useState } from 'react';
import { useParking } from '../store';
import { Car, Bike, Truck, Info, X, Clock, DollarSign, Phone, Filter, MapPin, Check, Building } from 'lucide-react';
import { VehicleType, ParkingSlot as ParkingSlotType } from '../types';
import { SERVICES_DATA } from '../constants';

type FilterType = 'all' | 'car' | 'bike' | 'truck' | 'occupied' | 'empty';

const ParkingLot: React.FC = () => {
  const { slots, activeVehicles, checkoutVehicle, rates, currentBranch } = useParking();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlotType | null>(null);
  const [showReceipt, setShowReceipt] = useState<{ plate: string; amount: number; duration: number } | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const isOverview = currentBranch?.id === 'all';

  if (isOverview) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white/50 rounded-3xl border border-white/20 shadow-xl backdrop-blur-md p-10">
              <div className="bg-indigo-100 p-6 rounded-full text-indigo-600 mb-6 shadow-inner">
                  <Building size={64} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Specific Branch</h2>
              <p className="text-slate-500 max-w-md">The parking map requires a specific physical location to display slots. Please select a branch from the sidebar to view its map.</p>
          </div>
      );
  }

  // Group slots by Zone ID
  const slotsByZone = slots.reduce((acc, slot) => {
      const zoneId = slot.zoneId || 'default';
      if (!acc[zoneId]) acc[zoneId] = [];
      acc[zoneId].push(slot);
      return acc;
  }, {} as Record<string, ParkingSlotType[]>);

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

  const SlotGrid: React.FC<{ data: ParkingSlotType[], zoneName: string, zoneType: string }> = ({ data, zoneName, zoneType }) => (
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-indigo-100 border border-white/50 relative overflow-hidden mb-8">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${zoneType === 'priority' ? 'from-amber-400 to-orange-400' : 'from-indigo-400 to-purple-400'}`}></div>
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 flex items-center text-lg">
                <span className={`p-1.5 rounded-lg mr-2 ${zoneType === 'priority' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    <MapPin size={18}/>
                </span> 
                {zoneName}
            </h3>
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wide border border-slate-200">Capacity: {data.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
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
    
    // Calculate current stats
    let currentCost = 0;
    if (vehicle) {
        const now = new Date();
        const diffMs = now.getTime() - vehicle.entryTime.getTime();
        const minutes = Math.ceil(diffMs / 60000);
        // Cost per minute logic
        currentCost = minutes * (rates[vehicle.type] / 60);
    }

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-white/10">
          <div className="bg-gradient-to-r from-indigo-900 to-blue-900 px-6 py-5 flex justify-between items-center border-b border-indigo-800 relative">
            <div className="absolute inset-0 bg-white/5 opacity-30 pattern-grid"></div>
            <div className="relative z-10">
                <h3 className="text-white font-bold text-lg flex items-center">Slot #{selectedSlot.id}</h3>
                <p className="text-indigo-200 text-xs flex items-center mt-1 font-medium">
                    <MapPin size={12} className="mr-1"/> {selectedSlot.zoneName || 'General Zone'}
                </p>
            </div>
            <button onClick={() => setSelectedSlot(null)} className="relative z-10 text-indigo-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
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

                    {vehicle.requestedServices && vehicle.requestedServices.length > 0 && (
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                <span className="text-xs text-indigo-500 uppercase font-bold mb-2 block">Requested Services</span>
                                <div className="flex flex-wrap gap-2">
                                    {vehicle.requestedServices.map(sid => {
                                        const service = SERVICES_DATA.find(s => s.id === sid);
                                        return service ? (
                                            <span key={sid} className="text-xs bg-white text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md font-medium shadow-sm">
                                                {service.label}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Car size={32} className="text-slate-300"/>
                    </div>
                    <h4 className="text-lg font-bold text-slate-700">Slot is Empty</h4>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center mt-4">
                        <Check size={16} className="mr-2"/> Ready for use
                    </div>
                </div>
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

      <div className="flex flex-col gap-0">
          {Object.keys(slotsByZone).length > 0 ? (
             Object.keys(slotsByZone).map((zoneId) => {
                 const zoneSlots = slotsByZone[zoneId];
                 const zoneName = zoneSlots[0]?.zoneName || 'Unknown Zone';
                 const zoneType = zoneSlots[0]?.type || 'standard';
                 return (
                     <SlotGrid key={zoneId} data={zoneSlots} zoneName={zoneName} zoneType={zoneType} />
                 );
             })
          ) : (
              <div className="text-center py-10 text-slate-400">No parking slots configured for this branch.</div>
          )}
      </div>
    </div>
  );
};

export default ParkingLot;
