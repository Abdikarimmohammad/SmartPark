
import React, { useState } from 'react';
import { useParking } from '../store';
import { Clock, DollarSign, LogOut, CheckCircle, Printer, X, Tag, Calculator, Search, CreditCard, Receipt } from 'lucide-react';
import { Transaction, Vehicle } from '../types';
import { SERVICES_DATA } from '../constants';

const ExitList: React.FC = () => {
  const { activeVehicles, checkoutVehicle, rates } = useParking();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Checkout Logic States
  const [confirmingVehicle, setConfirmingVehicle] = useState<Vehicle | null>(null);
  const [extras, setExtras] = useState<{ [key: string]: boolean }>({});
  const [discountPercent, setDiscountPercent] = useState(0);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const filteredVehicles = activeVehicles.filter(v => 
    v.plateNumber.includes(searchTerm.toUpperCase())
  );

  const handleInitiateCheckout = (vehicle: Vehicle) => {
      setConfirmingVehicle(vehicle);
      // Pre-select services that were requested during entry
      const initialExtras = SERVICES_DATA.reduce((acc, service) => {
          acc[service.id] = vehicle.requestedServices?.includes(service.id) || false;
          return acc;
      }, {} as { [key: string]: boolean });
      
      setExtras(initialExtras);
      setDiscountPercent(0);
  };

  const toggleExtra = (key: string) => {
      setExtras(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinalizeCheckout = () => {
      if (!confirmingVehicle) return;

      const extraItems = SERVICES_DATA
        .filter(s => extras[s.id])
        .map(s => s.label);
      
      const extraCost = SERVICES_DATA
        .filter(s => extras[s.id])
        .reduce((sum, s) => sum + s.price, 0);

      const now = new Date();
      const diffMs = now.getTime() - confirmingVehicle.entryTime.getTime();
      const diffMins = Math.ceil(diffMs / 60000);
      const diffHrs = Math.ceil(diffMins / 60);
      
      // Calculate by minute
      const hourlyRate = rates[confirmingVehicle.type];
      const baseCost = (diffMins * (hourlyRate / 60));

      const subTotal = baseCost + extraCost;
      const discountAmount = (subTotal * discountPercent) / 100;

      try {
        const transaction = checkoutVehicle(
            confirmingVehicle.id, 
            { amount: extraCost, items: extraItems },
            discountAmount
        );
        setReceipt(transaction);
        setConfirmingVehicle(null);
      } catch (error) {
        console.error(error);
      }
  };

  const getPreviewCosts = () => {
      if (!confirmingVehicle) return { base: 0, extra: 0, total: 0, hours: 0, mins: 0, discount: 0 };
      
      const now = new Date();
      const diffMs = now.getTime() - confirmingVehicle.entryTime.getTime();
      const diffMins = Math.ceil(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const minsRemainder = diffMins % 60;
      
      const hourlyRate = rates[confirmingVehicle.type];
      const base = (diffMins * (hourlyRate / 60));
      
      const extra = SERVICES_DATA
        .filter(s => extras[s.id])
        .reduce((sum, s) => sum + s.price, 0);

      const sub = base + extra;
      const discount = (sub * discountPercent) / 100;
      
      return { base, extra, total: sub - discount, hours: diffHrs, mins: minsRemainder, discount };
  };

  const costs = getPreviewCosts();

  return (
    <div className="space-y-8 relative">
       
       {/* 1. Confirmation & Billing Modal */}
       {confirmingVehicle && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] transform scale-100 transition-transform">
             <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                 <h3 className="font-bold text-lg flex items-center">
                     <CreditCard className="mr-2 text-indigo-200" /> POS Terminal
                 </h3>
                 <button onClick={() => setConfirmingVehicle(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-white/80"/></button>
             </div>
             
             <div className="p-6 overflow-y-auto custom-scrollbar">
                 {/* Vehicle Summary */}
                 <div className="flex items-center justify-between mb-8 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-sm">
                     <div>
                         <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-1">Vehicle Details</div>
                         <div className="text-3xl font-bold text-slate-800 font-mono tracking-tight">{confirmingVehicle.plateNumber}</div>
                         <div className="text-sm text-slate-600 mt-1">{confirmingVehicle.color} {confirmingVehicle.model}</div>
                     </div>
                     <div className="text-right">
                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Time Elapsed</div>
                         <div className="text-2xl font-bold text-slate-800">{costs.hours}<span className="text-sm">:</span>{costs.mins.toString().padStart(2, '0')} <span className="text-sm font-normal text-slate-500">h:m</span></div>
                         <div className="text-xs text-slate-400">Rate: ${rates[confirmingVehicle.type]}/hr</div>
                     </div>
                 </div>

                 {/* Extras Selector */}
                 <div className="mb-8">
                     <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Add-ons & Fees</h4>
                     <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                         {SERVICES_DATA.map((service) => (
                             <button
                                key={service.id}
                                onClick={() => toggleExtra(service.id)}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all flex justify-between items-center shadow-sm ${
                                    extras[service.id] 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                             >
                                 <span className="flex items-center">
                                    <span className="mr-2">{service.icon}</span> {service.label}
                                 </span>
                                 <span className={extras[service.id] ? 'font-bold' : 'text-slate-400'}>
                                     +${service.price.toFixed(2)}
                                 </span>
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Discount Slider */}
                 <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Apply Discount</label>
                        <span className="text-indigo-600 font-bold">{discountPercent}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                 </div>
             </div>

             <div className="p-5 bg-slate-50 border-t border-slate-200">
                 <div className="flex justify-between items-center mb-2 text-sm">
                     <span className="text-slate-500">Parking Fee</span>
                     <span className="font-bold text-slate-700">${costs.base.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center mb-2 text-sm">
                     <span className="text-slate-500">Extras</span>
                     <span className="font-bold text-slate-700">${costs.extra.toFixed(2)}</span>
                 </div>
                 {costs.discount > 0 && (
                    <div className="flex justify-between items-center mb-4 text-sm">
                        <span className="text-slate-500">Discount ({discountPercent}%)</span>
                        <span className="font-bold text-green-600">-${costs.discount.toFixed(2)}</span>
                    </div>
                 )}
                 <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
                     <span className="text-lg font-bold text-slate-800">Total To Pay</span>
                     <span className="text-3xl font-extrabold text-indigo-600">${costs.total.toFixed(2)}</span>
                 </div>
                 
                 <button
                    onClick={handleFinalizeCheckout}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center transition-all transform active:scale-[0.98]"
                 >
                     <CheckCircle size={20} className="mr-2"/> Confirm Payment & Checkout
                 </button>
             </div>
           </div>
         </div>
       )}

       {/* 2. Receipt Modal */}
       {receipt && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
               <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl relative overflow-hidden printable-content">
                   <button onClick={() => setReceipt(null)} className="absolute top-2 right-2 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 no-print"><X size={20}/></button>
                   
                   <div className="p-8 text-center">
                       <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                           <Receipt size={32} />
                       </div>
                       <h2 className="text-2xl font-bold text-slate-800 mb-1">Payment Successful</h2>
                       <p className="text-slate-500 text-sm mb-6">Transaction ID: {receipt.id}</p>

                       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed relative">
                           {/* Receipt Cutout visual */}
                           <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white rounded-full border-r border-slate-200"></div>
                           <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white rounded-full border-l border-slate-200"></div>

                           <div className="flex justify-between mb-2 text-sm">
                               <span className="text-slate-500">Vehicle</span>
                               <span className="font-bold">{receipt.plateNumber}</span>
                           </div>
                           <div className="flex justify-between mb-2 text-sm">
                               <span className="text-slate-500">Entry</span>
                               <span className="font-mono text-xs">{new Date(receipt.entryTime).toLocaleTimeString()}</span>
                           </div>
                           <div className="flex justify-between mb-2 text-sm">
                               <span className="text-slate-500">Exit</span>
                               <span className="font-mono text-xs">{new Date(receipt.exitTime).toLocaleTimeString()}</span>
                           </div>
                           <div className="flex justify-between mb-2 text-sm pt-2 border-t border-slate-200 border-dashed mt-2">
                               <span className="text-slate-500">Base Parking</span>
                               <span>${receipt.baseAmount.toFixed(2)}</span>
                           </div>
                           {receipt.extraAmount > 0 && (
                               <div className="border-t border-slate-200 border-dashed mt-2 pt-2">
                                   <div className="flex justify-between text-xs text-slate-400 mb-1 uppercase font-bold">Extras</div>
                                   {receipt.items && receipt.items.map((item, idx) => (
                                       <div key={idx} className="flex justify-between mb-1 text-sm text-slate-600">
                                            <span>{item}</span>
                                            {/* We don't store individual item price in transaction items array currently, just total extra amount. 
                                                If strict itemized pricing is needed on receipt, store logic needs update. 
                                                For now showing list + total extra. */}
                                       </div>
                                   ))}
                                   <div className="flex justify-between text-sm font-bold text-slate-700 mt-1">
                                       <span>Total Extras</span>
                                       <span>+${receipt.extraAmount.toFixed(2)}</span>
                                   </div>
                               </div>
                           )}
                           {receipt.discountAmount > 0 && (
                               <div className="flex justify-between mb-2 text-sm text-green-600 mt-2">
                                   <span className="font-medium">Discount</span>
                                   <span>-${receipt.discountAmount.toFixed(2)}</span>
                               </div>
                           )}
                           <div className="flex justify-between pt-2 border-t-2 border-slate-800 mt-2">
                               <span className="font-bold text-lg">Total</span>
                               <span className="font-bold text-lg">${receipt.finalAmount.toFixed(2)}</span>
                           </div>
                       </div>
                   </div>
                   <div className="bg-slate-100 p-4 flex gap-3 no-print">
                       <button onClick={() => window.print()} className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center justify-center">
                           <Printer size={16} className="mr-2"/> Print Receipt
                       </button>
                       <button onClick={() => setReceipt(null)} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700">
                           Done
                       </button>
                   </div>
               </div>
           </div>
       )}

      <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-indigo-100 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <h2 className="text-2xl font-bold flex items-center">
                <LogOut className="mr-2 text-indigo-200" />
                Active Parking Tickets
            </h2>
            <p className="text-indigo-100 text-sm mt-1 opacity-90">Manage exits and process payments.</p>
        </div>

        <div className="p-6">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by License Plate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm bg-slate-50 focus:bg-white uppercase font-mono"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Search size={32} />
                        </div>
                        <h3 className="text-slate-500 font-bold text-lg">No vehicles found</h3>
                        <p className="text-slate-400 text-sm">Try searching for a different plate number.</p>
                    </div>
                ) : (
                    filteredVehicles.map(vehicle => {
                        const now = new Date();
                        const diffMs = now.getTime() - vehicle.entryTime.getTime();
                        const diffMins = Math.ceil(diffMs / 60000);
                        const diffHrs = Math.floor(diffMins / 60);
                        const minsRemainder = diffMins % 60;
                        const hourlyRate = rates[vehicle.type];
                        const currentCost = (diffMins * (hourlyRate / 60));

                        return (
                            <div key={vehicle.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                            Slot #{vehicle.slotId}
                                        </span>
                                        <h3 className="text-2xl font-bold text-slate-800 font-mono mt-2 tracking-tight">{vehicle.plateNumber}</h3>
                                        <p className="text-xs text-slate-500 flex items-center mt-1">
                                            <Tag size={12} className="mr-1"/> {vehicle.color} {vehicle.model}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-lg text-sm inline-flex items-center">
                                            <Clock size={14} className="mr-1"/>
                                            {diffHrs}:{minsRemainder.toString().padStart(2, '0')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Entry Time</span>
                                        <span className="font-medium text-slate-700">{vehicle.entryTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Current Rate</span>
                                        <span className="font-bold text-indigo-600">${rates[vehicle.type]}/hr</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                                        <span className="font-bold text-slate-700">Est. Total</span>
                                        <span className="font-bold text-slate-900 text-lg">${currentCost.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleInitiateCheckout(vehicle)}
                                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-slate-200 group-hover:shadow-indigo-200"
                                >
                                    <Calculator size={18} className="mr-2" /> Checkout
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExitList;
