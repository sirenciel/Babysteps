
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { Syringe, Ruler, Weight, CalendarCheck, Globe, Settings2, ZoomIn, Info } from 'lucide-react';
import { GrowthRecord } from '../types';

const MOCK_DATA_METRIC: GrowthRecord[] = [
  { month: 0, weight: 3.3, height: 49, standardWeight: 3.3, standardHeight: 49.9 },
  { month: 1, weight: 4.5, height: 54, standardWeight: 4.5, standardHeight: 54.7 },
  { month: 2, weight: 5.8, height: 58, standardWeight: 5.6, standardHeight: 58.4 },
  { month: 3, weight: 6.7, height: 62, standardWeight: 6.4, standardHeight: 61.4 },
  { month: 4, weight: 7.2, height: 64, standardWeight: 7.0, standardHeight: 63.9 },
  { month: 5, weight: 7.8, height: 66, standardWeight: 7.5, standardHeight: 65.9 },
  { month: 6, weight: 8.2, height: 68, standardWeight: 7.9, standardHeight: 67.6 },
  { month: 7, weight: 8.5, height: 69, standardWeight: 8.3, standardHeight: 69.2 },
  { month: 8, weight: 8.8, height: 70, standardWeight: 8.6, standardHeight: 70.6 },
  { month: 9, weight: 9.2, height: 72, standardWeight: 8.9, standardHeight: 72.0 },
  { month: 10, weight: 9.5, height: 73, standardWeight: 9.2, standardHeight: 73.3 },
  { month: 11, weight: 9.8, height: 74, standardWeight: 9.4, standardHeight: 74.5 },
  { month: 12, weight: 10.1, height: 76, standardWeight: 9.6, standardHeight: 75.7 },
  { month: 15, weight: 10.8, height: 79, standardWeight: 10.3, standardHeight: 79.1 },
  { month: 18, weight: 11.5, height: 82, standardWeight: 10.9, standardHeight: 82.3 },
  { month: 24, weight: 12.8, height: 88, standardWeight: 12.2, standardHeight: 87.8 },
  { month: 30, weight: 13.7, height: 92, standardWeight: 13.3, standardHeight: 91.9 },
  { month: 36, weight: 14.8, height: 96, standardWeight: 14.3, standardHeight: 96.1 }, // 3 Years
  { month: 42, weight: 15.8, height: 100, standardWeight: 15.3, standardHeight: 99.9 },
  { month: 48, weight: 16.8, height: 104, standardWeight: 16.3, standardHeight: 103.3 }, // 4 Years
  { month: 54, weight: 17.9, height: 108, standardWeight: 17.3, standardHeight: 107.0 },
  { month: 60, weight: 19.0, height: 112, standardWeight: 18.3, standardHeight: 110.0 }, // 5 Years
];

// Vaccination Schedules
const VACCINES_WHO = [
  { age: "At Birth", name: "BCG", done: true },
  { age: "At Birth", name: "Hepatitis B 0", done: true },
  { age: "6 Weeks", name: "DTP-HepB-Hib 1", done: false },
  { age: "6 Weeks", name: "Pneumococcal 1", done: false },
  { age: "6 Weeks", name: "Rotavirus 1", done: false },
  { age: "10 Weeks", name: "DTP-HepB-Hib 2", done: false },
  { age: "14 Weeks", name: "DTP-HepB-Hib 3", done: false },
  { age: "9 Months", name: "Measles 1", done: false },
  { age: "12 Months", name: "JE (Japanese Encephalitis)", done: false },
  { age: "15-18 Months", name: "MMR 2 / DTP Booster", done: false },
  { age: "4-6 Years", name: "DTP-Polio Booster", done: false },
];

