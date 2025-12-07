
import React, { useState, useMemo } from 'react';
import { Match, Prediction, Team } from '../types';
import MatchCard from './MatchCard';

interface GroupPredictorProps {
  matches: Match[]; // All matches
  predictions: Record<string, Prediction>;
  onPredict: (matchId: string, home: number | '', away: number | '') => void;
  onComplete: () => void;
}

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const GroupPredictor: React.FC<GroupPredictorProps> = ({ matches, predictions, onPredict, onComplete }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const currentGroup = GROUPS[currentGroupIndex];

  const groupMatches = useMemo(() => {
    return matches.filter(m => m.group === currentGroup);
  }, [matches, currentGroup]);

  // Check if current group is complete
  const isGroupComplete = useMemo(() => {
    return groupMatches.every(m => {
        const p = predictions[m.id];
        return p && p.homeScore !== '' && p.awayScore !== '';
    });
  }, [groupMatches, predictions]);

  const handleNext = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (currentGroupIndex < GROUPS.length - 1) {
          setCurrentGroupIndex(prev => prev + 1);
      } else {
          onComplete();
      }
  };

  const handlePrev = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (currentGroupIndex > 0) {
          setCurrentGroupIndex(prev => prev - 1);
      }
  };

  const handleRandomFill = () => {
    groupMatches.forEach(m => {
        const home = Math.floor(Math.random() * 4); // 0-3 goals
        const away = Math.floor(Math.random() * 4);
        onPredict(m.id, home, away);
    });
  };

  const progress = ((currentGroupIndex) / GROUPS.length) * 100;

  return (
    <div className="animate-fade-in-up pb-32">
       {/* Progress Bar */}
       <div className="fixed top-[72px] left-0 right-0 h-1 bg-black/20 z-30">
          <div className="h-full bg-[#4CAF50] transition-all duration-300" style={{ width: `${progress}%` }}></div>
       </div>

       <div className="text-center mb-6 relative">
          <span className="text-green-200 text-[10px] font-bold uppercase tracking-widest bg-[#004d40]/50 px-3 py-1 rounded-full">Etapa 2/3: Fase de Grupos</span>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-2 drop-shadow-md">
             Grupo <span className="text-[#FFD700] text-4xl">{currentGroup}</span>
          </h2>

           {/* DEV BUTTON: Random Select */}
            <button 
                onClick={handleRandomFill}
                className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 rounded-full shadow-lg text-xs font-bold hover:bg-purple-500"
                title="Auto-fill Randomly (Testing)"
            >
                ⚡ Random
            </button>
       </div>

       <div className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-white/5">
          <div className="divide-y divide-white/5 p-3 space-y-4">
            {groupMatches.map(match => (
                <div key={match.id} className="relative group rounded-xl overflow-hidden shadow-lg">
                    <MatchCard 
                        match={match} 
                        prediction={predictions[match.id] || { matchId: match.id, homeScore: '', awayScore: '' }}
                        onPredict={onPredict}
                        result={undefined}
                    />
                </div>
            ))}
          </div>
       </div>

       {/* Floating Navigation */}
       <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#00332a] via-[#00332a] to-transparent z-40 flex gap-3 justify-center items-end">
          <button 
             onClick={handlePrev}
             disabled={currentGroupIndex === 0}
             className={`px-6 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl transition-all ${
                 currentGroupIndex === 0 
                 ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed opacity-0' 
                 : 'bg-white text-gray-900 hover:bg-gray-100'
             }`}
          >
             Anterior
          </button>

          <button 
             onClick={handleNext}
             disabled={!isGroupComplete}
             className={`flex-1 max-w-xs py-4 rounded-full font-black uppercase tracking-widest text-lg shadow-[0_4px_0_rgba(0,0,0,0.3)] transition-all transform flex items-center justify-center gap-2 ${
                 isGroupComplete 
                 ? 'bg-[#FF5722] text-white hover:bg-[#F4511E] active:translate-y-1 active:shadow-none' 
                 : 'bg-gray-700 text-gray-400 cursor-not-allowed'
             }`}
          >
             {currentGroupIndex === GROUPS.length - 1 ? 'Calcular Clasificados' : 'Siguiente Grupo'}
             {isGroupComplete && (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             )}
          </button>
       </div>
    </div>
  );
};

export default GroupPredictor;
