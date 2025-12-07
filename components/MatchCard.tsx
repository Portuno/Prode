import React from 'react';
import { Match, Prediction, ScoreResult } from '../types';

interface MatchCardProps {
  match: Match;
  prediction: Prediction;
  onPredict: (matchId: string, home: number | '', away: number | '') => void;
  result?: ScoreResult;
  readOnly?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, prediction, onPredict, result, readOnly = false }) => {
  const homeScore = prediction?.homeScore ?? '';
  const awayScore = prediction?.awayScore ?? '';

  const getStatusColor = () => {
    if (!result || result.status === 'PENDIENTE') return 'border-transparent';
    if (result.status === 'EXACTO') return 'border-l-4 border-l-emerald-500 bg-emerald-50/50';
    if (result.status === 'GANADOR') return 'border-l-4 border-l-blue-500 bg-blue-50/50';
    return 'border-l-4 border-l-red-400 bg-red-50/50';
  };

  const PointsBadge = () => {
    if (!result || result.status === 'PENDIENTE') return null;
    const colors = {
      'EXACTO': 'bg-emerald-500 text-white shadow-emerald-200',
      'GANADOR': 'bg-blue-500 text-white shadow-blue-200',
      'FALLO': 'bg-red-500 text-white shadow-red-200',
      'PENDIENTE': ''
    };
    return (
      <div className={`absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shadow-md z-10 ${colors[result.status]}`}>
        {result.points}
      </div>
    );
  };

  return (
    <div className={`relative bg-white border-b border-gray-100 last:border-0 p-3 md:p-4 transition-all ${getStatusColor()}`}>
      {/* Paper line effect */}
      
      <div className="flex justify-between items-center mb-2">
         <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
            {match.date}
         </span>
         {match.stadium && (
            <span className="text-[10px] md:text-xs text-gray-400 truncate max-w-[120px]">
                {match.stadium}
            </span>
         )}
      </div>

      <div className="flex items-center gap-3">
        {/* Teams and Inputs */}
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
            
            {/* Home */}
            <div className="flex items-center justify-end gap-2 md:gap-3 text-right">
                <span className="font-bold text-slate-800 text-sm md:text-base leading-tight uppercase hidden md:block">
                    {match.homeTeam.name}
                </span>
                <span className="font-bold text-slate-800 text-sm md:text-base leading-tight uppercase md:hidden">
                    {match.homeTeam.code}
                </span>
                <span className="text-2xl md:text-3xl">{match.homeTeam.flag}</span>
            </div>

            {/* Score Inputs */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <input
                    type="tel"
                    maxLength={2}
                    disabled={readOnly || match.finished}
                    value={homeScore}
                    onChange={(e) => onPredict(match.id, e.target.value === '' ? '' : parseInt(e.target.value), awayScore)}
                    className="w-10 h-10 md:w-12 md:h-12 text-center text-xl md:text-2xl font-bold bg-white rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none score-font placeholder-gray-200 text-slate-900 disabled:opacity-80 disabled:bg-gray-50"
                    placeholder="-"
                />
                <span className="text-gray-300 font-bold px-1">-</span>
                <input
                    type="tel"
                    maxLength={2}
                    disabled={readOnly || match.finished}
                    value={awayScore}
                    onChange={(e) => onPredict(match.id, homeScore, e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-10 h-10 md:w-12 md:h-12 text-center text-xl md:text-2xl font-bold bg-white rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none score-font placeholder-gray-200 text-slate-900 disabled:opacity-80 disabled:bg-gray-50"
                    placeholder="-"
                />
            </div>

            {/* Away */}
            <div className="flex items-center justify-start gap-2 md:gap-3 text-left">
                <span className="text-2xl md:text-3xl">{match.awayTeam.flag}</span>
                <span className="font-bold text-slate-800 text-sm md:text-base leading-tight uppercase hidden md:block">
                    {match.awayTeam.name}
                </span>
                <span className="font-bold text-slate-800 text-sm md:text-base leading-tight uppercase md:hidden">
                    {match.awayTeam.code}
                </span>
            </div>
        </div>
      </div>

      <PointsBadge />

      {/* Actual Result Display */}
      {match.finished && match.officialHomeScore !== undefined && (
          <div className="flex justify-center mt-2">
            <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full font-mono tracking-wider opacity-80">
                FINAL: {match.officialHomeScore} - {match.officialAwayScore}
            </span>
          </div>
      )}
    </div>
  );
};

export default MatchCard;