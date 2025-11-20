
import React, { useState } from 'react';
import { CheckCircle, Circle, HelpCircle, Trophy, ChevronDown, ChevronUp, Sparkles, Loader2, CloudRain, Sun } from 'lucide-react';
import { Milestone, Leap } from '../types';
import { getMilestoneTip } from '../services/geminiService';

// Mock Data for Milestones
const INITIAL_MILESTONES: Milestone[] = [
  { id: 'm1', title: "Lifts head while on tummy", category: "motor", completed: true, ageMonth: 2 },
  { id: 'm2', title: "Smiles at people", category: "social", completed: true, ageMonth: 2 },
  { id: 'm3', title: "Coos and makes gurgling sounds", category: "language", completed: true, ageMonth: 2 },
  { id: 'm4', title: "Holds head steady without support", category: "motor", completed: false, ageMonth: 4 },
  { id: 'm5', title: "Pushes down on legs when feet are on hard surface", category: "motor", completed: false, ageMonth: 4 },
  { id: 'm6', title: "Responds to affection", category: "social", completed: false, ageMonth: 4 },
  { id: 'm7', title: "Brings hand to mouth", category: "motor", completed: false, ageMonth: 4 },
];

// Mock Data for Leaps
const LEAPS: Leap[] = [
  { id: 1, week: 5, title: "Leap 1: Sensations", description: "Baby is waking up to the world. Metabolism changes.", status: "sunny" },
  { id: 2, week: 8, title: "Leap 2: Patterns", description: "Recognizing simple patterns in sight and sound. Very fussy.", status: "stormy" },
  { id: 3, week: 12, title: "Leap 3: Smooth Transitions", description: "Physical movements become less robotic.", status: "sunny" },
  { id: 4, week: 19, title: "Leap 4: Events", description: "Understanding cause and effect. The hardest leap!", status: "stormy" },
];

const MilestonesTracker: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('motor');
  const [activeTipId, setActiveTipId] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(false);
  const [tips, setTips] = useState<Record<string, string>>({});
  const [currentWeek, setCurrentWeek] = useState(17); // Mock current week

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const fetchTip = async (milestone: Milestone) => {
    if (tips[milestone.id]) {
      setActiveTipId(activeTipId === milestone.id ? null : milestone.id);
      return;
    }

    setTipLoading(true);
    setActiveTipId(milestone.id);
    const tip = await getMilestoneTip(milestone.title, `${milestone.ageMonth} months`);
    setTips(prev => ({ ...prev, [milestone.id]: tip }));
    setTipLoading(false);
  };

  const progress = Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100);

  const categories = ['motor', 'social', 'language'] as const;

  // Find next leap
  const nextLeap = LEAPS.find(l => l.week > currentWeek) || LEAPS[LEAPS.length - 1];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
           <h2 className="text-3xl font-bold text-dark">Milestones & Leaps</h2>
           <p className="text-gray-500">Track development steps & mental growth</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
           <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-teal-700">
              <Trophy size={24} />
           </div>
           <div>
             <p className="text-xs text-gray-500 font-bold uppercase">Progress</p>
             <p className="text-xl font-bold text-dark">{progress}%</p>
           </div>
        </div>
      </div>

      {/* Mental Leaps Timeline (The "Why are they crying?" Feature) */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
         <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
               <h3 className="font-bold text-xl flex items-center gap-2">
                 Mental Leaps (Week {currentWeek})
               </h3>
               <p className="text-slate-400 text-sm">Based on due date</p>
            </div>
            {nextLeap.status === 'stormy' ? (
              <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-500/50">
                 <CloudRain size={12} /> Storm Approaching
              </div>
            ) : (
              <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-500/50">
                 <Sun size={12} /> Sunny Days
              </div>
            )}
         </div>

         <div className="relative h-24 mt-6">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -translate-y-1/2 rounded-full"></div>
            
            {/* Leaps */}
            <div className="relative h-full w-full flex items-center justify-between px-4">
               {LEAPS.map((leap) => {
                 const isPast = leap.week < currentWeek;
                 const isNext = leap.id === nextLeap.id;
                 
                 return (
                   <div key={leap.id} className="relative flex flex-col items-center group cursor-pointer">
                      <div className={`w-3 h-3 rounded-full mb-2 transition-all ${isPast ? 'bg-slate-500' : isNext ? 'bg-white scale-125 shadow-[0_0_10px_white]' : 'bg-slate-600'}`}></div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                        leap.status === 'stormy' 
                          ? isPast ? 'bg-slate-700 border-slate-600 text-slate-500' : 'bg-slate-800 border-yellow-400 text-yellow-400' 
                          : isPast ? 'bg-slate-700 border-slate-600 text-slate-500' : 'bg-slate-800 border-green-400 text-green-400'
                      }`}>
                        {leap.status === 'stormy' ? <CloudRain size={14}/> : <Sun size={14}/>}
                      </div>
                      <div className="absolute top-12 w-32 text-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-2 rounded-lg text-xs pointer-events-none z-20">
                        <p className="font-bold text-white">{leap.title} (Wk {leap.week})</p>
                        <p className="text-gray-300 mt-1">{leap.description}</p>
                      </div>
                      {isNext && <div className="absolute -bottom-6 text-xs font-bold text-white animate-bounce">Next</div>}
                   </div>
                 )
               })}
            </div>
         </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map(cat => {
           const catMilestones = milestones.filter(m => m.category === cat);
           const isExpanded = expandedCategory === cat;

           return (
             <div key={cat} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${cat === 'motor' ? 'bg-primary' : cat === 'social' ? 'bg-secondary' : 'bg-accent'}`}></div>
                      <h3 className="text-xl font-bold capitalize text-gray-800">{cat} Skills</h3>
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                        {catMilestones.filter(m => m.completed).length}/{catMilestones.length}
                      </span>
                   </div>
                   {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                {isExpanded && (
                   <div className="px-6 pb-6 space-y-3 animate-fade-in">
                      {catMilestones.map(m => (
                        <div key={m.id} className="border-t border-gray-50 pt-3">
                           <div className="flex items-start gap-3 group">
                              <button onClick={() => toggleMilestone(m.id)} className="mt-1 flex-shrink-0">
                                 {m.completed 
                                    ? <CheckCircle className="text-green-500" size={24} /> 
                                    : <Circle className="text-gray-300 group-hover:text-primary transition-colors" size={24} />
                                 }
                              </button>
                              <div className="flex-1">
                                 <p className={`text-gray-800 font-medium ${m.completed ? 'line-through text-gray-400' : ''}`}>
                                   {m.title}
                                 </p>
                                 <p className="text-xs text-gray-400 mt-1">{m.ageMonth} Months</p>
                              </div>
                              
                              {!m.completed && (
                                <button 
                                  onClick={() => fetchTip(m)}
                                  className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                  {activeTipId === m.id && tipLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                  Tips
                                </button>
                              )}
                           </div>
                           
                           {/* AI Tip Section */}
                           {activeTipId === m.id && (
                             <div className="mt-3 ml-9 bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl border border-primary/10 text-sm text-gray-700 relative">
                                {tipLoading ? (
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 size={14} className="animate-spin" /> Asking Coach AI...
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-start gap-2">
                                       <Sparkles size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                       <div className="whitespace-pre-line leading-relaxed">{tips[m.id]}</div>
                                    </div>
                                  </>
                                )}
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                )}
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default MilestonesTracker;
