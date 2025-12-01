
import React, { useState, useEffect } from 'react';
import { useParking } from '../store';
import { TOTAL_SLOTS } from '../constants';
import { Settings as SettingsIcon, Trash2, AlertTriangle, ShieldCheck, Lock, X, CheckCircle, Save, Coins, Building, Plus } from 'lucide-react';
import { VehicleType, ParkingRates } from '../types';

const Settings: React.FC = () => {
  const { resetSystem, activeVehicles, transactions, rates, updateRates, user, branches, addBranch, removeBranch } = useParking();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Rate Editing
  const [editingRates, setEditingRates] = useState<ParkingRates>(rates);
  const [hasChanges, setHasChanges] = useState(false);

  // New Branch State
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCap, setNewBranchCap] = useState(40);

  useEffect(() => { setEditingRates(rates); }, [rates]);

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

  const handleAddBranch = (e: React.FormEvent) => {
      e.preventDefault();
      if(newBranchName && newBranchCap > 0) {
          addBranch(newBranchName, newBranchCap);
          setNewBranchName('');
          setNewBranchCap(40);
          setFeedback({ type: 'success', message: 'New branch added successfully.' });
      }
  };

  const handleResetClick = () => {
    setShowAuthModal(true);
    setPin('');
    setError('');
    setFeedback(null);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
        resetSystem();
        setShowAuthModal(false);
        setFeedback({
            type: 'success',
            message: 'System data for the current branch has been reset.'
        });
    } else {
        setError('Incorrect Admin PIN. Access Denied.');
        setPin(''); 
    }
  };

  if (user?.role !== 'admin') {
      return (
          <div className="p-8 bg-white rounded-xl text-center shadow">
              <Lock className="mx-auto text-slate-400 mb-4" size={48} />
              <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
              <p className="text-slate-500">Only administrators can access global settings.</p>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative">
       {/* Feedback Modal */}
       {feedback && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden p-8 text-center">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {feedback.type === 'success' ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">{feedback.type === 'success' ? 'Success' : 'Error'}</h3>
             <p className="text-slate-500 mb-8">{feedback.message}</p>
             <button onClick={() => setFeedback(null)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl">OK</button>
           </div>
         </div>
       )}

       {/* Auth Modal */}
       {showAuthModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
             <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
               <h3 className="font-bold flex items-center"><Lock size={18} className="mr-2 text-red-400"/> Admin Verification</h3>
               <button onClick={() => setShowAuthModal(false)}><X size={20} /></button>
             </div>
             <form onSubmit={handleVerify} className="p-6">
               <p className="text-slate-600 text-sm mb-4 text-center">Enter Admin PIN (Default: 1234)</p>
               {error && <div className="bg-red-50 text-red-600 text-sm p-2 mb-4 rounded border border-red-100">{error}</div>}
               <input type="password" value={pin} onChange={e => setPin(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 text-center text-2xl tracking-widest font-mono mb-4" placeholder="****" maxLength={4} autoFocus />
               <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg">Verify</button>
             </form>
           </div>
         </div>
       )}

      {/* 1. Branch Management (New) */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <Building className="text-indigo-600" />
                 <h2 className="text-xl font-bold text-slate-800">Branch Management</h2>
             </div>
             <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{branches.length} Active Locations</span>
         </div>
         <div className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                 {branches.map(b => (
                     <div key={b.id} className="p-4 border border-slate-200 rounded-xl relative group hover:shadow-md transition-shadow">
                         <h4 className="font-bold text-slate-800">{b.name}</h4>
                         <p className="text-sm text-slate-500">{b.capacity} Slots</p>
                         <div className="mt-2 text-xs text-slate-400 font-mono">ID: {b.id}</div>
                         {branches.length > 1 && (
                             <button onClick={() => removeBranch(b.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 size={16} />
                             </button>
                         )}
                     </div>
                 ))}
             </div>
             
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center"><Plus size={16} className="mr-2"/> Add New Branch</h4>
                 <form onSubmit={handleAddBranch} className="flex flex-col md:flex-row gap-4 items-end">
                     <div className="flex-1 w-full">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch Name</label>
                         <input type="text" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. North Station" required />
                     </div>
                     <div className="w-full md:w-32">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacity</label>
                         <input type="number" value={newBranchCap} onChange={e => setNewBranchCap(parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="40" min="10" max="500" required />
                     </div>
                     <button type="submit" className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">Create Branch</button>
                 </form>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Rates */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Coins className="text-indigo-600"/> Global Pricing</h2>
            </div>
            <div className="p-6 space-y-4">
                {Object.values(VehicleType).map((type) => (
                    <div key={type} className="flex items-center justify-between">
                        <label className="font-medium text-slate-600 w-1/3">{type}</label>
                        <div className="flex items-center relative w-2/3">
                            <span className="absolute left-3 text-slate-400">$</span>
                            <input type="number" min="0" step="0.5" value={editingRates[type]} onChange={(e) => handleRateChange(type, e.target.value)} className="w-full pl-7 pr-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                            <span className="ml-2 text-slate-400 text-sm">/hr</span>
                        </div>
                    </div>
                ))}
                <button onClick={saveRates} disabled={!hasChanges} className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md">
                    <Save size={18} className="inline mr-2" /> Save Rates
                </button>
            </div>
        </div>

        {/* 3. Danger Zone */}
        <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 overflow-hidden h-fit">
            <div className="p-6">
                <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center"><AlertTriangle size={20} className="mr-2"/> Danger Zone</h3>
                <p className="text-red-600/80 text-sm mb-6">Resetting will clear vehicles and transactions for the <span className="font-bold underline">Selected Branch Only</span>. Global branches and settings remain.</p>
                <button onClick={handleResetClick} className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm">
                    <Trash2 size={18} className="inline mr-2"/> Reset Current Branch Data
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
