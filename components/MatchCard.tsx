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

  const getBorderColor = () => {
    if (!result || result.status === 'PENDIENTE') return 'border-gray-200';
    if (result.status === 'EXACTO') return 'border-emerald-500 ring-2 ring-emerald-200';
    if (result.status === 'GANADOR') return 'border-blue-400';
    return 'border-red-300';
  };

  const getStatusBadge = () => {
    if (!result || result.status === 'PENDIENTE') return null;
    const colors = {
      'EXACTO': 'bg-emerald-100 text-emerald-800',
      'GANADOR': 'bg-blue-100 text-blue-800',
      'FALLO': 'bg-red-100 text-red-800',
      'PENDIENTE': ''
    };
    return (
      <span className={`absolute -top-3 right-4 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${colors[result.status]}`}>
        {result.status === 'EXACTO' ? '+5 PTS' : result.status === 'GANADOR' ? '+3 PTS' : '0 PTS'}
      </span>
    );
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border p-4 mb-4 transition-all duration-200 ${getBorderColor()}`}>
      {getStatusBadge()}
      
      {/* Date & Group info */}
      <div className="flex justify-between items-center mb-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
        <span>{match.stage} {match.group ? `• G${match.group}` : ''}</span>
        <span>{match.date.split(' ')[0]}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-4xl filter drop-shadow-sm grayscale-[0.2] transition-all hover:grayscale-0 transform hover:scale-110 cursor-default" title={match.homeTeam.name}>
            {match.homeTeam.flag}
          </span>
          <span className="font-bold text-gray-800 text-sm md:text-base text-center leading-tight">
            {match.homeTeam.code}
          </span>
        </div>

        {/* Inputs Area */}
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <input
            type="number"
            min="0"
            max="20"
            disabled={readOnly || match.finished}
            value={homeScore}
            onChange={(e) => onPredict(match.id, e.target.value === '' ? '' : parseInt(e.target.value), awayScore)}
            className="w-12 h-12 md:w-14 md:h-14 text-center text-2xl md:text-3xl font-bold rounded-lg border-2 border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all score-font disabled:opacity-60 disabled:bg-gray-100"
            placeholder="-"
          />
          
          <span className="text-gray-300 font-bold text-xl select-none">:</span>
          
          <input
            type="number"
            min="0"
            max="20"
            disabled={readOnly || match.finished}
            value={awayScore}
            onChange={(e) => onPredict(match.id, homeScore, e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-12 h-12 md:w-14 md:h-14 text-center text-2xl md:text-3xl font-bold rounded-lg border-2 border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all score-font disabled:opacity-60 disabled:bg-gray-100"
            placeholder="-"
          />
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-4xl filter drop-shadow-sm grayscale-[0.2] transition-all hover:grayscale-0 transform hover:scale-110 cursor-default" title={match.awayTeam.name}>
            {match.awayTeam.flag}
          </span>
          <span className="font-bold text-gray-800 text-sm md:text-base text-center leading-tight">
            {match.awayTeam.code}
          </span>
        </div>
      </div>

      {/* Official Score Display (if finished) */}
      {match.finished && match.officialHomeScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex justify-center items-center gap-2 text-xs text-gray-500">
          <span className="uppercase tracking-widest font-semibold">Resultado Final:</span>
          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
            {match.officialHomeScore} - {match.officialAwayScore}
          </span>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