const VACCINES_CDC = [
  { age: "At Birth", name: "Hepatitis B 1", done: true },
  { age: "2 Months", name: "DTaP 1", done: false },
  { age: "2 Months", name: "Polio (IPV) 1", done: false },
  { age: "2 Months", name: "Hib 1", done: false },
  { age: "2 Months", name: "PCV15/20 1", done: false },
  { age: "2 Months", name: "Rotavirus 1", done: false },
  { age: "4 Months", name: "DTaP 2", done: false },
  { age: "6 Months", name: "DTaP 3", done: false },
  { age: "12-15 Months", name: "MMR 1", done: false },
  { age: "12-15 Months", name: "Varicella (Chickenpox) 1", done: false },
  { age: "4-6 Years", name: "DTaP 5", done: false },
  { age: "4-6 Years", name: "Polio (IPV) 4", done: false },
];

type UnitSystem = 'metric' | 'imperial';
type VaccineStandard = 'WHO' | 'CDC';

const CustomTooltip = ({ active, payload, label, unitSystem, activeTab, vaccineStandard }: any) => {
  if (active && payload && payload.length) {
    const userPayload = payload.find((p: any) => p.dataKey === activeTab);
    const standardPayload = payload.find((p: any) => p.dataKey.includes('standard'));
    
    const userValue = userPayload?.value;
    const standardValue = standardPayload?.value;
    const unit = activeTab === 'weight' ? (unitSystem === 'metric' ? 'kg' : 'lbs') : (unitSystem === 'metric' ? 'cm' : 'in');

    let statusNode = null;
    if (userValue !== undefined && standardValue !== undefined) {
        const diff = userValue - standardValue;
        const percent = (diff / standardValue) * 100;
        
        // Determine status logic (simplified)
        let statusText = "On Track";
        let statusColor = "text-green-600 bg-green-50";
        
        if (percent > 15) {
            statusText = "Above Average";
            statusColor = "text-blue-600 bg-blue-50";
        } else if (percent < -15) {
            statusText = "Below Average";
            statusColor = "text-orange-600 bg-orange-50";
        } else if (percent > 5) {
            statusText = "Slightly Above";
            statusColor = "text-teal-600 bg-teal-50";
        } else if (percent < -5) {
            statusText = "Slightly Below";
            statusColor = "text-yellow-600 bg-yellow-50";
        }

        statusNode = (
            <div className={`text-xs font-bold px-2 py-1 rounded-lg mt-2 inline-block ${statusColor}`}>
                {statusText} ({diff > 0 ? '+' : ''}{diff.toFixed(1)} {unit})
            </div>
        );
    }

    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 min-w-[200px]">
        <div className="border-b border-gray-100 pb-2 mb-2 flex justify-between items-center">
            <span className="font-bold text-gray-800 text-lg">{label} Months</span>
            <span className="text-xs text-gray-400 font-medium">{(label / 12).toFixed(1)} Years</span>
        </div>
        
        <div className="space-y-2">
            {payload.map((p: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
                        <span className="font-medium text-gray-600">{p.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{p.value} {unit}</span>
                </div>
            ))}
        </div>
        {statusNode}
        <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
            <Info size={10} /> Comparison based on {vaccineStandard} charts
        </div>
      </div>
    );
  }
  return null;
};

const GrowthTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'weight' | 'height'>('weight');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [vaccineStandard, setVaccineStandard] = useState<VaccineStandard>('WHO');

  // Helper functions for conversion
  const kgToLbs = (kg: number) => parseFloat((kg * 2.20462).toFixed(2));
  const cmToInch = (cm: number) => parseFloat((cm * 0.393701).toFixed(1));

  // Process data based on unit system
  const chartData = useMemo(() => {
    if (unitSystem === 'metric') return MOCK_DATA_METRIC;
    
    return MOCK_DATA_METRIC.map(d => ({
      ...d,
      weight: kgToLbs(d.weight),
      standardWeight: kgToLbs(d.standardWeight),
      height: cmToInch(d.height),
      standardHeight: cmToInch(d.standardHeight),
    }));
  }, [unitSystem]);

  const currentVaccines = vaccineStandard === 'WHO' ? VACCINES_WHO : VACCINES_CDC;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark">Health & Growth</h2>
          <p className="text-gray-500">Track development (0-5 Years)</p>
        </div>
        
        {/* Global Settings */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
           <button 
             onClick={() => setUnitSystem(prev => prev === 'metric' ? 'imperial' : 'metric')}
             className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors hover:bg-gray-100 flex items-center gap-1"
           >
             <Settings2 size={14}/> {unitSystem}
           </button>
           <div className="w-px h-6 bg-gray-200"></div>
           <button 
             onClick={() => setVaccineStandard(prev => prev === 'WHO' ? 'CDC' : 'WHO')}
             className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors hover:bg-gray-100 flex items-center gap-1"
           >
             <Globe size={14}/> {vaccineStandard}
           </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
           <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('weight')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'weight' ? 'bg-secondary/20 text-teal-700 border border-secondary/50' : 'bg-gray-50 text-gray-400'}`}
              >
                <Weight size={16} /> Weight
              </button>
              <button 
                onClick={() => setActiveTab('height')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'height' ? 'bg-primary/20 text-pink-700 border border-primary/50' : 'bg-gray-50 text-gray-400'}`}
              >
                <Ruler size={16} /> Height
              </button>
           </div>
           <div className="flex items-center gap-2">
             <span className="hidden md:flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                <ZoomIn size={10}/> Drag slider to zoom
             </span>
             <button className="bg-primary text-white px-4 py-2 rounded-xl font-medium text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all">
               + Log
             </button>
           </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}} 
                label={{ value: 'Age (Months)', position: 'insideBottomRight', offset: -5, fill: '#9ca3af', fontSize: 10 }}
                domain={[0, 60]}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}} 
                domain={['auto', 'auto']}
                unit={activeTab === 'weight' ? (unitSystem === 'metric' ? 'kg' : 'lbs') : (unitSystem === 'metric' ? 'cm' : '"')}
              />
              <Tooltip 
                content={<CustomTooltip unitSystem={unitSystem} activeTab={activeTab} vaccineStandard={vaccineStandard} />}
              />
              <Legend verticalAlign="top" height={36}/>
              <Brush 
                 dataKey="month" 
                 height={30} 
                 stroke="#cbd5e1" 
                 fill="#f8fafc" 
                 tickFormatter={(val) => `${val}m`}
                 travellerWidth={10}
              />
              <Line 
                type="monotone" 
                dataKey={activeTab === 'weight' ? 'standardWeight' : 'standardHeight'} 
                stroke="#d1d5db" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false} 
                name={`${vaccineStandard === 'WHO' ? 'WHO' : 'CDC'} Standard`}
              />
              <Line 
                type="monotone" 
                dataKey={activeTab} 
                stroke={activeTab === 'weight' ? '#85E3FF' : '#FF8FAB'} 
                strokeWidth={4} 
                dot={{ r: 6, strokeWidth: 2, fill: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }}
                name="My Baby"
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vaccination Checklist */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Syringe className="text-accent" /> VaxReminder
          </h3>
          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-wider">
            Schedule: {vaccineStandard}
          </span>
        </div>
        
        <div className="space-y-3">
          {currentVaccines.map((vax, idx) => (
            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${vax.done ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
               <div className="flex items-center gap-4">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${vax.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                   <CalendarCheck size={14} />
                 </div>
                 <div>
                   <p className={`font-bold ${vax.done ? 'text-green-800' : 'text-gray-800'}`}>{vax.name}</p>
                   <p className="text-xs text-gray-500">{vax.age}</p>
                 </div>
               </div>
               {vax.done ? (
                 <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">COMPLETED</span>
               ) : (
                 <button className="text-xs font-bold text-primary border border-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors">
                   Mark Done
                 </button>
               )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrowthTracker;
