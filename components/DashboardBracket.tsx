import React from 'react';
import { Match, MatchStage, BracketSelection, Team } from '../types';

interface DashboardBracketProps {
  matches: Match[];
  bracket: BracketSelection;
  teamsById: Record<string, Team>;
}

const DashboardBracket: React.FC<DashboardBracketProps> = ({ matches, bracket, teamsById }) => {
  const getStageMatches = (stage: MatchStage) => matches.filter(m => m.stage === stage);
  
  const stages = [MatchStage.R32, MatchStage.R16, MatchStage.QF, MatchStage.SF, MatchStage.FINAL];
  
  // Find Champion
  const finalMatch = matches.find(m => m.stage === MatchStage.FINAL);
  const championId = finalMatch ? bracket[finalMatch.id] : null;
  const champion = championId ? teamsById[championId] : null;

  return (
    <div className="overflow-x-auto pb-20 no-scrollbar animate-fade-in-up">
        <div className="flex gap-8 min-w-max px-4">
            {stages.map((stage) => (
                <div key={stage} className="flex flex-col gap-4 w-64">
                     <h3 className="text-white/80 font-bold uppercase tracking-widest text-center sticky left-0 mb-4">{stage}</h3>
                     <div className="flex flex-col justify-around h-full gap-4">
                        {getStageMatches(stage).map(match => {
                            const winnerId = bracket[match.id];
                            return (
                                <div key={match.id} className="bg-white rounded-lg shadow-md p-3 relative">
                                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-2 text-center">{match.id}</div>
                                    <div className={`flex justify-between items-center mb-1 p-1 rounded ${winnerId === match.homeTeam.id ? 'bg-yellow-100 font-bold' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <img src={`https://flagcdn.com/w20/${match.homeTeam.flagCode}.png`} className="w-5 h-3 rounded shadow-sm object-cover" />
                                            <span className="text-xs uppercase truncate w-24">{match.homeTeam.name}</span>
                                        </div>
                                    </div>
                                    <div className={`flex justify-between items-center p-1 rounded ${winnerId === match.awayTeam.id ? 'bg-yellow-100 font-bold' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <img src={`https://flagcdn.com/w20/${match.awayTeam.flagCode}.png`} className="w-5 h-3 rounded shadow-sm object-cover" />
                                            <span className="text-xs uppercase truncate w-24">{match.awayTeam.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                     </div>
                </div>
            ))}

            {/* Champion Card */}
            <div className="flex flex-col justify-center w-80 pl-8">
                 <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-2xl p-6 shadow-2xl text-center transform scale-110 border-4 border-white/30 relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/20 pattern-net opacity-30"></div>
                     <h3 className="text-white font-black italic uppercase text-2xl mb-4 drop-shadow-md relative z-10">¡Tu Campeón!</h3>
                     {champion ? (
                         <div className="relative z-10">
                             <img src={`https://flagcdn.com/w160/${champion.flagCode}.png`} className="w-32 h-20 mx-auto rounded-lg shadow-lg mb-4 object-cover border-4 border-white" />
                             <div className="text-3xl font-black text-white uppercase drop-shadow-sm">{champion.name}</div>
                             <div className="text-6xl mt-2 animate-bounce">🏆</div>
                         </div>
                     ) : (
                         <div className="text-white/60 font-bold uppercase relative z-10">Por definir</div>
                     )}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardBracket;