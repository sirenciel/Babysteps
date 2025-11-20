
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Heart, Share2, Plus, Sparkles, Lock, Book, PenTool, X, Clock, MoreVertical, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Memory, TimeCapsuleMessage } from '../types';
import { generateJournalEntry } from '../services/geminiService';

// --- MOCK DATA (Fallback) ---
const MOCK_MEMORIES: Memory[] = [
  { id: '1', title: 'First Real Smile', date: '2023-11-15', description: 'Caught this while daddy was making funny noises. The dimple appeared!', imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80' },
  { id: '2', title: 'Exploring the Grass', date: '2024-02-20', description: 'First time at the park. She wasn\'t sure about the texture of the grass at first.', imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&auto=format&fit=crop&q=80' },
];

const MOCK_CAPSULE: TimeCapsuleMessage[] = [
   { id: 'c1', title: 'To my 17-year-old son', content: '...', createdAt: new Date('2023-09-01'), unlockDate: '2041-05-12', isLocked: true },
];

const FILTERS = ['All', 'Firsts', 'Milestones', 'Funny', 'Sleep', 'Outdoor'];

const MemoryLane: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journal' | 'capsule'>('journal');
  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const saved = localStorage.getItem('memories');
      return saved ? JSON.parse(saved) : MOCK_MEMORIES;
    } catch { return MOCK_MEMORIES; }
  });
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('memories', JSON.stringify(memories));
  }, [memories]);

  // Utility to calculate "Age at Memory"
  const getAgeAtDate = (dateString: string) => {
    const birthDate = new Date('2023-09-01'); // Mock birthdate
    const memoryDate = new Date(dateString);
    const diffTime = Math.abs(memoryDate.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 30) return `${diffDays} Days Old`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months} Months Old`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m Old` : `${years} Years Old`;
  };

  const handleGenerateDailyJournal = async () => {
    setIsGenerating(true);
    // Simulate generation delay and AI service call
    const story = await generateJournalEntry('Arlo', [{id: '1', type: 'feed', timestamp: new Date()}, {id: '2', type: 'sleep', timestamp: new Date()}]);
    
    const newMemory: Memory = {
      id: Date.now().toString(),
      title: story.title,
      date: new Date().toISOString().split('T')[0],
      description: story.body,
      isAiGenerated: true,
      // No image for AI text entries
      imageUrl: undefined 
    };

    setMemories([newMemory, ...memories]);
    setIsGenerating(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newMem: Memory = {
            id: Date.now().toString(),
            title: 'New Memory',
            date: new Date().toISOString().split('T')[0],
            description: 'Tap to edit description...',
            imageUrl: result,
        };
        setMemories([newMem, ...memories]);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteMemory = (id: string) => {
    if (window.confirm("Delete this memory?")) {
      setMemories(memories.filter(m => m.id !== id));
      setSelectedMemory(null);
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-12 bg-[#F4F1EA]"> {/* Warm paper color */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handlePhotoUpload}
      />

      {/* --- HEADER --- */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Memory Lane</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Arlo's Journey • {memories.length} Moments</p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
               <button 
                 onClick={handleGenerateDailyJournal} 
                 disabled={isGenerating} 
                 className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-bold text-xs hover:bg-purple-100 transition-colors border border-purple-100"
               >
                  {isGenerating ? <Sparkles size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                  AI Write
               </button>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 px-4 py-2 bg-dark text-white rounded-full font-bold text-xs hover:bg-black transition-colors shadow-lg shadow-gray-300 active:scale-95"
               >
                  <Plus size={16}/> <span className="hidden md:inline">Add Photo</span>
               </button>
            </div>
          </div>

          {/* Tabs & Filters */}
          <div className="flex flex-col gap-3">
             {/* View Toggle */}
            <div className="flex p-1 bg-gray-200/50 rounded-xl self-start">
               <button 
                 onClick={() => setActiveTab('journal')}
                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'journal' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Scrapbook
               </button>
               <button 
                 onClick={() => setActiveTab('capsule')}
                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'capsule' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Time Vault
               </button>
            </div>

            {/* Horizontal Filter Scroll */}
            {activeTab === 'journal' && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar w-full pb-2 -mx-4 px-4 md:mx-0 md:px-0 mask-linear-fade">
                 {FILTERS.map(filter => (
                   <button
                     key={filter}
                     onClick={() => setActiveFilter(filter)}
                     className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 ${activeFilter === filter ? 'bg-dark text-white border-dark' : 'bg-white text-gray-500 border-gray-200'}`}
                   >
                     {filter}
                   </button>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'journal' ? (
          /* --- SCRAPBOOK LAYOUT --- */
          <div className="animate-fade-in">
             
             {/* Masonry Grid: Single col on mobile for Polaroid effect, Multi on desktop */}
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-6">
                {memories.map((mem, index) => {
                  // Random rotation for scrapbook feel
                  const rotation = index % 2 === 0 ? '-rotate-1' : 'rotate-1';
                  const tapeStyle = index % 3 === 0 ? '-top-3 left-1/2 -translate-x-1/2 rotate-2' : '-top-3 right-8 -rotate-2';
                  
                  return (
                  <div 
                    key={mem.id} 
                    onClick={() => setSelectedMemory(mem)}
                    className={`relative group cursor-pointer transition-all duration-500 hover:z-10 hover:scale-105 ${rotation} hover:rotate-0`}
                  >
                     {/* Tape Effect */}
                     <div className={`absolute w-8 h-12 bg-white/40 backdrop-blur-sm border-l-2 border-r-2 border-white/20 shadow-sm z-20 ${tapeStyle}`}></div>

                     <div className="bg-white p-3 pb-12 md:pb-3 rounded-sm shadow-md border border-gray-200 hover:shadow-xl transition-shadow h-full flex flex-col">
                        {/* Polaroid Image Area */}
                        <div className="aspect-[4/5] md:aspect-square bg-gray-100 overflow-hidden mb-3 relative">
                             {mem.imageUrl ? (
                                <img 
                                    src={mem.imageUrl} 
                                    alt={mem.title} 
                                    className="w-full h-full object-cover filter sepia-[0.1] contrast-[1.05]" 
                                />
                             ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-purple-50 text-purple-300 p-6 text-center">
                                    <Sparkles size={48} className="mb-2" />
                                    <span className="font-serif italic text-sm text-purple-800">"{mem.description}"</span>
                                </div>
                             )}
                             
                             {/* Age Tag on Image */}
                             <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                {getAgeAtDate(mem.date)}
                             </div>
                        </div>

                        {/* Handwritten Caption */}
                        <div className="px-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-serif font-bold text-lg text-gray-800 leading-tight">{mem.title}</h3>
                                <span className="text-[10px] font-mono text-gray-400 mt-1">{mem.date}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-serif italic opacity-80">
                                {mem.description}
                            </p>
                        </div>
                     </div>
                  </div>
                )})}
             </div>

             {memories.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <Book size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 font-serif">The book is empty. Add a photo to start.</p>
                </div>
             )}

             {/* Footer Marker */}
             <div className="flex items-center justify-center gap-4 opacity-30 mt-12">
                <div className="h-px w-12 bg-gray-400"></div>
                <div className="flex flex-col items-center">
                   <Heart size={12} className="text-gray-500 fill-gray-500" />
                </div>
                <div className="h-px w-12 bg-gray-400"></div>
             </div>
          </div>
        ) : (
          /* --- TIME CAPSULE: VAULT UI --- */
          <div className="space-y-6 animate-fade-in">
             {/* Vault Header */}
             <div className="bg-[#2A2A2A] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-gray-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="relative z-10 text-center">
                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10 shadow-inner">
                      <Lock size={32} className="text-amber-400" />
                   </div>
                   <h2 className="text-2xl font-serif font-bold mb-2 tracking-wide text-amber-50">The Time Vault</h2>
                   <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed font-light">
                     Write letters to the future. Locked securely until the date you choose.
                   </p>
                   <button className="mt-6 bg-amber-500 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2 mx-auto">
                     <PenTool size={16} /> Write Letter
                   </button>
                </div>
             </div>

             {/* Sealed Letters Grid */}
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Sealed Messages</h3>
                <div className="grid gap-3">
                   {MOCK_CAPSULE.map(cap => (
                     <div key={cap.id} className="bg-white p-4 rounded-xl border-l-4 border-l-amber-500 border-y border-r border-gray-100 shadow-sm flex items-center gap-4 group cursor-not-allowed relative overflow-hidden">
                        <div className="absolute inset-0 bg-stripes-gray opacity-5 pointer-events-none"></div>
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 z-10">
                           <Lock size={16} />
                        </div>
                        <div className="flex-1 z-10">
                           <h4 className="font-bold text-gray-800 text-sm">{cap.title}</h4>
                           <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <Clock size={12} />
                              <span>Unlocks: <span className="text-amber-600 font-bold">{cap.unlockDate}</span></span>
                           </div>
                        </div>
                        <div className="hidden md:block text-[10px] font-bold text-gray-300 border border-gray-200 px-2 py-1 rounded uppercase z-10">
                           LOCKED
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* --- IMMERSIVE LIGHTBOX --- */}
      {selectedMemory && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl animate-fade-in">
           
           {/* Top Bar */}
           <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
              <button onClick={() => setSelectedMemory(null)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                 <X size={24} />
              </button>
              <div className="flex gap-3">
                 <button onClick={() => deleteMemory(selectedMemory.id)} className="p-3 bg-red-500/20 backdrop-blur-md rounded-full text-red-400 hover:bg-red-500/30 transition-colors">
                    <Trash2 size={20} />
                 </button>
                 <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                    <Share2 size={20} />
                 </button>
              </div>
           </div>

           {/* Image Area */}
           <div className="flex-1 flex items-center justify-center relative p-4">
              {selectedMemory.imageUrl ? (
                 <img 
                    src={selectedMemory.imageUrl} 
                    alt={selectedMemory.title} 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                 />
              ) : (
                 <div className="text-center p-8">
                    <Sparkles size={64} className="text-purple-400 mx-auto mb-4 opacity-50" />
                    <h2 className="text-white font-serif text-2xl">{selectedMemory.title}</h2>
                 </div>
              )}
           </div>

           {/* Bottom Sheet / Details */}
           <div className="bg-white rounded-t-3xl p-8 pb-10 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] animate-slide-up max-h-[45vh] overflow-y-auto relative">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="bg-dark text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {getAgeAtDate(selectedMemory.date)}
                        </span>
                        <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                            <Calendar size={14} /> {selectedMemory.date}
                        </span>
                    </div>
                    {selectedMemory.isAiGenerated && <Sparkles className="text-purple-500" size={20}/>}
                </div>

                <h2 className="text-3xl font-serif font-bold text-gray-900 leading-tight">{selectedMemory.title}</h2>
                
                <div className="prose prose-sm">
                    <p className="text-gray-600 leading-relaxed text-base font-light font-serif">
                        {selectedMemory.description}
                    </p>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MemoryLane;
