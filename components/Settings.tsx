import React, { useState, useEffect } from 'react';
import { useParking } from '../store';
import { TOTAL_SLOTS } from '../constants';
import { Settings as SettingsIcon, Trash2, AlertTriangle, ShieldCheck, Lock, X, CheckCircle, Save, Coins } from 'lucide-react';
import { VehicleType, ParkingRates } from '../types';

const Settings: React.FC = () => {
  const { resetSystem, slots, activeVehicles, transactions, rates, updateRates } = useParking();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Rate Editing State
  const [editingRates, setEditingRates] = useState<ParkingRates>(rates);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditingRates(rates);
  }, [rates]);

  const handleRateChange = (type: VehicleType, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
        const newRates = { ...editingRates, [type]: numValue };
        setEditingRates(newRates);
        setHasChanges(JSON.stringify(newRates) !== JSON.stringify(rates));
    }
  };

  const saveRates = () => {
      updateRates(editingRates);
      setHasChanges(false);
      setFeedback({ type: 'success', message: 'Parking rates have been updated successfully.' });
  };

  const handleResetClick = () => {
    setShowAuthModal(true);
    setPin('');
    setError('');
    setFeedback(null);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded PIN for demonstration
    if (pin === '1234') {
        resetSystem();
        setShowAuthModal(false);
        setFeedback({
            type: 'success',
            message: 'System data has been successfully reset to factory defaults.'
        });
    } else {
        setError('Incorrect Admin PIN. Access Denied.');
        setPin(''); // Clear PIN for retry
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
       {/* Feedback Modal (Success/Notification) */}
       {feedback && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden relative transform transition-all scale-100 p-8 text-center">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {feedback.type === 'success' ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
             </div>
             
             <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {feedback.type === 'success' ? 'Operation Successful' : 'Action Failed'}
             </h3>
             <p className="text-slate-500 mb-8 leading-relaxed">
                {feedback.message}
             </p>
             
             <button 
                onClick={() => setFeedback(null)}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
             >
               OK, Got it
             </button>
           </div>
         </div>
       )}

       {/* Admin Auth Modal */}
       {showAuthModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden relative transform transition-all scale-100">
             <div className="bg-slate-900 p-4 flex justify-between items-center">
               <h3 className="text-white font-bold flex items-center text-lg">
                 <Lock size={18} className="mr-2 text-red-400"/> Admin Verification
               </h3>
               <button 
                 onClick={() => setShowAuthModal(false)}
                 className="text-slate-400 hover:text-white transition-colors"
               >
                 <X size={20} />
               </button>
             </div>
             
             <form onSubmit={handleVerify} className="p-6">
               <div className="mb-6 text-center">
                 <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck size={24} />
                 </div>
                 <p className="text-slate-600 text-sm">
                   Restricted Area. Please enter the Administrator PIN to perform a system reset.
                 </p>
               </div>
               
               {error && (
                 <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center border border-red-100 animate-pulse">
                   <AlertTriangle size={16} className="mr-2 shrink-0"/>
                   {error}
                 </div>
               )}
               
               <div className="space-y-4">
                 <div>
                    <input 
                        type="password" 
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none text-center text-2xl tracking-[0.5em] font-mono transition-all placeholder:tracking-normal"
                        placeholder="Enter PIN"
                        maxLength={4}
                        autoFocus
                    />
                 </div>

                 <button 
                    type="submit" 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-slate-200"
                 >
                   Verify & Reset
                 </button>
               </div>
               
               <div className="text-center mt-6">
                 <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold border border-slate-200 px-2 py-1 rounded bg-slate-50">
                   Default PIN: 1234
                 </span>
               </div>
             </form>
           </div>
         </div>
       )}

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Gradient Header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="bg-white/10 p-2 rounded-lg text-indigo-300 backdrop-blur-sm">
             <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">System Configuration</h2>
            <p className="text-slate-400 text-sm">Manage pricing and operational parameters.</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rate Configuration Card */}
            <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                    <span className="flex items-center"><Coins size={18} className="mr-2 text-indigo-600"/> Hourly Rates Configuration</span>
                    {hasChanges && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-100">Unsaved Changes</span>
                    )}
                </h3>
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                    {Object.values(VehicleType).map((type) => (
                        <div key={type} className="flex items-center justify-between">
                            <label className="font-medium text-slate-600 w-1/3">{type}</label>
                            <div className="flex items-center relative w-2/3">
                                <span className="absolute left-3 text-slate-400">$</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    step="0.5"
                                    value={editingRates[type]}
                                    onChange={(e) => handleRateChange(type, e.target.value)}
                                    className="w-full pl-7 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                                />
                                <span className="ml-2 text-slate-400 text-sm">/hr</span>
                            </div>
                        </div>
                    ))}
                    <div className="pt-2">
                        <button 
                            onClick={saveRates}
                            disabled={!hasChanges}
                            className="w-full flex items-center justify-center py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            <Save size={18} className="mr-2" /> Save New Rates
                        </button>
                    </div>
                </div>
            </div>

            {/* Capacity & Stats Card */}
            <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <ShieldCheck size={18} className="mr-2 text-emerald-600"/> Facility Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <div className="text-3xl font-bold text-slate-800 mb-1">{TOTAL_SLOTS}</div>
                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Slots</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <div className="text-3xl font-bold text-indigo-600 mb-1">{activeVehicles.length}</div>
                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">Occupied</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center col-span-2">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">{transactions.length}</div>
                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">Lifetime Transactions</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <div className="p-6">
            <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                <AlertTriangle size={20} className="mr-2"/> Danger Zone
            </h3>
            <p className="text-red-600/80 text-sm mb-6 max-w-2xl">
                Performing these actions will permanently delete all vehicle records, transaction history, and reset settings to default. This cannot be undone.
            </p>

            <button 
                onClick={handleResetClick}
                className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-lg font-bold transition-colors flex items-center shadow-sm"
            >
                <Trash2 size={18} className="mr-2"/> Reset System Data
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;