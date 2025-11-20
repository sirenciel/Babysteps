
import React, { useState } from 'react';
import { generateMPASIRecipe, analyzeFoodSafety } from '../services/geminiService';
import { Recipe, FoodSafetyInfo } from '../types';
import { Utensils, ChefHat, Leaf, AlertCircle, Loader2, Search, ShieldCheck, AlertTriangle } from 'lucide-react';

const NutritionHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'library'>('recipes');
  const [age, setAge] = useState(6);
  
  // Recipe State
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // Food Library State
  const [searchQuery, setSearchQuery] = useState('');
  const [foodInfo, setFoodInfo] = useState<FoodSafetyInfo | null>(null);
  const [loadingFood, setLoadingFood] = useState(false);

  const getRecipe = async () => {
    setLoadingRecipe(true);
    const result = await generateMPASIRecipe(age);
    setRecipe(result);
    setLoadingRecipe(false);
  };

  const handleSearchFood = async () => {
    if(!searchQuery.trim()) return;
    setLoadingFood(true);
    const result = await analyzeFoodSafety(searchQuery);
    setFoodInfo(result);
    setLoadingFood(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-dark">Nutrition Hub</h2>
          <p className="text-gray-500">Solids, weaning recipes & food safety</p>
        </div>
        
        <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
           <button 
             onClick={() => setActiveTab('recipes')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'recipes' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             Recipes
           </button>
           <button 
             onClick={() => setActiveTab('library')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'library' ? 'bg-dark text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             Food Library
           </button>
        </div>
      </div>

      {activeTab === 'recipes' ? (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 overflow-hidden relative animate-fade-in">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
           
           <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
             <ChefHat className="text-primary" /> Smart Recipe Generator
           </h3>

           <div className="flex items-end gap-4 max-w-md mb-8">
              <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Baby Age (Months)</label>
                 <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <input 
                      type="range" min="6" max="24" step="1"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="bg-white px-3 py-1 rounded-lg font-bold text-dark shadow-sm min-w-[3rem] text-center">{age}m</span>
                 </div>
              </div>
              <button 
                onClick={getRecipe}
                disabled={loadingRecipe}
                className="bg-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {loadingRecipe ? <Loader2 className="animate-spin" size={18} /> : <Utensils size={18} />}
                Generate
              </button>
           </div>

           {recipe && (
             <div className="bg-[#F9F7F7] rounded-2xl p-6 border border-gray-200 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                   <h4 className="text-2xl font-bold text-primary">{recipe.name}</h4>
                   <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">{recipe.ageGroup}</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm"><Leaf size={14} /> Ingredients</h5>
                      <ul className="space-y-1">
                        {recipe.ingredients?.map((ing, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></span>
                            {ing}
                          </li>
                        )) || <li className="text-sm text-gray-400">No ingredients listed</li>}
                      </ul>
                   </div>
                   <div>
                      <h5 className="font-bold text-gray-800 mb-2 text-sm">Instructions</h5>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{recipe.instructions}</p>
                   </div>
                </div>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
             <h3 className="text-xl font-bold text-gray-800 mb-4">Food Encyclopedia</h3>
             <p className="text-gray-500 text-sm mb-4">Check how to safely serve food to your baby.</p>
             
             <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSearchFood()}
                     placeholder="e.g. Egg, Apple, Peanut Butter"
                     className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark/20"
                   />
                </div>
                <button 
                  onClick={handleSearchFood}
                  disabled={loadingFood || !searchQuery}
                  className="bg-dark text-white px-6 rounded-xl font-bold"
                >
                  {loadingFood ? <Loader2 className="animate-spin" /> : 'Check'}
                </button>
             </div>

             {foodInfo && (
               <div className="animate-fade-in">
                 <div className="flex items-center gap-4 mb-6">
                   <h2 className="text-3xl font-bold text-primary capitalize">{foodInfo.name}</h2>
                   <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold rounded-full text-sm">
                      {foodInfo.minAgeMonths}m+
                   </span>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-2xl border ${foodInfo.allergenRisk === 'high' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                       <div className="flex items-center gap-2 font-bold mb-1">
                          <ShieldCheck size={18} /> Allergen Risk
                       </div>
                       <div className="text-sm uppercase font-bold">{foodInfo.allergenRisk}</div>
                    </div>
                    <div className={`p-4 rounded-2xl border ${foodInfo.chokingHazard === 'high' ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                       <div className="flex items-center gap-2 font-bold mb-1">
                          <AlertTriangle size={18} /> Choking Risk
                       </div>
                       <div className="text-sm uppercase font-bold">{foodInfo.chokingHazard}</div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">How to Serve</h4>
                    {foodInfo.howToServe?.map((serve, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="w-16 flex-shrink-0 text-center">
                            <span className="block font-bold text-dark bg-secondary/30 rounded-lg py-1">{serve.ageGroup}</span>
                         </div>
                         <p className="text-gray-600 text-sm leading-relaxed">{serve.description}</p>
                      </div>
                    )) || <p className="text-sm text-gray-500">No serving instructions available.</p>}
                 </div>

                 <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
                    <strong>Benefits:</strong> {foodInfo.nutritionalBenefits}
                 </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionHub;
