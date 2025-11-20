
import React, { useState, useEffect } from 'react';
import { ViewState, DailyLog, GamificationState } from './types';
import SleepSanctuary from './components/SleepSanctuary';
import GrowthTracker from './components/GrowthTracker';
import AIChat from './components/AIChat';
import NutritionHub from './components/NutritionHub';
import MilestonesTracker from './components/MilestonesTracker';
import MemoryLane from './components/MemoryLane';
import DailyLogModal from './components/DailyLogModal';
import Dashboard from './components/Dashboard';
import GamificationHub from './components/GamificationHub';
import CommunityHub from './components/CommunityHub';

import { 
  LayoutDashboard, 
  Moon, 
  Activity, 
  Utensils, 
  Sparkles, 
  Users, 
  Trophy,
  Image,
  Plus,
  Sprout,
  Grid,
  ChevronRight
} from 'lucide-react';

// Initial state definitions
const INITIAL_LOGS: DailyLog[] = [
  { id: '1', type: 'feed', timestamp: new Date(Date.now() - 1000 * 60 * 130) }, 
  { id: '2', type: 'diaper', timestamp: new Date(Date.now() - 1000 * 60 * 45) }, 
];

const INITIAL_GAME_STATE: GamificationState = {
  level: 1,
  currentXP: 40,
  nextLevelXP: 100,
  streakDays: 3,
  treeStage: 'seed',
  dailyQuests: [
    { id: 'q1', title: 'Log 3 Feeds', targetCount: 3, currentCount: 1, xpReward: 50, completed: false },
    { id: 'q2', title: 'Read 1 Tip', targetCount: 1, currentCount: 0, xpReward: 20, completed: false },
  ],
  achievements: [
    { id: 'a1', title: 'First Step', description: 'Logged first activity', icon: '🌱', unlocked: true },
    { id: 'a2', title: 'Night Watch', description: 'Log activity at 2 AM', icon: '🦉', unlocked: false },
    { id: 'a3', title: 'Super Parent', description: 'Reach Level 5', icon: '👑', unlocked: false },
  ]
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState | 'MENU'>(ViewState.DASHBOARD);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  // Initialize with lazy state to load from localStorage
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>(() => {
    try {
      const saved = localStorage.getItem('recent_logs');
      if (saved) {
        // Parse dates correctly from JSON strings
        return JSON.parse(saved).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch(e) { console.error("Failed to load logs", e); }
    return INITIAL_LOGS;
  });

  const [gameState, setGameState] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem('game_state');
      if (saved) return JSON.parse(saved);
    } catch(e) { console.error("Failed to load game state", e); }
    return INITIAL_GAME_STATE;
  });

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('recent_logs', JSON.stringify(recentLogs));
  }, [recentLogs]);

  useEffect(() => {
    localStorage.setItem('game_state', JSON.stringify(gameState));
  }, [gameState]);

  const handleAddLog = (log: DailyLog, xpReward: number) => {
    setRecentLogs(prev => [log, ...prev]);
    
    // Add XP & Update Gamification
    setGameState(prev => {
      let newXP = prev.currentXP + xpReward;
      let newLevel = prev.level;
      let newNextLevelXP = prev.nextLevelXP;
      let newTreeStage = prev.treeStage;

      // Level Up Logic
      if (newXP >= prev.nextLevelXP) {
        newLevel += 1;
        newXP = newXP - prev.nextLevelXP;
        newNextLevelXP = Math.floor(prev.nextLevelXP * 1.5);
        
        // Tree Growth Logic
        if (newLevel >= 3) newTreeStage = 'sprout';
        if (newLevel >= 5) newTreeStage = 'sapling';
        if (newLevel >= 10) newTreeStage = 'tree';
        
        alert(`Level Up! Your tree is growing! Welcome to Level ${newLevel}`);
      }

      // Update Quests
      const updatedQuests = prev.dailyQuests.map(q => {
         if (q.id === 'q1' && log.type === 'feed' && !q.completed) {
            const newCount = q.currentCount + 1;
            if (newCount >= q.targetCount) {
               newXP += q.xpReward; 
               alert(`Quest Complete: ${q.title}! +${q.xpReward} XP`);
               return { ...q, currentCount: newCount, completed: true };
            }
            return { ...q, currentCount: newCount };
         }
         return q;
      });

      return {
        ...prev,
        level: newLevel,
        currentXP: newXP,
        nextLevelXP: newNextLevelXP,
        treeStage: newTreeStage,
        dailyQuests: updatedQuests
      };
    });
  };

  const NAV_ITEMS = [
    { id: ViewState.DASHBOARD, label: 'Home', icon: LayoutDashboard, color: 'text-gray-600' },
    { id: ViewState.GROWTH, label: 'Growth', icon: Activity, color: 'text-pink-500' },
    { id: ViewState.MEMORY, label: 'Memories', icon: Image, color: 'text-indigo-500' },
    { id: 'MENU', label: 'Menu', icon: Grid, color: 'text-gray-600' }, // The "More" Tab
    // Hidden from main nav but accessible via Menu
    { id: ViewState.SLEEP, label: 'Sleep Lab', icon: Moon, color: 'text-indigo-400' },
    { id: ViewState.MILESTONES, label: 'Milestones', icon: Trophy, color: 'text-yellow-500' },
    { id: ViewState.GARDEN, label: 'Garden', icon: Sprout, color: 'text-green-500' }, 
    { id: ViewState.AI_CHAT, label: 'Coach', icon: Sparkles, color: 'text-purple-500' },
    { id: ViewState.NUTRITION, label: 'Food', icon: Utensils, color: 'text-green-600' },
    { id: ViewState.COMMUNITY, label: 'Village', icon: Users, color: 'text-blue-500' },
  ];

  // Primary Bottom Nav items (Emotional Retention Strategy)
  // Home | Growth | (+) | Memories | Menu
  const BOTTOM_NAV = [
    NAV_ITEMS[0], // Home
    NAV_ITEMS[1], // Growth (High Retention)
    // FAB goes here
    NAV_ITEMS[2], // Memories (Emotional Anchor)
    NAV_ITEMS[3], // Menu (Access to Sleep, Food, Village etc)
  ];

  const renderView = () => {
    switch (view) {
      case ViewState.DASHBOARD: return <Dashboard setView={setView as any} recentLogs={recentLogs} gamification={gameState} />;
      case ViewState.SLEEP: return <SleepSanctuary />;
      case ViewState.GROWTH: return <GrowthTracker />;
      case ViewState.MILESTONES: return <MilestonesTracker />;
      case ViewState.AI_CHAT: return <AIChat />;
      case ViewState.NUTRITION: return <NutritionHub />;
      case ViewState.MEMORY: return <MemoryLane />;
      case ViewState.GARDEN: return <GamificationHub gameState={gameState} />;
      case ViewState.COMMUNITY: return <CommunityHub />;
      case 'MENU':
        return (
          <div className="p-6 space-y-6 animate-fade-in pb-20">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo" alt="Baby" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-dark">Menu</h2>
                   <p className="text-sm text-gray-500">Everything else for Arlo</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {/* Utilities */}
                <button onClick={() => setView(ViewState.SLEEP)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-95 transition-transform">
                   <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center text-indigo-500"><Moon size={20}/></div>
                   <span className="font-bold text-left text-gray-700">Sleep Lab</span>
                </button>
                <button onClick={() => setView(ViewState.NUTRITION)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-95 transition-transform">
                   <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center text-green-500"><Utensils size={20}/></div>
                   <span className="font-bold text-left text-gray-700">Food & Recipes</span>
                </button>
                <button onClick={() => setView(ViewState.AI_CHAT)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-95 transition-transform">
                   <div className="bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center text-purple-500"><Sparkles size={20}/></div>
                   <span className="font-bold text-left text-gray-700">Coach AI</span>
                </button>
                <button onClick={() => setView(ViewState.MILESTONES)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-95 transition-transform">
                   <div className="bg-yellow-50 w-10 h-10 rounded-full flex items-center justify-center text-yellow-500"><Trophy size={20}/></div>
                   <span className="font-bold text-left text-gray-700">Milestones</span>
                </button>
                <button onClick={() => setView(ViewState.GARDEN)} className="col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 shadow-sm flex items-center justify-between active:scale-95 transition-transform">
                   <div className="flex items-center gap-3">
                      <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center text-green-600 shadow-sm"><Sprout size={20}/></div>
                      <div className="text-left">
                        <span className="font-bold block text-green-900">Garden of Love</span>
                        <span className="text-xs text-green-700">Level {gameState.level} • {gameState.currentXP} XP</span>
                      </div>
                   </div>
                   <ChevronRight className="text-green-400" />
                </button>
                <button onClick={() => setView(ViewState.COMMUNITY)} className="col-span-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 active:scale-95 transition-transform">
                   <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-500"><Users size={20}/></div>
                   <div className="text-left">
                     <span className="font-bold block text-gray-700">The Village</span>
                     <span className="text-xs text-gray-400">Community Forums</span>
                   </div>
                </button>
             </div>
          </div>
        )
      default: return <Dashboard setView={setView as any} recentLogs={recentLogs} gamification={gameState} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7] flex flex-col md:flex-row text-dark">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles size={24} fill="currentColor" /> BabySteps
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.filter(i => i.id !== 'MENU').map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                view === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-50">
           <button 
             onClick={() => setIsLogModalOpen(true)}
             className="w-full bg-dark text-white py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
           >
             <Plus size={20} /> Quick Log
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth no-scrollbar">
        {/* Mobile Header (Native App Bar Style) */}
        <div className="md:hidden bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 border-b border-gray-100 flex justify-between items-center shadow-sm">
           <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
             <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                {NAV_ITEMS.find(n => n.id === view)?.icon ? React.createElement(NAV_ITEMS.find(n => n.id === view)!.icon, {size: 18}) : <Sparkles size={18}/>}
             </div>
             {NAV_ITEMS.find(n => n.id === view)?.label || 'BabySteps'}
           </h1>
           <div className="flex gap-3 items-center">
              {/* Streak Counter for Mobile */}
              <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                 <div className="text-xs font-bold text-orange-600">🔥 {gameState.streakDays}</div>
              </div>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo" alt="Baby" />
              </div>
           </div>
        </div>

        {/* Content with bottom padding for Nav Bar */}
        <div className="pb-32 pt-4 md:pt-8 md:pb-8">
           {renderView()}
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION (Emotional Retention Layout) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Safe Area background extender */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]"></div>
        
        <div className="flex justify-around items-center h-16 px-2 relative z-10 pb-safe pt-1">
           
           {/* Left Items: Home & Growth (Priority 1) */}
           {BOTTOM_NAV.slice(0, 2).map(item => (
             <button
               key={item.id}
               onClick={() => setView(item.id as any)}
               className={`flex-1 flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition-transform ${view === item.id ? 'text-primary' : 'text-gray-400'}`}
             >
               <item.icon size={24} strokeWidth={view === item.id ? 2.5 : 2} className={view === item.id ? 'drop-shadow-sm' : ''} />
               <span className="text-[10px] font-medium">{item.label}</span>
             </button>
           ))}

           {/* CENTER FLOATING ACTION BUTTON (FAB) DOCKED */}
           <div className="relative -top-6">
              <button 
                onClick={() => setIsLogModalOpen(true)}
                className="w-16 h-16 bg-dark text-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center transform transition-all active:scale-90 border-[6px] border-[#F9F7F7]"
              >
                <Plus size={32} strokeWidth={3} />
              </button>
           </div>

           {/* Right Items: Memories & Menu (Priority 2) */}
           {BOTTOM_NAV.slice(2, 4).map(item => (
             <button
               key={item.id}
               onClick={() => setView(item.id as any)}
               className={`flex-1 flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition-transform ${view === item.id ? 'text-primary' : 'text-gray-400'}`}
             >
               <item.icon size={24} strokeWidth={view === item.id ? 2.5 : 2} className={view === item.id ? 'drop-shadow-sm' : ''} />
               <span className="text-[10px] font-medium">{item.label}</span>
             </button>
           ))}
        </div>
        {/* Safe area spacer */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white/90 backdrop-blur-lg"></div>
      </div>

      {/* Quick Log Modal */}
      <DailyLogModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSave={handleAddLog}
      />

    </div>
  );
};

export default App;
