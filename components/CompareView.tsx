
import React, { useState } from 'react';
import { UserProde, Match, MatchStage } from '../types';
import { calculatePoints, generateMockFriendProde, getTotalScore } from '../utils';

interface CompareViewProps {
  myProde: UserProde;
  matches: Match[];
  onBack: () => void;
}

const CompareView: React.FC<CompareViewProps> = ({ myProde, matches, onBack }) => {
  const [friendId, setFriendId] = useState('');
  const [friendProde, setFriendProde] = useState<UserProde | null>(null);

  const handleCompare = () => {
    if (!friendId.trim()) return;
    // For demo, we generate a mock friend
    const mock = generateMockFriendProde(matches, friendId.toUpperCase());
    setFriendProde(mock);
  };

  const myTotal = getTotalScore(myProde.predictions, matches);
  const friendTotal = friendProde ? getTotalScore(friendProde.predictions, matches) : 0;

  return (
    <div className="animate-fade-in-up pb-20">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" onClick={onBack}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="font-bold uppercase tracking-widest text-xs">Volver</span>
        </div>

        <h2 className="text-3xl font-black text-gray-800 mb-6 uppercase italic drop-shadow-sm">Comparar <span className="text-[#1E90FF]">Prode</span></h2>

        {!friendProde ? (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Ingresá el Código de tu amigo</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={friendId}
                        onChange={(e) => setFriendId(e.target.value)}
                        placeholder="PRODE-XXX-2026-XXXX"
                        className="flex-1 p-3 border-2 border-gray-200 rounded-lg font-mono uppercase focus:border-[#1E90FF] focus:ring-4 focus:ring-blue-100 outline-none text-slate-900 bg-gray-50"
                    />
                    <button 
                        onClick={handleCompare}
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition-colors uppercase tracking-widest shadow-md"
                    >
                        VS
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">Probá cualquier código para la demo (ej: PRODE-BRA)</p>
            </div>
        ) : (
            <div>
                {/* Scoreboard Head-to-Head */}
                <div className="flex justify-between items-center bg-gray-900 border-b-4 border-[#1E90FF] text-white p-6 rounded-xl shadow-xl mb-8 relative overflow-hidden">
                    <div className="pattern-net absolute inset-0 opacity-10 pointer-events-none"></div>
                    
                    <div className="text-center z-10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vos</p>
                        <p className="text-5xl font-black text-[#1E90FF] score-font drop-shadow-md">{myTotal}</p>
                    </div>

                    <div className="text-3xl font-black text-gray-700 z-10 italic">VS</div>

                    <div className="text-center z-10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amigo</p>
                        <p className="text-5xl font-black text-white score-font drop-shadow-md">{friendTotal}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="flex bg-gray-50 border-b border-gray-200 p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="flex-1">Partido</div>
                        <div className="w-16 text-center text-[#1E90FF]">Vos</div>
                        <div className="w-16 text-center text-gray-600">Rival</div>
                        <div className="w-12 text-center text-gray-400">Pts</div>
                    </div>

                    {matches.filter(m => m.finished).length === 0 && (
                        <div className="p-8 text-center text-gray-400 italic">
                            No hay partidos finalizados para comparar puntos.
                        </div>
                    )}

                    {matches.filter(m => m.finished).map(match => {
                        const myPred = myProde.predictions[match.id];
                        const friendPred = friendProde.predictions[match.id];
                        const myPts = calculatePoints(myPred, match).points;
                        const friendPts = calculatePoints(friendPred, match).points;
                        const win = myPts > friendPts;
                        const draw = myPts === friendPts;

                        return (
                            <div key={match.id} className="flex items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                <div className="flex-1 flex items-center gap-3 overflow-hidden">
                                     <div className="flex flex-col items-center">
                                        <div className="flex -space-x-1 mb-1">
                                            <img src={`https://flagcdn.com/w40/${match.homeTeam.flagCode}.png`} className="w-6 h-4 rounded shadow-sm z-10 object-cover" alt=""/>
                                            <img src={`https://flagcdn.com/w40/${match.awayTeam.flagCode}.png`} className="w-6 h-4 rounded shadow-sm object-cover" alt=""/>
                                        </div>
                                     </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">{match.officialHomeScore}-{match.officialAwayScore}</span>
                                        <span className="text-[10px] text-gray-400 uppercase truncate">{match.homeTeam.code} vs {match.awayTeam.code}</span>
                                    </div>
                                </div>
                                <div className="w-16 text-center font-bold font-mono text-slate-800 bg-blue-50 py-1 rounded border border-blue-100">
                                    {myPred?.homeScore ?? '-'}:{myPred?.awayScore ?? '-'}
                                </div>
                                <div className="w-16 text-center font-bold font-mono text-slate-800 bg-gray-50 py-1 rounded ml-2 border border-gray-200">
                                    {friendPred?.homeScore ?? '-'}:{friendPred?.awayScore ?? '-'}
                                </div>
                                <div className={`w-12 text-center font-bold text-xs ml-2 ${win ? 'text-green-500' : draw ? 'text-gray-400' : 'text-red-400'}`}>
                                    {win ? `+${myPts - friendPts}` : draw ? '=' : `-${friendPts - myPts}`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
};

export default CompareView;
