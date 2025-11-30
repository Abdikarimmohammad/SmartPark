import React, { useState } from 'react';
import { LayoutDashboard, PlusSquare, Map, List, FileText, Sparkles, Menu, X, Settings as SettingsIcon } from 'lucide-react';
import { ParkingProvider } from './store';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import ExitList from './components/ExitList';
import ParkingLot from './components/ParkingLot';
import HistoryLog from './components/HistoryLog';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'entry', label: 'Vehicle Entry', icon: <PlusSquare size={20} /> },
    { id: 'map', label: 'Parking Map', icon: <Map size={20} /> },
    { id: 'exit', label: 'Checkout', icon: <List size={20} /> },
    { id: 'history', label: 'Reports', icon: <FileText size={20} /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Sparkles size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={setView} />;
      case 'entry': return <EntryForm />;
      case 'map': return <ParkingLot />;
      case 'history': return <HistoryLog />;
      case 'assistant': return <AIAssistant />;
      case 'settings': return <Settings />;
      // Treat 'exit' as a specific view handled by ExitList
      default: return <ExitList />; 
    }
  };

  return (
    <ParkingProvider>
      <div className="flex min-h-screen font-sans">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar - Deep Dark Gradient */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-indigo-950 via-slate-900 to-black text-slate-300 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none border-r border-white/5
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-0 left-0 w-full h-24 bg-indigo-500/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl"></div>

            <div className="p-6 flex items-center justify-between border-b border-white/10 relative z-10">
              <div className="flex items-center space-x-3 text-white">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                   <span className="text-xl font-bold tracking-tight block leading-none bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">SmartPark</span>
                   <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Manager</span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
              <div className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-indigo-400/70">Main Menu</div>
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
                   {/* Active state background gradient */}
                  {view === item.id && (
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl"></div>
                  )}
                  
                  <span className={`relative z-10 ${view === item.id ? 'text-white' : 'group-hover:text-indigo-300'} transition-colors`}>{item.icon}</span>
                  <span className="relative z-10 font-medium tracking-wide">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-white/10 relative z-10">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                   <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">System Online</span>
                </div>
                <div className="text-xs text-slate-500">
                  &copy; 2024 SmartPark Systems<br/>v2.1.0 (Stable)
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Soft Gradient Background */}
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
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto animate-fade-in-up pb-10">
              {/* Breadcrumb / Header */}
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {navItems.find(i => i.id === view)?.label || 'Checkout'}
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm md:text-base font-medium">Real-time parking lot management and analytics.</p>
                </div>
                <div className="hidden md:block text-right">
                   <div className="text-xs font-mono text-indigo-600 font-bold bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-indigo-100 shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                      {new Date().toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                   </div>
                </div>
              </div>
              
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </ParkingProvider>
  );
};

export default App;