
import React, { useState, useEffect } from 'react';
import { Match, MatchStage, Team, BracketSelection } from '../types';

interface KnockoutPredictorProps {
  matches: Match[]; // Contains R32 to Final matches
  bracket: BracketSelection;
  onUpdateBracket: (matchId: string, winnerId: string, nextMatchId?: string) => void;
  onComplete: () => void;
}

const KnockoutPredictor: React.FC<KnockoutPredictorProps> = ({ matches, bracket, onUpdateBracket, onComplete }) => {
  const [activeStage, setActiveStage] = useState<MatchStage>(MatchStage.R32);
  
  // Group matches by stage for rendering
  const stages = [MatchStage.R32, MatchStage.R16, MatchStage.QF, MatchStage.SF, MatchStage.FINAL];
  
  // Filter matches for current visible stage
  const currentMatches = matches.filter(m => m.stage === activeStage);
  
  // Check if current stage is fully predicted
  const isStageComplete = currentMatches.every(m => bracket[m.id]);

  const handleAdvance = () => {
      const currentIndex = stages.indexOf(activeStage);
      if (currentIndex < stages.length - 1) {
          setActiveStage(stages[currentIndex + 1]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          onComplete();
      }
  };

  const handleTeamClick = (match: Match, team: Team) => {
      // 1. Set winner for this match
      onUpdateBracket(match.id, team.id, match.nextMatchId);
  };

  const handleRandomStageFill = () => {
      currentMatches.forEach(match => {
          // Randomly pick Home or Away
          // Note: In later stages, teams might be TBD if previous stage wasn't filled, 
          // but strictly following the flow ensures they are populated.
          const winner = Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
          
          // Safety check if teams are placeholders (though logic should prevent this if flow is followed)
          if (winner) {
            onUpdateBracket(match.id, winner.id, match.nextMatchId);
          }
      });

      // Auto advance after short delay
      setTimeout(() => {
          handleAdvance();
      }, 300);
  };

  const isFinal = activeStage === MatchStage.FINAL;

  return (
    <div className="animate-fade-in-up pb-32">
        <div className="text-center mb-6 relative">
          <span className="text-green-200 text-[10px] font-bold uppercase tracking-widest bg-[#004d40]/50 px-3 py-1 rounded-full">Etapa 3/3: El Camino a la Copa</span>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mt-2 drop-shadow-md">
             {activeStage}
          </h2>
          <p className="text-white/70 text-sm mt-1">Toca el equipo que pasa de ronda</p>

           {/* DEV BUTTON: Random Select */}
           <button 
                onClick={handleRandomStageFill}
                className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 rounded-full shadow-lg z-50 text-xs font-bold hover:bg-purple-500"
                title="Auto-fill Stage Randomly & Next"
            >
                ⚡ Random
            </button>
       </div>

       <div className="space-y-4">
           {currentMatches.map(match => {
               // Resolve teams dynamically based on previous round winners
               // Note: The parent component or `onUpdateBracket` logic must handle updating the `homeTeam`/`awayTeam` of subsequent matches
               // However, for this display component, we rely on `matches` being up-to-date.
               const winnerId = bracket[match.id];

               return (
                   <div key={match.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center relative">
                        <div className="bg-gray-100 w-full text-center py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {match.date} • {match.id.toUpperCase()}
                        </div>
                        
                        <div className="flex w-full divide-x divide-gray-100">
                            {/* Home Team Clickable Area */}
                            <button 
                                onClick={() => handleTeamClick(match, match.homeTeam)}
                                className={`flex-1 p-4 flex flex-col items-center transition-all ${winnerId === match.homeTeam.id ? 'bg-[#dcfce7] ring-inset ring-4 ring-[#4CAF50]' : 'hover:bg-gray-50'}`}
                            >
                                <img src={`https://flagcdn.com/w80/${match.homeTeam.flagCode}.png`} className="w-12 h-8 rounded shadow-sm object-cover mb-2" alt=""/>
                                <span className="text-xs font-black uppercase text-slate-900 leading-tight">{match.homeTeam.name}</span>
                                {winnerId === match.homeTeam.id && <span className="text-[10px] text-green-600 font-bold mt-1">AVANZA</span>}
                            </button>

                            {/* VS */}
                            <div className="flex items-center justify-center w-8 bg-gray-50">
                                <span className="text-xs font-bold text-gray-300">VS</span>
                            </div>

                            {/* Away Team Clickable Area */}
                            <button 
                                onClick={() => handleTeamClick(match, match.awayTeam)}
                                className={`flex-1 p-4 flex flex-col items-center transition-all ${winnerId === match.awayTeam.id ? 'bg-[#dcfce7] ring-inset ring-4 ring-[#4CAF50]' : 'hover:bg-gray-50'}`}
                            >
                                <img src={`https://flagcdn.com/w80/${match.awayTeam.flagCode}.png`} className="w-12 h-8 rounded shadow-sm object-cover mb-2" alt=""/>
                                <span className="text-xs font-black uppercase text-slate-900 leading-tight">{match.awayTeam.name}</span>
                                {winnerId === match.awayTeam.id && <span className="text-[10px] text-green-600 font-bold mt-1">AVANZA</span>}
                            </button>
                        </div>
                   </div>
               );
           })}
       </div>

       {/* Navigation */}
       <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#00332a] via-[#00332a] to-transparent z-40 flex justify-center">
            <button 
                onClick={handleAdvance}
                disabled={!isStageComplete}
                className={`w-full max-w-sm py-4 rounded-full font-black uppercase tracking-widest text-lg shadow-xl transition-all transform flex items-center justify-center gap-2 ${
                    isStageComplete 
                    ? 'bg-[#FFD700] text-[#004d40] hover:bg-yellow-400 active:translate-y-1' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
                {isFinal ? '¡CORONAR CAMPEÓN!' : 'Siguiente Ronda'}
            </button>
       </div>
    </div>
  );
};

export default KnockoutPredictor;
