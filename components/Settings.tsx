
import React, { useState, useEffect } from 'react';
import { useParking } from '../store';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Lock, X, CheckCircle, Save, Coins, Building, Plus, Users, UserPlus, Edit2, Upload, User as UserIcon } from 'lucide-react';
import { VehicleType, ParkingRates, UserRole, User, Branch, Zone } from '../types';

const Settings: React.FC = () => {
  const { resetSystem, rates, updateRates, user, branches, addBranch, updateBranch, removeBranch, allUsers, registerUser, updateUser, removeUser } = useParking();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Rate Editing
  const [editingRates, setEditingRates] = useState<ParkingRates>(rates);
  const [hasChanges, setHasChanges] = useState(false);

  // --- Branch State ---
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState<{ id: string, name: string, zones: Zone[] }>({
      id: '', name: '', zones: [{ id: 'z1', name: 'Main Zone', capacity: 20, type: 'standard' }]
  });

  // --- User State ---
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<User>({
      id: '',
      username: '',
      role: 'staff',
      branchId: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      caption: '',
      avatarUrl: ''
  });

  useEffect(() => { setEditingRates(rates); }, [rates]);

  // --- Handlers: Rates ---
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

  // --- Handlers: Branches ---
  const openBranchModal = (branch?: Branch) => {
      if (branch) {
          setEditingBranchId(branch.id);
          setBranchForm({ id: branch.id, name: branch.name, zones: branch.zones || [] });
      } else {
          setEditingBranchId(null);
          setBranchForm({ id: '', name: '', zones: [{ id: 'z1', name: 'Zone A', capacity: 20, type: 'standard' }] });
      }
      setShowBranchModal(true);
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const totalCap = branchForm.zones.reduce((sum, z) => sum + z.capacity, 0);
      
      const branchData: Branch = {
          id: branchForm.id,
          name: branchForm.name,
          capacity: totalCap,
          zones: branchForm.zones
      };

      if (editingBranchId) {
          updateBranch(editingBranchId, branchData);
          setFeedback({ type: 'success', message: 'Branch updated successfully.' });
      } else {
          // Check for Duplicate ID
          if (branches.some(b => b.id === branchForm.id)) {
              alert("Branch ID already exists! Please use a unique ID.");
              return;
          }
          addBranch(branchData);
          setFeedback({ type: 'success', message: 'New branch created successfully.' });
      }
      setShowBranchModal(false);
  };

  const addZone = () => {
      setBranchForm(prev => ({
          ...prev,
          zones: [...prev.zones, { id: `z${prev.zones.length + 1}`, name: 'New Zone', capacity: 10, type: 'standard' }]
      }));
  };

  const updateZone = (index: number, field: keyof Zone, value: any) => {
      const newZones = [...branchForm.zones];
      newZones[index] = { ...newZones[index], [field]: value };
      setBranchForm(prev => ({ ...prev, zones: newZones }));
  };

  const removeZone = (index: number) => {
      if (branchForm.zones.length > 1) {
          setBranchForm(prev => ({ ...prev, zones: prev.zones.filter((_, i) => i !== index) }));
      }
  };

  // --- Handlers: Users ---
  const openUserModal = (userData?: User) => {
      if (userData) {
          setEditingUserId(userData.id);
          setUserForm({ ...userData });
      } else {
          setEditingUserId(null);
          setUserForm({
              id: Math.random().toString(36).substr(2, 9),
              username: '', role: 'staff', branchId: branches[0]?.id || '',
              fullName: '', email: '', phoneNumber: '', caption: '', avatarUrl: ''
          });
      }
      setShowUserModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUserForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUserId) {
          updateUser(editingUserId, userForm);
          setFeedback({ type: 'success', message: `User ${userForm.username} updated.` });
      } else {
          registerUser(userForm);
          setFeedback({ type: 'success', message: `User ${userForm.username} registered.` });
      }
      setShowUserModal(false);
  };

  // --- Handlers: Reset ---
  const handleResetClick = () => { setShowAuthModal(true); setPin(''); setError(''); };
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
        resetSystem();
        setShowAuthModal(false);
        setFeedback({ type: 'success', message: 'System data for current branch reset.' });
    } else {
        setError('Incorrect Admin PIN.');
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative pb-12">
       {/* Feedback Modal */}
       {feedback && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-8 text-center">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {feedback.type === 'success' ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">{feedback.type === 'success' ? 'Success' : 'Error'}</h3>
             <p className="text-slate-500 mb-8">{feedback.message}</p>
             <button onClick={() => setFeedback(null)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl">OK</button>
           </div>
         </div>
       )}

       {/* Admin PIN Modal */}
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

       {/* Branch Modal (Create/Edit) */}
       {showBranchModal && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="bg-slate-900 p-5 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-bold flex items-center text-lg"><Building size={20} className="mr-2 text-emerald-400"/> {editingBranchId ? 'Edit Branch' : 'Add New Branch'}</h3>
                    <button onClick={() => setShowBranchModal(false)}><X size={20}/></button>
                 </div>
                 <form onSubmit={handleBranchSubmit} className="p-6 overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-2 gap-4 mb-6">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch ID</label>
                             <input type="text" value={branchForm.id} onChange={e => setBranchForm({...branchForm, id: e.target.value})} disabled={!!editingBranchId} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100" placeholder="e.g. b1" required />
                             <p className="text-xs text-slate-400 mt-1">Unique Identifier</p>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch Name</label>
                             <input type="text" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Downtown" required />
                         </div>
                     </div>
                     
                     <div className="mb-2 flex justify-between items-center">
                         <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Parking Zones</h4>
                         <button type="button" onClick={addZone} className="text-xs flex items-center bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 font-bold"><Plus size={14} className="mr-1"/> Add Zone</button>
                     </div>
                     <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                         {branchForm.zones.map((zone, idx) => (
                             <div key={idx} className="flex gap-3 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                 <input type="text" value={zone.name} onChange={e => updateZone(idx, 'name', e.target.value)} className="flex-1 px-3 py-2 rounded border border-slate-300 text-sm" placeholder="Zone Name" required />
                                 <input type="number" value={zone.capacity} onChange={e => updateZone(idx, 'capacity', parseInt(e.target.value))} className="w-20 px-3 py-2 rounded border border-slate-300 text-sm" placeholder="Cap" required min="1"/>
                                 <select value={zone.type} onChange={e => updateZone(idx, 'type', e.target.value)} className="w-28 px-2 py-2 rounded border border-slate-300 text-sm bg-white">
                                     <option value="standard">Standard</option>
                                     <option value="priority">Priority</option>
                                 </select>
                                 <button type="button" onClick={() => removeZone(idx)} disabled={branchForm.zones.length === 1} className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30"><Trash2 size={16}/></button>
                             </div>
                         ))}
                     </div>
                     <div className="mt-4 text-right text-sm text-slate-500">
                         Total Capacity: <span className="font-bold text-slate-800">{branchForm.zones.reduce((sum, z) => sum + z.capacity, 0)} slots</span>
                     </div>
                     <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">{editingBranchId ? 'Update Branch' : 'Create Branch'}</button>
                     </div>
                 </form>
             </div>
           </div>
       )}

       {/* User Modal (Create/Edit) */}
       {showUserModal && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="bg-slate-900 p-5 flex justify-between items-center text-white shrink-0">
                 <h3 className="font-bold flex items-center text-lg"><UserPlus size={20} className="mr-2 text-indigo-400"/> {editingUserId ? 'Edit Employee' : 'Register New Employee'}</h3>
                 <button onClick={() => setShowUserModal(false)}><X size={20} /></button>
               </div>
               <form onSubmit={handleUserSubmit} className="p-6 overflow-y-auto custom-scrollbar">
                 <div className="flex gap-6 flex-col md:flex-row">
                     {/* Avatar Upload */}
                     <div className="flex flex-col items-center space-y-3">
                         <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                             {userForm.avatarUrl ? (
                                 <img src={userForm.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                                 <UserIcon size={32} className="text-slate-300" />
                             )}
                             <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                 <Upload className="text-white" size={24} />
                                 <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                             </label>
                         </div>
                         <span className="text-xs text-slate-400">Click to upload photo</span>
                     </div>

                     <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input type="text" required value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} disabled={!!editingUserId} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select 
                                    value={userForm.role} 
                                    onChange={e => {
                                        const newRole = e.target.value as UserRole;
                                        setUserForm({
                                            ...userForm, 
                                            role: newRole, 
                                            branchId: newRole === 'admin' ? '' : (branches[0]?.id || '')
                                        });
                                    }} 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input type="text" value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                                <input type="text" value={userForm.caption} onChange={e => setUserForm({...userForm, caption: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" placeholder="e.g. Manager" />
                            </div>
                        </div>
                        
                        {userForm.role === 'staff' && (
                            <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Branch</label>
                                 <select value={userForm.branchId} onChange={e => setUserForm({...userForm, branchId: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
                                     {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                 </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                             <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Email" />
                             <input type="tel" value={userForm.phoneNumber} onChange={e => setUserForm({...userForm, phoneNumber: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Phone" />
                        </div>
                     </div>
                 </div>
                 <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
                     <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 shadow-md">{editingUserId ? 'Save Changes' : 'Register Employee'}</button>
                 </div>
               </form>
             </div>
           </div>
       )}

      {/* 1. Branch Management List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <Building className="text-indigo-600" />
                 <h2 className="text-xl font-bold text-slate-800">Branch Management</h2>
             </div>
             <button onClick={() => openBranchModal()} className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
                 <Plus size={16} /> Add Branch
             </button>
         </div>
         <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {branches.map(b => (
                 <div key={b.id} className="p-5 border border-slate-200 rounded-xl relative group hover:shadow-lg transition-all bg-white">
                     <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-slate-800 text-lg">{b.name}</h4>
                         <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-500">{b.id}</span>
                     </div>
                     <p className="text-sm text-slate-500 mb-3">{b.capacity} Total Slots</p>
                     
                     <div className="space-y-1 mb-4">
                        {(b.zones || []).map(z => (
                            <div key={z.id} className="flex justify-between text-xs bg-slate-50 p-1.5 rounded">
                                <span className="font-medium">{z.name}</span>
                                <span className={z.type === 'priority' ? 'text-amber-600 font-bold' : 'text-slate-500'}>{z.capacity}</span>
                            </div>
                        ))}
                     </div>

                     <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openBranchModal(b)} className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 flex items-center justify-center"><Edit2 size={14} className="mr-1"/> Edit</button>
                         {branches.length > 1 && (
                            <button onClick={() => removeBranch(b.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button>
                         )}
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* 2. Team Management List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Users className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">Team Management</h2>
            </div>
            <button onClick={() => openUserModal()} className="flex items-center gap-2 text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                <UserPlus size={16} /> Register Employee
            </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUsers.map(u => (
                <div key={u.id} className="flex items-start space-x-4 p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow relative group">
                    <img 
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                        alt={u.username} 
                        className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 truncate">{u.fullName || u.username}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.role}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate">{u.caption || 'No Title'}</p>
                        
                        <div className="mt-2 space-y-1">
                            {u.role === 'staff' && (
                                <div className="text-xs text-slate-400 flex items-center">
                                    <Building size={10} className="mr-1"/> {branches.find(b => b.id === u.branchId)?.name || 'Unassigned'}
                                </div>
                            )}
                            <div className="text-xs text-slate-400 truncate">@{u.username}</div>
                        </div>

                         <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => openUserModal(u)} className="p-1.5 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded shadow-sm"><Edit2 size={14}/></button>
                             {u.username !== user?.username && (
                                <button onClick={() => removeUser(u.id)} className="p-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 rounded shadow-sm"><Trash2 size={14}/></button>
                             )}
                         </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. Global Rates */}
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

        {/* 4. Danger Zone */}
        <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 overflow-hidden h-fit">
            <div className="p-6">
                <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center"><AlertTriangle size={20} className="mr-2"/> Danger Zone</h3>
                <p className="text-red-600/80 text-sm mb-6">Resetting will clear vehicles and transactions for the <span className="font-bold underline">Current Branch Only</span>.</p>
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
