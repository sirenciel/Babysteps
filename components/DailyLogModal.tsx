
import React, { useState, useEffect } from 'react';
import { X, Droplets, Baby, Moon, Clock, Save, Play, Pause, Zap, ChevronDown, Utensils, Smile, Frown, AlertCircle, CheckCircle, Shirt } from 'lucide-react';
import { DailyLog } from '../types';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: DailyLog, xpReward: number) => void;
}

const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose, onSave }) => {
  // Check global age context (Simulated)
  const [isToddler, setIsToddler] = useState(false);
  
  useEffect(() => {
     if(isOpen) {
        const storedMode = localStorage.getItem('is_toddler_mode');
        setIsToddler(storedMode ? JSON.parse(storedMode) : false);
     }
  }, [isOpen]);

  // Adaptive Tabs
  const BABY_TABS = [
    { id: 'feed', icon: Droplets, label: 'Feed', color: 'bg-blue-500' },
    { id: 'diaper', icon: Baby, label: 'Diaper', color: 'bg-orange-500' },
    { id: 'sleep', icon: Moon, label: 'Sleep', color: 'bg-indigo-500' }
  ];

  const TODDLER_TABS = [
    { id: 'feed', icon: Utensils, label: 'Meal', color: 'bg-green-500' }, // Replaces Bottle
    { id: 'diaper', icon: Shirt, label: 'Potty', color: 'bg-orange-500' }, // Replaces Diaper
    { id: 'mood', icon: Smile, label: 'Mood', color: 'bg-pink-500' } // New for 1-5y
  ];

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [isVisible, setIsVisible] = useState(false);
  
  // Feed State (Baby)
  const [feedType, setFeedType] = useState<'breast' | 'bottle'>('breast');
  const [bottleAmount, setBottleAmount] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [breastSide, setBreastSide] = useState<'left' | 'right'>('left');

  // Feed State (Toddler)
  const [mealType, setMealType] = useState('Lunch');
  const [ateVeggies, setAteVeggies] = useState(false);
  const [ateProtein, setAteProtein] = useState(false);

  // Diaper/Potty State
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'mixed'>('wet');
  const [pottyResult, setPottyResult] = useState<'success' | 'accident' | 'tried'>('success');

  // Mood State (Toddler)
  const [moodType, setMoodType] = useState('Happy');

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Reset tab to first available
      setActiveTab('feed');
    } else {
      setTimeout(() => setIsVisible(false), 300); 
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: number;
    if (timerActive) {
      interval = window.setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  if (!isOpen && !isVisible) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const log: DailyLog = {
      id: Date.now().toString(),
      type: activeTab as any,
      timestamp: new Date(),
    };

    let xpReward = 10; 

    if (activeTab === 'feed') {
        if (isToddler) {
            log.notes = `Meal: ${mealType}. Veggies: ${ateVeggies ? 'Yes' : 'No'}`;
            xpReward = ateVeggies ? 25 : 10; // Gamify eating veggies!
        } else {
            if (feedType === 'breast') {
                log.subType = breastSide === 'left' ? 'breast_left' : 'breast_right';
                log.value = Math.ceil(timerSeconds / 60); 
                xpReward = 15; 
            } else {
                log.subType = 'bottle';
                log.value = bottleAmount;
            }
        }
    } else if (activeTab === 'diaper') {
        if (isToddler) {
            // Potty Logic
            log.notes = `Potty: ${pottyResult}`;
            xpReward = pottyResult === 'success' ? 50 : 5; // Huge reward for potty success
        } else {
            log.subType = diaperType;
            xpReward = diaperType === 'dirty' ? 20 : 10;
        }
    } else if (activeTab === 'mood') {
        log.notes = `Mood: ${moodType}`;
        xpReward = 15;
    } else if (activeTab === 'sleep') {
        xpReward = 15;
    }

    onSave(log, xpReward);
    setTimerSeconds(0);
    setTimerActive(false);
    onClose();
  };

  const tabs = isToddler ? TODDLER_TABS : BABY_TABS;

  return (
    <div className={`fixed inset-0 z-[60] flex items-end md:items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'}`}>
      <div className="absolute inset-0" onClick={onClose}></div>

      <div 
        className={`
          bg-white w-full md:max-w-md md:rounded-3xl shadow-2xl overflow-hidden flex flex-col 
          fixed bottom-0 md:relative md:bottom-auto rounded-t-[2rem] md:rounded-3xl
          transition-transform duration-300 ease-out max-h-[90vh]
          ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-10 md:opacity-0'}
        `}
      >
        {/* Handle */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
           <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-xl text-gray-800">
             {isToddler ? 'Toddler Log' : 'Baby Log'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-2 gap-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 text-sm font-bold transition-all border-2 ${activeTab === tab.id ? `border-${tab.color.split('-')[1]}-500 bg-gray-50 text-dark` : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              <div className={`p-2 rounded-full ${activeTab === tab.id ? `${tab.color} text-white shadow-md transform scale-110` : 'bg-gray-200 text-gray-500'} transition-all`}>
                 <tab.icon size={20} />
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto pb-safe-bottom">
          
          {/* --- FEED / MEAL TAB --- */}
          {activeTab === 'feed' && (
            <div className="space-y-6 animate-fade-in">
              {isToddler ? (
                  // TODDLER MEAL UI
                  <div className="space-y-4">
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                         {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(m => (
                             <button key={m} onClick={() => setMealType(m)} className={`px-4 py-2 rounded-xl font-bold border transition-colors ${mealType === m ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                                 {m}
                             </button>
                         ))}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <h4 className="font-bold text-gray-700 mb-3">What did Arlo eat?</h4>
                          <div className="space-y-2">
                              <div onClick={() => setAteVeggies(!ateVeggies)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${ateVeggies ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${ateVeggies ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                      {ateVeggies && <CheckCircle size={14} />}
                                  </div>
                                  <span className="font-bold text-gray-700">🥦 Veggies (Fiber)</span>
                              </div>
                              <div onClick={() => setAteProtein(!ateProtein)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${ateProtein ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${ateProtein ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                      {ateProtein && <CheckCircle size={14} />}
                                  </div>
                                  <span className="font-bold text-gray-700">🍗 Protein (Growth)</span>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  // BABY FEED UI (Original)
                  <>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button onClick={() => setFeedType('breast')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${feedType === 'breast' ? 'bg-white shadow-sm text-dark' : 'text-gray-500'}`}>Breast</button>
                        <button onClick={() => setFeedType('bottle')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${feedType === 'bottle' ? 'bg-white shadow-sm text-dark' : 'text-gray-500'}`}>Bottle</button>
                    </div>

                    {feedType === 'breast' ? (
                        <div className="text-center space-y-5">
                        <div className="flex justify-center gap-6 mb-2">
                            <button onClick={() => setBreastSide('left')} className={`w-14 h-14 rounded-full font-bold border-2 flex items-center justify-center transition-all text-lg ${breastSide === 'left' ? 'border-pink-400 text-pink-600 bg-pink-50 scale-110 shadow-sm' : 'border-gray-200 text-gray-400'}`}>L</button>
                            <button onClick={() => setBreastSide('right')} className={`w-14 h-14 rounded-full font-bold border-2 flex items-center justify-center transition-all text-lg ${breastSide === 'right' ? 'border-pink-400 text-pink-600 bg-pink-50 scale-110 shadow-sm' : 'border-gray-200 text-gray-400'}`}>R</button>
                        </div>
                        <div className="text-6xl font-mono font-bold text-dark tabular-nums tracking-tight">
                            {formatTime(timerSeconds)}
                        </div>
                        <button 
                            onClick={() => setTimerActive(!timerActive)}
                            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-pink-200 transition-all ${timerActive ? 'bg-red-50 text-red-500 hover:bg-red-100 border-2 border-red-100' : 'bg-primary text-white hover:scale-105 hover:bg-pink-400'}`}
                        >
                            {timerActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                        </button>
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center justify-center gap-6">
                                <button onClick={() => setBottleAmount(Math.max(0, bottleAmount - 10))} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-2xl text-gray-600 active:scale-95 transition-transform">-</button>
                                <div className="text-center">
                                    <span className="text-5xl font-bold block text-dark">{bottleAmount}</span>
                                    <span className="text-sm text-gray-400 font-bold uppercase">ml</span>
                                </div>
                                <button onClick={() => setBottleAmount(bottleAmount + 10)} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-2xl text-gray-600 active:scale-95 transition-transform">+</button>
                            </div>
                        </div>
                    )}
                  </>
              )}
            </div>
          )}

          {/* --- DIAPER / POTTY TAB --- */}
          {activeTab === 'diaper' && (
             <div className="grid grid-cols-3 gap-4 py-4 animate-fade-in">
                {isToddler ? (
                    // POTTY UI
                    <>
                        {[
                            { id: 'success', label: 'Success', icon: CheckCircle, color: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-200' },
                            { id: 'tried', label: 'Tried', icon: Clock, color: 'bg-blue-400', bg: 'bg-blue-50', border: 'border-blue-200' },
                            { id: 'accident', label: 'Oops', icon: AlertCircle, color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' }
                        ].map((opt: any) => (
                            <button
                                key={opt.id}
                                onClick={() => setPottyResult(opt.id)}
                                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${pottyResult === opt.id ? `${opt.border} ${opt.bg} scale-105 shadow-md` : 'border-gray-100 text-gray-400'}`}
                            >
                                <opt.icon size={32} className={pottyResult === opt.id ? 'text-gray-800' : 'text-gray-300'} />
                                <span className={`font-bold ${pottyResult === opt.id ? 'text-gray-800' : ''}`}>{opt.label}</span>
                            </button>
                        ))}
                    </>
                ) : (
                    // DIAPER UI
                    (['wet', 'dirty', 'mixed'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setDiaperType(type)}
                        className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${diaperType === type ? 'border-orange-400 bg-orange-50 text-orange-900 shadow-md' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                    >
                        <div className={`w-4 h-4 rounded-full ${type === 'wet' ? 'bg-yellow-400' : type === 'dirty' ? 'bg-amber-700' : 'bg-orange-500'}`}></div>
                        <span className="font-bold capitalize text-lg">{type}</span>
                    </button>
                    ))
                )}
             </div>
          )}

          {/* --- MOOD TAB (Toddler Only) --- */}
          {activeTab === 'mood' && (
              <div className="py-4 animate-fade-in space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                      {['Happy', 'Calm', 'Hyper', 'Sad', 'Tantrum', 'Sick'].map(m => (
                          <button 
                            key={m} 
                            onClick={() => setMoodType(m)}
                            className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${moodType === m ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-100 text-gray-500'}`}
                          >
                             {m}
                          </button>
                      ))}
                  </div>
                  <div className="text-center text-gray-500 text-xs">
                      Tracking moods helps identify triggers for tantrums.
                  </div>
              </div>
          )}

          {activeTab === 'sleep' && (
            <div className="text-center py-8 animate-fade-in">
               <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
                  <Moon size={48} fill="currentColor" />
               </div>
               <h4 className="text-xl font-bold text-gray-800 mb-2">Good Night!</h4>
               <p className="text-gray-600 max-w-xs mx-auto">Logging sleep start time as <strong>Now</strong>. We'll track the duration.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white pb-8 md:pb-6">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-dark text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
          >
            <Save size={20} /> Save Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyLogModal;
