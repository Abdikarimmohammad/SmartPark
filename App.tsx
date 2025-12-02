
import React, { useState } from 'react';
import { LayoutDashboard, PlusSquare, Map, List, FileText, Sparkles, Menu, X, Settings as SettingsIcon, LogOut, Building, User, ChevronDown, Mail, Phone } from 'lucide-react';
import { ParkingProvider, useParking } from './store';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import ExitList from './components/ExitList';
import ParkingLot from './components/ParkingLot';
import HistoryLog from './components/HistoryLog';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import { ViewState } from './types';

const LoginScreen: React.FC = () => {
    const { login } = useParking();
    const [username, setUsername] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(username);
        if (!success) setError(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 text-white">
                        <LayoutDashboard size={40} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">SmartPark</h1>
                    <p className="text-slate-500 mt-2">Enterprise Management System</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => { setUsername(e.target.value); setError(false); }}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                            placeholder="e.g. admin, staff_downtown"
                            autoFocus
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center">
                            Invalid credentials. User not found.
                        </div>
                    )}

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200">
                        Login to System
                    </button>

                    <div className="text-center text-xs text-slate-400 mt-4">
                        Default Users: <b>admin</b>, <b>staff_downtown</b>
                    </div>
                </form>
            </div>
        </div>
    );
}

const MainApp: React.FC = () => {
  const { user, logout, branches, currentBranch, switchBranch } = useParking();
  const [view, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'entry', label: 'Vehicle Entry', icon: <PlusSquare size={20} /> },
    { id: 'map', label: 'Parking Map', icon: <Map size={20} /> },
    { id: 'exit', label: 'Checkout', icon: <List size={20} /> },
    { id: 'history', label: 'Reports', icon: <FileText size={20} /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Sparkles size={20} /> },
  ];
  
  // Only Admin sees Settings
  if (user?.role === 'admin') {
      navItems.push({ id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> });
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={setView} />;
      case 'entry': return <EntryForm />;
      case 'map': return <ParkingLot />;
      case 'history': return <HistoryLog />;
      case 'assistant': return <AIAssistant />;
      case 'settings': return <Settings />;
      default: return <ExitList />; 
    }
  };

  return (
      <div className="flex min-h-screen font-sans">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-indigo-950 via-slate-900 to-black text-slate-300 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none border-r border-white/5
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-0 left-0 w-full h-24 bg-indigo-500/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl"></div>

            {/* Brand Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/10 relative z-10">
              <div className="flex items-center space-x-3 text-white">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                   <span className="text-xl font-bold tracking-tight block leading-none bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">SmartPark</span>
                   <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Enterprise</span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Branch Switcher / Display */}
            <div className="px-6 py-6 relative z-20">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400/70">Current Branch</div>
                
                {user?.role === 'admin' ? (
                    <div className="relative">
                        <button 
                            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 flex items-center justify-between text-white transition-colors"
                        >
                            <div className="flex items-center truncate">
                                <Building size={16} className="mr-2 text-emerald-400 shrink-0"/>
                                <span className="font-bold text-sm truncate">{currentBranch?.name || 'Select Branch'}</span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`}/>
                        </button>
                        
                        {isBranchDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                                <button
                                    onClick={() => { switchBranch('all'); setIsBranchDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center border-b border-white/5 ${currentBranch?.id === 'all' ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-300'}`}
                                >
                                    <Building size={14} className="mr-2"/>
                                    All Branches (Overview)
                                </button>
                                {branches.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => { switchBranch(b.id); setIsBranchDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex items-center ${currentBranch?.id === b.id ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-300'}`}
                                    >
                                        <Building size={14} className="mr-2"/>
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full bg-white/5 border border-white/5 rounded-xl p-3 flex items-center text-slate-300 cursor-default">
                        <Building size={16} className="mr-2 text-slate-500"/>
                        <span className="font-bold text-sm">{currentBranch?.name || 'Assigned Branch'}</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
              <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400/70">Main Menu</div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id as ViewState | 'exit');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                    view === item.id 
                      ? 'text-white shadow-lg shadow-indigo-900/40 overflow-hidden' 
                      : 'hover:bg-white/5 hover:text-white text-slate-400'
                  }`}
                >
                  {view === item.id && (
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl"></div>
                  )}
                  <span className={`relative z-10 ${view === item.id ? 'text-white' : 'group-hover:text-indigo-300'} transition-colors`}>{item.icon}</span>
                  <span className="relative z-10 font-medium tracking-wide">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/10 relative z-10 bg-black/20">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                   {user?.avatarUrl ? (
                       <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full shadow-lg border-2 border-indigo-500/50 object-cover" />
                   ) : (
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm uppercase shadow-lg">
                           {user?.username.substr(0, 2)}
                       </div>
                   )}
                   <div className="overflow-hidden flex-1">
                       <div className="text-sm font-bold text-white truncate">{user?.fullName || user?.username}</div>
                       <div className="text-[10px] text-indigo-300 uppercase tracking-wide truncate font-bold">{user?.caption || user?.role}</div>
                   </div>
                   <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors" title="Logout">
                       <LogOut size={16} />
                   </button>
                </div>
                
                {(user?.email || user?.phoneNumber) && (
                    <div className="pt-3 border-t border-white/5 space-y-1">
                        {user.email && (
                            <div className="flex items-center text-[10px] text-slate-400">
                                <Mail size={10} className="mr-2 opacity-50"/> {user.email}
                            </div>
                        )}
                        {user.phoneNumber && (
                            <div className="flex items-center text-[10px] text-slate-400">
                                <Phone size={10} className="mr-2 opacity-50"/> {user.phoneNumber}
                            </div>
                        )}
                    </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-blue-50 relative">
          
          {/* Mobile Header */}
          <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-indigo-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center space-x-3">
               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1.5 rounded-lg text-white">
                  <LayoutDashboard size={20} />
                </div>
               <span className="font-bold text-slate-800 text-lg">SmartPark</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth relative z-0">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto animate-fade-in-up pb-10">
              {/* Header */}
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {navItems.find(i => i.id === view)?.label || 'SmartPark'}
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm md:text-base font-medium">
                      {currentBranch ? `Viewing: ${currentBranch.name} (${currentBranch.capacity} Slots)` : 'Select a branch'}
                  </p>
                </div>
              </div>
              
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
  );
};

const App: React.FC = () => {
    const { user } = useParking();
    return user ? <MainApp /> : <LoginScreen />;
};

const Root: React.FC = () => (
    <ParkingProvider>
        <App />
    </ParkingProvider>
);

export default Root;
