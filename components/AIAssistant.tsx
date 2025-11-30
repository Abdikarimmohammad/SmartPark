import React, { useState } from 'react';
import { useParking } from '../store';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, Loader2 } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const { slots, activeVehicles, transactions } = useParking();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!process.env.API_KEY) {
        setResponse("Error: API Key not found in environment.");
        return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare context data
      const contextData = {
        totalSlots: slots.length,
        occupied: slots.filter(s => s.isOccupied).length,
        activeVehicles: activeVehicles.map(v => ({ type: v.type, entry: v.entryTime })),
        recentTransactions: transactions.slice(0, 10), // Limit to last 10 for brevity
      };

      const prompt = `
        You are an intelligent assistant for a Parking Lot Management System named "SmartPark".
        
        Here is the current real-time data of the parking lot:
        ${JSON.stringify(contextData, null, 2)}
        
        Answer the user's question based on this data. Be concise, professional, and helpful.
        If the user asks for analysis (e.g., peak times, revenue trends), infer from the data provided.
        
        User Question: "${query}"
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setResponse(result.text || "I couldn't generate a response. Please try again.");
    } catch (error) {
      console.error(error);
      setResponse("Sorry, I encountered an error processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="text-yellow-300" />
          <h2 className="text-2xl font-bold">SmartPark AI Assistant</h2>
        </div>
        <p className="text-indigo-100 mb-6">
          Ask me anything about current occupancy, revenue trends, or vehicle distribution. I analyze real-time data to help you manage better.
        </p>

        <form onSubmit={handleAsk} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'How many cars are parked right now?' or 'What is the revenue today?'"
            className="w-full pl-6 pr-14 py-4 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-xl"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white transition-colors disabled:bg-slate-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>

      {response && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-fade-in">
          <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">AI Response</h3>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-800 text-lg leading-relaxed">{response}</p>
          </div>
        </div>
      )}

      {/* Suggested Questions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['What is the current occupancy rate?', 'How much revenue have we made today?', 'Are there any trucks parked?'].map((q, i) => (
            <button 
                key={i}
                onClick={() => { setQuery(q); }}
                className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors text-left"
            >
                "{q}"
            </button>
        ))}
      </div>
    </div>
  );
};

export default AIAssistant;