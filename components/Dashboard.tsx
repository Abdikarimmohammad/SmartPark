
import React from 'react';
import { useParking } from '../store';
import { TOTAL_SLOTS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend } from 'recharts';
import { Car, DollarSign, Clock, Percent, Activity, TrendingUp, Users, MapPin, Plus, ArrowRightCircle, Building } from 'lucide-react';
import { ActivityType, ViewState } from '../types';

const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    gradient: string; 
    subtext?: string;
    onClick?: () => void;
}> = ({ title, value, icon, gradient, subtext, onClick }) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl shadow-lg border-0 p-6 text-white ${gradient} transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:shadow-2xl' : ''}`}
  >
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-white/80 font-bold text-xs uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold mt-1 drop-shadow-sm">{value}</h3>
        {subtext && <p className="text-xs text-white/90 mt-2 flex items-center font-medium bg-white/20 inline-block px-2 py-0.5 rounded">{subtext}</p>}
      </div>
      <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-inner text-white">
        {icon}
      </div>
    </div>
    {/* Decorative Circle */}
    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
  </div>
);

const ActivityItem: React.FC<{ type: ActivityType; message: string; time: Date; plate?: string }> = ({ type, message, time, plate }) => (
    <div className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0 group hover:bg-slate-50 p-2 rounded-lg transition-colors">
        <div className={`mt-1 p-2 rounded-lg shadow-sm ${type === 'entry' ? 'bg-emerald-100 text-emerald-600' : type === 'exit' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
            {type === 'entry' ? <Car size={14} /> : type === 'exit' ? <DollarSign size={14} /> : <Activity size={14} />}
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-800">{message}</p>
              <span className="text-[10px] text-slate-400 font-mono">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            {plate && (
              <span className="inline-block mt-1 text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded text-slate-600 border border-slate-200 shadow-sm">
                {plate}
              </span>
            )}
        </div>
    </div>
);

interface DashboardProps {
    onNavigate: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { slots, activeVehicles, transactions, recentLogs, currentBranch } = useParking();

  const isOverview = currentBranch?.id === 'all';

  // In overview mode, slots logic is bypassed, use activeVehicles length for occupancy
  const occupiedCount = isOverview ? activeVehicles.length : slots.filter(s => s.isOccupied).length;
  const totalCurrentSlots = currentBranch?.capacity || 0;
  const availableCount = totalCurrentSlots - occupiedCount;
  const occupancyRate = totalCurrentSlots > 0 ? Math.round((occupiedCount / totalCurrentSlots) * 100) : 0;
  
  const todayRevenue = transactions
    .filter(t => t.exitTime.toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.finalAmount, 0);

  // Mock Trend Data
  const revenueTrendData = [
    { name: '08:00', amount: 120 },
    { name: '10:00', amount: 250 },
    { name: '12:00', amount: 480 },
    { name: '14:00', amount: 390 },
    { name: '16:00', amount: 560 },
    { name: '18:00', amount: currentRevenueMock(todayRevenue) },
  ];

  function currentRevenueMock(actual: number) {
      return actual > 0 ? actual : 150; 
  }

  const vehicleTypeData = [
    { name: 'Cars', value: activeVehicles.filter(v => v.type === 'Car').length },
    { name: 'Bikes', value: activeVehicles.filter(v => v.type === 'Bike').length },
    { name: 'Trucks', value: activeVehicles.filter(v => v.type === 'Truck').length },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b']; // Indigo, Emerald, Amber

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Current Occupancy" 
          value={occupiedCount} 
          icon={<Car size={24} />} 
          gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
          subtext={`${availableCount} slots available`}
          onClick={() => !isOverview && onNavigate('map')}
        />
        <StatCard 
          title="Daily Revenue" 
          value={`$${todayRevenue.toFixed(2)}`} 
          icon={<DollarSign size={24} />} 
          gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
          subtext="Total across selected"
          onClick={() => onNavigate('history')}
        />
        <StatCard 
          title="Efficiency Rate" 
          value={`${occupancyRate}%`} 
          icon={<Activity size={24} />} 
          gradient="bg-gradient-to-br from-violet-500 to-purple-700"
          subtext="Peak hour approaching"
        />
        <StatCard 
          title="Total Transactions" 
          value={transactions.length} 
          icon={<TrendingUp size={24} />} 
          gradient="bg-gradient-to-br from-amber-500 to-orange-700"
          subtext="Lifetime volume"
          onClick={() => onNavigate('history')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
            {/* Revenue Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Revenue Analytics</h3>
                        <p className="text-sm text-slate-500 font-medium">Real-time earnings tracking over the day</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                        Today
                    </div>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrendData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Vehicle Composition */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Fleet Composition</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={vehicleTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {vehicleTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                                <Legend verticalAlign="bottom" iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex flex-col justify-center space-y-4">
                        {vehicleTypeData.map((item, idx) => (
                             <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                 <div className="flex items-center space-x-3">
                                     <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: COLORS[idx]}}></div>
                                     <span className="font-semibold text-slate-700">{item.name}</span>
                                 </div>
                                 <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded shadow-sm border border-slate-100">{item.value}</span>
                             </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-6">
             {/* Quick Actions Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    {isOverview ? (
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                            <Building size={24} className="mx-auto mb-2 text-slate-400" />
                            Select a specific branch to perform operations like Vehicle Entry or Map Management.
                        </div>
                    ) : (
                        <button 
                            onClick={() => onNavigate('entry')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-800 hover:from-blue-100 hover:to-indigo-100 transition-all group shadow-sm"
                        >
                            <div className="text-left">
                                <span className="font-bold block text-lg">Park Vehicle</span>
                                <span className="text-xs text-blue-600 font-medium">Select slot & check-in</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-full shadow-md text-blue-600 group-hover:scale-110 transition-transform group-hover:text-indigo-600">
                                <ArrowRightCircle size={24} />
                            </div>
                        </button>
                    )}
                    <div className="text-xs text-center text-slate-500 font-medium mt-2 bg-slate-100 py-1 rounded-lg">
                        {availableCount} slots currently available
                    </div>
                </div>
            </div>

            {/* Live Feed */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500"></div>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                    <span>Live Activity</span>
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {recentLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Activity size={32} className="mb-2 opacity-20"/>
                            <p className="text-sm font-medium">No recent logs.</p>
                        </div>
                    ) : (
                        recentLogs.map((log) => (
                            <ActivityItem 
                                key={log.id} 
                                type={log.type} 
                                message={log.message} 
                                time={log.timestamp} 
                                plate={log.vehiclePlate}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Quick Status */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between border border-white/10">
                <div>
                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">System Status</p>
                    <h3 className="text-xl font-bold mt-1 tracking-tight">Operational</h3>
                </div>
                <div className="bg-white/10 p-3 rounded-full animate-pulse shadow-inner">
                    <Activity size={24} className="text-emerald-400" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
