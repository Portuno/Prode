
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
    <div className="w-full overflow-x-auto pb-12 pt-4 no-scrollbar animate-fade-in-up">
        {/* Container with min-width to ensure scrolling on mobile but fit on desktop if possible */}
        <div className="flex px-4 min-w-[200vw] md:min-w-[1200px] h-[800px] md:h-[600px]">
            
            {stages.map((stage, stageIndex) => {
                const stageMatches = getStageMatches(stage);
                const isFinal = stage === MatchStage.FINAL;

                return (
                    <div key={stage} className="flex flex-col flex-1 relative group">
                        {/* Header Sticky */}
                        <div className="text-center mb-4 sticky top-0 z-20">
                            <span className="bg-[#004d40] text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 shadow-sm">
                                {stage}
                            </span>
                        </div>

                        {/* Matches Column - Justify Around spreads them evenly to align with connectors */}
                        <div className="flex flex-col justify-around h-full relative z-10">
                            {stageMatches.map((match, index) => {
                                const winnerId = bracket[match.id];
                                const isHomeWinner = winnerId === match.homeTeam.id;
                                const isAwayWinner = winnerId === match.awayTeam.id;

                                return (
                                    <div key={match.id} className="relative flex items-center">
                                        
                                        {/* Connector Lines (Left side - entry) */}
                                        {stageIndex > 0 && (
                                            <div className="absolute -left-4 w-4 border-b-2 border-gray-400/30"></div>
                                        )}

                                        {/* Connector Lines (Right side - exit) */}
                                        {!isFinal && (
                                            <div className={`absolute -right-8 w-8 h-full border-r-2 border-gray-400/30 top-1/2 ${index % 2 === 0 ? 'border-t-2 rounded-tr-xl' : 'border-b-2 rounded-br-xl transform -translate-y-1/2'}`} style={{ height: '50%' }}></div>
                                        )}

                                        {/* MATCH CARD */}
                                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden w-full relative z-10 transition-transform hover:scale-105 duration-200">
                                            {/* Match ID Header */}
                                            <div className="bg-gray-50 border-b border-gray-100 px-2 py-0.5 flex justify-between items-center">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{match.date}</span>
                                                <span className="text-[8px] font-bold text-gray-300">#{match.id.replace('m', '')}</span>
                                            </div>

                                            {/* Home Team */}
                                            <div className={`flex items-center justify-between px-2 py-1.5 border-b border-gray-100 transition-colors ${isHomeWinner ? 'bg-emerald-100' : 'opacity-60 grayscale-[0.5]'}`}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <img src={`https://flagcdn.com/w40/${match.homeTeam.flagCode}.png`} className="w-5 h-3.5 rounded-[2px] shadow-sm object-cover" />
                                                    <span className={`text-[10px] md:text-xs font-bold uppercase truncate max-w-[80px] ${isHomeWinner ? 'text-emerald-900' : 'text-gray-500'}`}>
                                                        {match.homeTeam.name}
                                                    </span>
                                                </div>
                                                {isHomeWinner && <span className="text-[8px] bg-emerald-600 text-white px-1 rounded-sm ml-1">✓</span>}
                                            </div>

                                            {/* Away Team */}
                                            <div className={`flex items-center justify-between px-2 py-1.5 transition-colors ${isAwayWinner ? 'bg-emerald-100' : 'opacity-60 grayscale-[0.5]'}`}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <img src={`https://flagcdn.com/w40/${match.awayTeam.flagCode}.png`} className="w-5 h-3.5 rounded-[2px] shadow-sm object-cover" />
                                                    <span className={`text-[10px] md:text-xs font-bold uppercase truncate max-w-[80px] ${isAwayWinner ? 'text-emerald-900' : 'text-gray-500'}`}>
                                                        {match.awayTeam.name}
                                                    </span>
                                                </div>
                                                {isAwayWinner && <span className="text-[8px] bg-emerald-600 text-white px-1 rounded-sm ml-1">✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {/* Champion Column */}
            <div className="flex flex-col justify-center items-center w-64 md:w-80 ml-8 relative">
                 {/* Connector to Final */}
                 <div className="absolute left-0 w-8 border-b-2 border-gray-400/30"></div>

                 <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-1 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                     <div className="bg-[#004d40] rounded-xl p-6 text-center relative overflow-hidden">
                        <div className="pattern-net absolute inset-0 opacity-20"></div>
                        
                        <h3 className="text-[#FFD700] font-black italic uppercase text-xl mb-4 drop-shadow-md relative z-10 tracking-wider">
                            Tu Campeón
                        </h3>
                        
                        {champion ? (
                            <div className="relative z-10 animate-fade-in-up">
                                <div className="relative inline-block">
                                    <div className="absolute -inset-4 bg-yellow-500 blur-xl opacity-20 animate-pulse"></div>
                                    <img src={`https://flagcdn.com/w160/${champion.flagCode}.png`} className="w-28 h-20 mx-auto rounded-lg shadow-lg mb-4 object-cover border-2 border-[#FFD700] relative z-10" />
                                </div>
                                <div className="text-2xl font-black text-white uppercase drop-shadow-sm leading-none">{champion.name}</div>
                                <div className="mt-4 text-4xl filter drop-shadow-lg">🏆</div>
                            </div>
                        ) : (
                            <div className="text-white/40 font-bold uppercase text-xs border border-dashed border-white/20 p-4 rounded-lg">
                                Por definir
                            </div>
                        )}
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardBracket;
