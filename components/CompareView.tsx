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
        <div className="flex items-center gap-2 mb-6 cursor-pointer text-slate-500 hover:text-slate-800" onClick={onBack}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="font-bold">Volver</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase italic">Comparar Prode</h2>

        {!friendProde ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase">Ingresá el Código de tu amigo</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={friendId}
                        onChange={(e) => setFriendId(e.target.value)}
                        placeholder="PRODE-XXX-2026-XXXX"
                        className="flex-1 p-3 border-2 border-slate-200 rounded-lg font-mono uppercase focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
                    />
                    <button 
                        onClick={handleCompare}
                        className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                    >
                        VS
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Probá cualquier código para la demo (ej: PRODE-BRA)</p>
            </div>
        ) : (
            <div>
                {/* Scoreboard Head-to-Head */}
                <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    
                    <div className="text-center z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase">Vos</p>
                        <p className="text-4xl font-black text-emerald-400 score-font">{myTotal}</p>
                    </div>

                    <div className="text-2xl font-black text-slate-600 z-10 italic">VS</div>

                    <div className="text-center z-10">
                        <p className="text-xs font-bold text-slate-400 uppercase">Amigo</p>
                        <p className="text-4xl font-black text-white score-font">{friendTotal}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex bg-slate-50 border-b border-slate-200 p-3 text-xs font-bold text-slate-500 uppercase">
                        <div className="flex-1">Partido</div>
                        <div className="w-16 text-center text-emerald-600">Vos</div>
                        <div className="w-16 text-center text-blue-600">Rival</div>
                        <div className="w-12 text-center text-gray-400">Pts</div>
                    </div>

                    {matches.filter(m => m.finished).length === 0 && (
                        <div className="p-8 text-center text-slate-400 italic">
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
                            <div key={match.id} className="flex items-center p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{match.homeTeam.flag}</span>
                                        <span className="text-xs font-bold text-slate-700">{match.officialHomeScore}-{match.officialAwayScore}</span>
                                        <span className="text-lg">{match.awayTeam.flag}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block">{match.homeTeam.code} vs {match.awayTeam.code}</span>
                                </div>
                                <div className="w-16 text-center font-bold font-mono text-slate-800 bg-emerald-50 py-1 rounded">
                                    {myPred?.homeScore ?? '-'}:{myPred?.awayScore ?? '-'}
                                </div>
                                <div className="w-16 text-center font-bold font-mono text-slate-800 bg-blue-50 py-1 rounded ml-2">
                                    {friendPred?.homeScore ?? '-'}:{friendPred?.awayScore ?? '-'}
                                </div>
                                <div className={`w-12 text-center font-bold text-xs ml-2 ${win ? 'text-emerald-500' : draw ? 'text-gray-400' : 'text-red-400'}`}>
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