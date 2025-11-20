
import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle, Star, Award, Zap, Sprout, Flower, TreeDeciduous, Droplets, Sun } from 'lucide-react';
import { GamificationState, Quest, Achievement } from '../types';

interface GamificationHubProps {
  gameState: GamificationState;
}

const GamificationHub: React.FC<GamificationHubProps> = ({ gameState }) => {
  const [animateTree, setAnimateTree] = useState(false);

  useEffect(() => {
    setAnimateTree(true);
    const timer = setTimeout(() => setAnimateTree(false), 1000);
    return () => clearTimeout(timer);
  }, [gameState.currentXP]);

  // Determine Tree Icon based on stage
  const renderTree = () => {
    const size = 120;
    const className = `text-green-600 transition-all duration-500 ${animateTree ? 'scale-110' : 'scale-100'}`;
    
    switch(gameState.treeStage) {
      case 'seed': return <div className="bg-[#8B4513] w-8 h-8 rounded-full mx-auto mt-20"></div>;
      case 'sprout': return <Sprout size={size} className={className} />;
      case 'sapling': return <div className="relative"><Sprout size={size} className={className} /><div className="absolute -top-4 right-0 text-yellow-400"><Sun size={30} className="animate-spin-slow"/></div></div>;
      case 'tree': return <TreeDeciduous size={size * 1.5} className={className} />;
      case 'blooming': return <div className="relative"><TreeDeciduous size={size * 1.5} className={className} /><Flower className="absolute top-10 right-10 text-pink-400 animate-bounce" size={30}/></div>;
      default: return <Sprout size={size} className={className} />;
    }
  };

  const calculateProgress = () => {
    return (gameState.currentXP / gameState.nextLevelXP) * 100;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-dark">Garden of Love</h2>
        <p className="text-gray-500">Every diaper, every feed helps your tree grow.</p>
      </div>

      {/* TREE STAGE VISUALIZER */}
      <div className="bg-gradient-to-b from-sky-100 to-green-50 rounded-[40px] p-8 shadow-xl relative overflow-hidden min-h-[300px] flex flex-col items-center justify-end border-4 border-white">
         <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-gray-700 shadow-sm">
           Level {gameState.level}
         </div>
         
         <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-orange-500 shadow-sm flex items-center gap-1">
           <Zap size={16} fill="currentColor" /> {gameState.streakDays} Day Streak
         </div>

         {/* Sun & Clouds Decoration */}
         <div className="absolute top-10 left-20 text-white/40"><i className="lucide-cloud" style={{width: 60, height: 60}}></i></div>
         <div className="absolute top-20 right-20 text-white/40"><i className="lucide-cloud" style={{width: 40, height: 40}}></i></div>

         {/* The Tree */}
         <div className="mb-8 z-10 filter drop-shadow-xl">
           {renderTree()}
         </div>

         {/* XP Bar */}
         <div className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-full h-6 border border-white/50 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-1000 ease-out relative"
              style={{ width: `${calculateProgress()}%` }}
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
               {gameState.currentXP} / {gameState.nextLevelXP} XP
            </span>
         </div>
         <p className="text-xs text-gray-500 mt-2 font-medium">
            Next Reward: {gameState.treeStage === 'tree' ? 'Flowering Branch' : 'New Leaf'}
         </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* DAILY QUESTS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Star className="text-yellow-400 fill-yellow-400" /> Daily Quests
           </h3>
           <div className="space-y-3">
             {gameState.dailyQuests.map(quest => (
               <div key={quest.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-colors ${quest.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${quest.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {quest.completed ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{quest.currentCount}/{quest.targetCount}</span>}
                     </div>
                     <div>
                        <p className={`font-bold text-sm ${quest.completed ? 'text-green-800' : 'text-gray-700'}`}>{quest.title}</p>
                        <span className="text-xs text-orange-500 font-bold">+{quest.xpReward} XP</span>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Award className="text-purple-500" /> Badges
           </h3>
           <div className="grid grid-cols-3 gap-3">
              {gameState.achievements.map(ach => (
                <div key={ach.id} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-2 text-center transition-all ${ach.unlocked ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50 opacity-60 grayscale'}`}>
                   <div className="text-2xl">{ach.icon}</div>
                   <p className="text-[10px] font-bold leading-tight text-gray-700">{ach.title}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationHub;
