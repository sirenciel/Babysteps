
import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Lightbulb, Loader2 } from 'lucide-react';
import { generateDailyPlayIdea } from '../services/geminiService';

const DailyActivityCard: React.FC = () => {
  const [activity, setActivity] = useState<{ title: string; description: string; benefit: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadActivity = async () => {
    setLoading(true);
    const isToddler = localStorage.getItem('is_toddler_mode') === 'true';
    const age = isToddler ? 36 : 4; // 3 years or 4 months

    // Ideally, we bypass local storage cache if the age mode changed, or we key the cache by age.
    // For demo simplicity, we just fetch new.
    
    try {
        const result = await generateDailyPlayIdea(age); 
        setActivity(result);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();

    // Listen for the custom event from Dashboard
    const handleModeChange = () => {
        loadActivity();
    };

    window.addEventListener('age_mode_change', handleModeChange);
    return () => window.removeEventListener('age_mode_change', handleModeChange);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 bg-white p-2 rounded-bl-2xl shadow-sm border-b border-l border-orange-100">
        <Lightbulb className="text-orange-400" size={20} />
      </div>
      
      <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
        <Sparkles size={16} className="text-orange-500" /> Play Idea of the Day
      </h3>
      
      <h4 className="text-xl font-bold text-gray-800 mb-2">{activity.title}</h4>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {activity.description}
      </p>
      
      <div className="bg-white/60 rounded-xl p-3 text-xs font-bold text-orange-800 border border-orange-200/50 inline-block">
        Benefit: {activity.benefit}
      </div>
    </div>
  );
};

export default DailyActivityCard;
