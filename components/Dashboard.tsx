
import React, { useState, useEffect } from 'react';
import { Sparkles, Droplets, Baby, Moon, ChevronRight, Sprout, TreeDeciduous, Sun, Image, Heart, Camera, Smile, Utensils, Shirt, Brain } from 'lucide-react';
import { DailyLog, ViewState, GamificationState, Memory } from '../types';
import DailyActivityCard from './DailyActivityCard';

interface DashboardProps {
  setView: (view: ViewState) => void;
  recentLogs: DailyLog[];
  gamification: GamificationState;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, recentLogs, gamification }) => {
  // In a real app, this comes from the BabyProfile context
  const [isToddlerMode, setIsToddlerMode] = useState(false); 
  const [latestMemory, setLatestMemory] = useState<Memory | null>(null);
  
  // Update local storage for other components to react
  useEffect(() => {
    localStorage.setItem('is_toddler_mode', JSON.stringify(isToddlerMode));
    window.dispatchEvent(new Event('age_mode_change'));
  }, [isToddlerMode]);

  // Load latest memory from persistence
  useEffect(() => {
    try {
        const saved = localStorage.getItem('memories');
        if (saved) {
            const memories: Memory[] = JSON.parse(saved);
            if (memories.length > 0) {
                setLatestMemory(memories[0]);
            }
        }
    } catch(e) { console.error("Failed to load memories for dashboard", e); }
  }, []);

  const getTimeSince = (type: 'feed' | 'sleep' | 'diaper') => {
    const log = recentLogs.find(l => l.type === type);
    if (!log) return 'No data';
    
    const diff = new Date().getTime() - new Date(log.timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const progressPercent = Math.min(100, (gamification.currentXP / gamification.nextLevelXP) * 100);

  const primaryColor = isToddlerMode ? 'bg-orange-400' : 'bg-primary';
  const ageLabel = isToddlerMode ? '3 Years Old' : '4 Months';
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
       
       {/* DEV TOOL: Age Toggle for Demo */}
       <div className="flex justify-end">
          <button 
            onClick={() => setIsToddlerMode(!isToddlerMode)}
            className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            Switch to {isToddlerMode ? 'Baby (0-1y)' : 'Toddler (1-5y)'} View
          </button>
       </div>

       {/* Enhanced Hero Card */}
       <div className={`${primaryColor} transition-colors duration-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6`}>
          <div className="relative z-10 flex-1">
             <div className="flex items-center gap-2 mb-1 opacity-90">
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase">{ageLabel}</span>
                <span className="text-xs">{isToddlerMode ? 'Potty Training Era' : '12 Days Old'}</span>
             </div>
             <h1 className="text-3xl font-bold mb-4 leading-tight">
               {isToddlerMode ? 'Ready for Big School,\nArlo?' : 'Good Morning,\nMama!'}
             </h1>
             
             {/* Quick Stats Row - ADAPTIVE */}
             <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
                {!isToddlerMode ? (
                  // BABY STATS
                  <>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex-shrink-0">
                       <div className="flex items-center gap-1 text-[10px] uppercase font-bold opacity-70 mb-1"><Droplets size={10}/> Feed</div>
                       <div className="font-bold text-sm">{getTimeSince('feed')} ago</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex-shrink-0">
                       <div className="flex items-center gap-1 text-[10px] uppercase font-bold opacity-70 mb-1"><Moon size={10}/> Sleep</div>
                       <div className="font-bold text-sm">{getTimeSince('sleep')} ago</div>
                    </div>
                  </>
                ) : (
                  // TODDLER STATS
                  <>
                     <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex-shrink-0 min-w-[90px]">
                       <div className="flex items-center gap-1 text-[10px] uppercase font-bold opacity-70 mb-1"><Shirt size={10}/> Potty</div>
                       <div className="font-bold text-sm">3 Success</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex-shrink-0 min-w-[90px]">
                       <div className="flex items-center gap-1 text-[10px] uppercase font-bold opacity-70 mb-1"><Smile size={10}/> Mood</div>
                       <div className="font-bold text-sm">Happy</div>
                    </div>
                  </>
                )}
             </div>
          </div>

          {/* Tree Visualization */}
          <div 
            onClick={() => setView(ViewState.GARDEN)}
            className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-lg w-full md:w-auto min-w-[140px] cursor-pointer hover:scale-105 transition-transform group"
          >
             <div className="absolute top-2 right-2">
                <Sun size={16} className="text-yellow-400 animate-spin-slow" />
             </div>
             <div className="flex items-center md:flex-col gap-4 md:gap-2">
                <div className="bg-green-50 p-2 rounded-full border border-green-100">
                  {gamification.treeStage === 'tree' ? <TreeDeciduous className="text-green-600" size={32} /> : <Sprout className="text-green-600" size={32} />}
                </div>
                <div className="flex-1 md:text-center">
                   <div className="text-xs text-gray-500 font-bold uppercase">My Tree</div>
                   <div className="font-bold text-dark text-lg">Level {gamification.level}</div>
                   <div className="w-full md:w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                   </div>
                   <div className="text-[10px] text-gray-400 mt-1">{gamification.nextLevelXP - gamification.currentXP} XP to grow</div>
                </div>
                <ChevronRight className="text-gray-300 md:hidden" />
             </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute -right-10 -bottom-20 opacity-10 pointer-events-none text-white">
             {isToddlerMode ? <Brain size={250} /> : <Baby size={250} />}
          </div>
       </div>

       {/* Memory Snapshot - Now Dynamic! */}
       <div 
        onClick={() => setView(ViewState.MEMORY)}
        className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-95 transition-transform relative overflow-hidden group"
       >
          <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden relative flex-shrink-0">
            {latestMemory?.imageUrl ? (
                <img src={latestMemory.imageUrl} alt="Latest Memory" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    <Image size={24} />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute bottom-1 left-1">
              <Heart size={12} className="text-white fill-white" />
            </div>
          </div>
          
          <div className="flex-1 py-2 pr-4">
             <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <Image size={16} className="text-primary" /> Memory Lane
                </h3>
                {latestMemory && (
                    <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">Latest</span>
                )}
             </div>
             <p className="text-xs text-gray-500 line-clamp-1">
                {latestMemory ? `"${latestMemory.title}"` : "No photos yet. Start capturing!"}
             </p>
             <p className="text-[10px] text-primary font-bold mt-1 flex items-center gap-1">
               <Camera size={10} /> {latestMemory ? '+ Add another' : '+ Add first photo'}
             </p>
          </div>
          
          <div className="pr-4">
             <div className="bg-gray-50 p-2 rounded-full">
               <ChevronRight size={16} className="text-gray-400" />
             </div>
          </div>
       </div>

       {/* Quick Actions Grid */}
       <div className="grid grid-cols-3 gap-3">
          {isToddlerMode ? (
             <>
               <button onClick={() => setView(ViewState.GROWTH)} className="bg-white p-3 py-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex flex-col items-center gap-2">
                 <div className="p-2.5 rounded-full bg-orange-100 text-orange-600"><Shirt size={20}/></div>
                 <span className="font-bold text-gray-600 text-[10px] md:text-xs text-center">Potty Log</span>
               </button>
               <button onClick={() => setView(ViewState.NUTRITION)} className="bg-white p-3 py-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex flex-col items-center gap-2">
                 <div className="p-2.5 rounded-full bg-green-100 text-green-600"><Utensils size={20}/></div>
                 <span className="font-bold text-gray-600 text-[10px] md:text-xs text-center">Lunch Box</span>
               </button>
               <button onClick={() => setView(ViewState.MILESTONES)} className="bg-white p-3 py-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex flex-col items-center gap-2">
                 <div className="p-2.5 rounded-full bg-purple-100 text-purple-600"><Brain size={20}/></div>
                 <span className="font-bold text-gray-600 text-[10px] md:text-xs text-center">Skills</span>
               </button>
             </>
          ) : (
             <>
               <button onClick={() => setView(ViewState.SLEEP)} className="bg-white p-3 py-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex flex-col items-center gap-2">
                 <div className="p-2.5 rounded-full bg-indigo-100 text-indigo-600"><Moon size={20}/></div>
                 <span className="font-bold text-gray-600 text-[10px] md:text-xs text-center">Sleep</span>
               </button>
               <button onClick={() => setView(ViewState.NUTRITION)} className="bg-white p-3 py-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex flex-col items-center gap-2">
                 <div className="p-2.5 rounded-full bg-green-100 text-green-600"><Droplets size={20}/></div>
                 <span className="font-bold text-gray-600 text-[10px] md:text-xs text-center">Food</span>
               </button>
               <button onClick={() => setView(ViewState.MILESTONES)} className="bg-white p-3 py-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex flex-col items-center gap-2">
                 <div className="p-2.5 rounded-full bg-yellow-100 text-yellow-600"><Sprout size={20}/></div>
                 <span className="font-bold text-gray-600 text-[10px] md:text-xs text-center">Milestones</span>
               </button>
             </>
          )}
       </div>

       <DailyActivityCard />
    </div>
  );
};

export default Dashboard;
