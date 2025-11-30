
import React, { useState, useEffect } from 'react';
import { useParking } from '../store';
import { VehicleType, Vehicle } from '../types';
import { PlusCircle, AlertCircle, Printer, X, Check, CarFront, Palette, Phone, FileText } from 'lucide-react';

const EntryForm: React.FC = () => {
  const { registerVehicle, slots, activeVehicles } = useParking();
  
  // Form State
  const [plate, setPlate] = useState('');
  const [type, setType] = useState<VehicleType>(VehicleType.CAR);
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Vehicle | null>(null);

  const availableSlots = slots.filter(s => !s.isOccupied);
  
  useEffect(() => {
    if (availableSlots.length > 0 && selectedSlotId === null) {
      setSelectedSlotId(availableSlots[0].id);
    } else if (selectedSlotId !== null) {
      const isStillAvailable = availableSlots.some(s => s.id === selectedSlotId);
      if (!isStillAvailable && availableSlots.length > 0) {
        setSelectedSlotId(availableSlots[0].id);
      }
    }
  }, [slots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!plate) return;
    
    // Validation: Duplicate Plate
    if (activeVehicles.some(v => v.plateNumber === plate.toUpperCase())) {
        setError(`Vehicle ${plate.toUpperCase()} is already currently parked.`);
        return;
    }
    
    if (!selectedSlotId) {
        setError('Please select a parking slot.');
        return;
    }

    if (availableSlots.length === 0) {
      setError('Parking lot is full!');
      return;
    }

    const vehicle = registerVehicle({
        plate,
        type,
        model,
        color,
        contact,
        notes
    }, selectedSlotId);

    if (vehicle) {
      setTicket(vehicle);
      // Reset Form
      setPlate('');
      setContact('');
      setModel('');
      setColor('');
      setNotes('');
      setType(VehicleType.CAR);
      setSelectedSlotId(null);
    } else {
      setError('Failed to register vehicle. The selected slot might have just been taken.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        {/* Ticket Modal */}
        {ticket && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden relative printable-content">
             <button 
                onClick={() => setTicket(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 z-10 no-print"
             >
               <X size={24} />
             </button>
             
             {/* Ticket Content */}
             <div className="p-8 font-mono text-center border-b-2 border-slate-100 border-dashed">
                <div className="text-xl font-bold uppercase tracking-widest mb-1 text-indigo-900">SmartPark</div>
                <div className="text-xs text-slate-400 mb-6">Entry Verification Ticket</div>
                
                <div className="my-6 border-y-2 border-slate-800 py-4">
                    <div className="text-4xl font-bold text-slate-900">{ticket.plateNumber}</div>
                    <div className="text-sm mt-1 uppercase text-slate-600">{ticket.color} {ticket.model}</div>
                </div>

                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Slot Position</span>
                    <span className="font-bold text-lg bg-slate-900 text-white px-2 rounded">#{ticket.slotId}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Entry Time</span>
                    <span>{ticket.entryTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex justify-between text-sm mb-6">
                    <span className="text-slate-500">Date</span>
                    <span>{ticket.entryTime.toLocaleDateString()}</span>
                </div>

                <div className="w-full bg-slate-100 p-2 rounded text-[10px] text-slate-400 mb-2">
                    ID: {ticket.id}
                </div>
                <div className="w-32 h-32 bg-slate-900 mx-auto rounded-lg flex items-center justify-center text-white text-xs">
                    [QR CODE]
                </div>
             </div>

             <div className="bg-slate-50 p-4 flex gap-3 no-print">
                 <button onClick={() => window.print()} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
                   <Printer size={18} /> Print Ticket
                 </button>
                 <button onClick={() => setTicket(null)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700">
                   Close
                 </button>
             </div>
           </div>
         </div>
       )}

      <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 border border-slate-200 overflow-hidden">
        {/* Gradient Header */}
        <div className="p-6 border-b border-indigo-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <h2 className="text-2xl font-bold flex items-center">
                <PlusCircle className="mr-2 text-blue-200" />
                New Vehicle Entry
            </h2>
            <p className="text-blue-100 text-sm mt-1 opacity-90">Register incoming vehicle and assign parking slot.</p>
        </div>

        {error && (
            <div className="m-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-center border border-red-100">
                <AlertCircle className="mr-2" size={20} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Section 1: Core Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center">
                    Vehicle Information <span className="ml-2 h-px bg-indigo-100 flex-1"></span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">License Plate Number</label>
                        <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase placeholder:normal-case font-mono text-lg tracking-wider bg-slate-50 focus:bg-white"
                            placeholder="e.g. ABC-1234"
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center"><CarFront size={16} className="mr-1 text-slate-400"/> Model</label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Toyota Camry"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center"><Palette size={16} className="mr-1 text-slate-400"/> Color</label>
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Silver"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Classification</label>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.values(VehicleType).map((vType) => (
                        <button
                            key={vType}
                            type="button"
                            onClick={() => setType(vType)}
                            className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center ${
                            type === vType
                                ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg transform scale-[1.02]'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                            }`}
                        >
                            <span className="uppercase tracking-wide">{vType}</span>
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section 2: Slot Selection */}
            <div>
                 <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4 flex justify-between items-center">
                    <span>Select Parking Slot</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs normal-case">{availableSlots.length} available</span>
                </h3>
                
                {availableSlots.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 max-h-56 overflow-y-auto custom-scrollbar shadow-inner">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => setSelectedSlotId(slot.id)}
                                    className={`
                                        relative h-10 rounded-md text-sm font-bold border transition-all flex items-center justify-center
                                        ${selectedSlotId === slot.id 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200 z-10' 
                                            : slot.type === 'priority' 
                                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                                        }
                                    `}
                                >
                                    {slot.id}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-center text-red-600 font-medium">
                        <AlertCircle className="mx-auto mb-2" />
                        No parking slots available.
                    </div>
                )}
            </div>

            {/* Section 3: Extra Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center"><Phone size={16} className="mr-1 text-slate-400"/> Driver Contact (Optional)</label>
                    <input
                        type="tel"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Mobile Number"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center"><FileText size={16} className="mr-1 text-slate-400"/> Notes (Optional)</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Parked near pillar"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={availableSlots.length === 0 || !selectedSlotId}
                className="w-full bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-[0.98]"
            >
                Confirm Check In
            </button>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;
