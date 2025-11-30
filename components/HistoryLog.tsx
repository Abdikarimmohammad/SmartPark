
import React, { useState, useMemo } from 'react';
import { useParking } from '../store';
import { Download, Filter, Calendar, Printer, DollarSign, Clock, Car } from 'lucide-react';
import { VehicleType } from '../types';

const HistoryLog: React.FC = () => {
  const { transactions } = useParking();

  // Filter States
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedType, setSelectedType] = useState<VehicleType | 'All'>('All');

  // Filter Logic
  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
          const tDate = new Date(t.entryTime).setHours(0,0,0,0);
          const start = dateStart ? new Date(dateStart).setHours(0,0,0,0) : null;
          const end = dateEnd ? new Date(dateEnd).setHours(0,0,0,0) : null;
          
          const matchStart = start ? tDate >= start : true;
          const matchEnd = end ? tDate <= end : true;
          const matchType = selectedType === 'All' ? true : t.vehicleType === selectedType;

          return matchStart && matchEnd && matchType;
      });
  }, [transactions, dateStart, dateEnd, selectedType]);

  // Aggregation Logic
  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + t.finalAmount, 0);
  const avgDuration = filteredTransactions.length > 0 
      ? Math.round(filteredTransactions.reduce((acc, t) => acc + t.durationMinutes, 0) / filteredTransactions.length) 
      : 0;

  const handleExport = () => {
      const headers = ['Transaction ID', 'Plate Number', 'Type', 'Entry Time', 'Exit Time', 'Duration (mins)', 'Amount'];
      const rows = filteredTransactions.map(t => [
          t.id,
          t.plateNumber,
          t.vehicleType,
          t.entryTime.toISOString(),
          t.exitTime.toISOString(),
          t.durationMinutes,
          t.finalAmount
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `parking_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 printable-content">
        
      {/* 1. Analytics Summary Cards for Report */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center space-x-3 mb-2 opacity-80">
                  <div className="p-2 bg-white/10 rounded-lg"><DollarSign size={20} /></div>
                  <span className="text-sm font-bold uppercase tracking-wide">Total Revenue</span>
              </div>
              <div className="text-3xl font-extrabold tracking-tight mt-2">${totalRevenue.toFixed(2)}</div>
              <div className="text-xs mt-2 text-indigo-100 bg-white/10 inline-block px-2 py-0.5 rounded">For selected period</div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-2 text-indigo-600">
                   <div className="p-2 bg-indigo-50 rounded-lg"><Car size={20} /></div>
                  <span className="text-sm font-bold uppercase tracking-wide text-slate-500">Total Vehicles</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">{filteredTransactions.length}</div>
              <div className="text-xs mt-2 text-slate-400">Processed transactions</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-2 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-lg"><Clock size={20} /></div>
                  <span className="text-sm font-bold uppercase tracking-wide text-slate-500">Avg. Duration</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-800 mt-2">{avgDuration} <span className="text-base font-normal text-slate-500">min</span></div>
              <div className="text-xs mt-2 text-slate-400">Per vehicle stay</div>
          </div>
      </div>

      {/* 2. Advanced Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between no-print">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Date From</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                    <input 
                        type="date" 
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>
            <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Date To</label>
                 <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                    <input 
                        type="date" 
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>
            <div className="w-full md:w-48">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Vehicle Type</label>
                 <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as VehicleType | 'All')}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                     <option value="All">All Types</option>
                     {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
             <button 
                onClick={handleExport}
                disabled={filteredTransactions.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
            >
                <Download size={16} />
                <span>Export</span>
            </button>
             <button 
                onClick={() => window.print()}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors"
            >
                <Printer size={16} />
                <span>Print</span>
            </button>
          </div>
      </div>
      
      {/* 3. Data Table */}
      <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Time Log</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-right">Final Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center justify-center w-full">
                          <Filter size={32} className="mb-2 opacity-20"/>
                          <p>No transactions found matching criteria.</p>
                      </td>
                  </tr>
              ) : (
                  filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-indigo-50/50 transition-colors group">
                      <td className="px-6 py-4">
                          <div className="font-mono text-xs text-slate-400 bg-slate-100 inline-block px-1 rounded">ID: {t.id}</div>
                          <div className="text-sm font-bold text-slate-700 mt-1">Completed</div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                              <div className={`p-1.5 rounded-md ${
                                t.vehicleType === 'Car' ? 'bg-blue-100 text-blue-600' : 
                                t.vehicleType === 'Bike' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {t.vehicleType === 'Car' ? <Car size={14}/> : <Clock size={14}/>}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 font-mono tracking-wide">{t.plateNumber}</div>
                                <div className="text-xs text-slate-500">{t.vehicleType}</div>
                              </div>
                          </div>
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-xs text-slate-500">In: <span className="font-medium text-slate-700">{t.entryTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                          <div className="text-xs text-slate-500">Out: <span className="font-medium text-slate-700">{t.exitTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                          <div className="text-[10px] text-slate-400 mt-1">{t.entryTime.toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                          {t.durationMinutes} min
                      </td>
                      <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 shadow-sm">
                            ${t.finalAmount.toFixed(2)}
                          </span>
                      </td>
                  </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryLog;
