
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

  const PointsStamp = () => {
    if (!result || result.status === 'PENDIENTE') return null;

    if (result.status === 'EXACTO') {
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] border-4 border-[#1E90FF] text-[#1E90FF] bg-blue-50/95 px-2 py-1 rounded-lg font-black text-xl uppercase tracking-widest shadow-lg z-20 pointer-events-none flex flex-col items-center">
          <span className="leading-none">GOLAZO</span>
          <span className="text-[10px] bg-[#1E90FF] text-white px-1 rounded leading-tight">+5 PTS</span>
        </div>
      );
    }
    if (result.status === 'GANADOR') {
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] border-4 border-green-500 text-green-600 bg-green-50/95 px-2 py-1 rounded-lg font-black text-lg uppercase tracking-widest shadow-lg z-20 pointer-events-none flex flex-col items-center">
            <span className="leading-none">ACIERTO</span>
            <span className="text-[10px] bg-green-500 text-white px-1 rounded leading-tight">+3 PTS</span>
        </div>
      );
    }
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[12deg] text-red-500 opacity-30 z-0 pointer-events-none">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </div>
    );
  };

  return (
    <div className="relative p-4 md:p-6 bg-white hover:bg-gray-50 transition-colors">
      
      {/* Date & Time Header */}
      <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
         <span className="text-lg">⏱️</span>
         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {match.date}
         </span>
         {match.stadium && (
            <>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 uppercase truncate max-w-[120px]">
                {match.stadium}
            </span>
            </>
         )}
      </div>

      <div className="flex items-center justify-between gap-1 relative">
        
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-20 h-14 md:w-24 md:h-16 shadow-md rounded-lg overflow-hidden border-2 border-gray-100 relative group-hover:border-gray-200 transition-all bg-gray-100">
                <img 
                    src={`https://flagcdn.com/w160/${match.homeTeam.flagCode}.png`}
                    srcSet={`https://flagcdn.com/w160/${match.homeTeam.flagCode}.png 2x`}
                    alt={match.homeTeam.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <span className="font-bold text-slate-900 text-xs md:text-sm leading-tight uppercase text-center min-h-[2.5em] flex items-center justify-center w-full px-1">
                {match.homeTeam.name}
            </span>
        </div>

        {/* Inputs Center */}
        <div className="flex items-center gap-2 md:gap-4 z-10 mx-1">
            <input
                type="tel"
                maxLength={2}
                disabled={readOnly || match.finished}
                value={homeScore}
                onChange={(e) => onPredict(match.id, e.target.value === '' ? '' : parseInt(e.target.value), awayScore)}
                className="w-12 h-14 md:w-16 md:h-20 text-center text-2xl md:text-4xl font-black bg-gray-50 border-2 border-gray-300 rounded-xl shadow-inner focus:ring-4 focus:ring-blue-200 focus:border-[#1E90FF] outline-none score-font placeholder-gray-300 text-slate-900 disabled:opacity-70 disabled:bg-gray-100 transition-all"
                placeholder=""
            />
            
            <div className="text-gray-300 flex flex-col items-center">
              <span className="text-xl md:text-2xl">⚽</span>
            </div>

            <input
                type="tel"
                maxLength={2}
                disabled={readOnly || match.finished}
                value={awayScore}
                onChange={(e) => onPredict(match.id, homeScore, e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-12 h-14 md:w-16 md:h-20 text-center text-2xl md:text-4xl font-black bg-gray-50 border-2 border-gray-300 rounded-xl shadow-inner focus:ring-4 focus:ring-blue-200 focus:border-[#1E90FF] outline-none score-font placeholder-gray-300 text-slate-900 disabled:opacity-70 disabled:bg-gray-100 transition-all"
                placeholder=""
            />
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
             <div className="w-20 h-14 md:w-24 md:h-16 shadow-md rounded-lg overflow-hidden border-2 border-gray-100 relative group-hover:border-gray-200 transition-all bg-gray-100">
                <img 
                    src={`https://flagcdn.com/w160/${match.awayTeam.flagCode}.png`}
                    srcSet={`https://flagcdn.com/w160/${match.awayTeam.flagCode}.png 2x`}
                    alt={match.awayTeam.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <span className="font-bold text-slate-900 text-xs md:text-sm leading-tight uppercase text-center min-h-[2.5em] flex items-center justify-center w-full px-1">
                {match.awayTeam.name}
            </span>
        </div>

      </div>

      <PointsStamp />

      {/* Official Score Footer */}
      {match.finished && match.officialHomeScore !== undefined && (
          <div className="flex justify-center mt-4">
            <span className="bg-gray-900 text-white text-[10px] md:text-xs px-4 py-1.5 rounded-full font-mono tracking-widest shadow-sm border border-gray-700">
                FINAL: {match.officialHomeScore} - {match.officialAwayScore}
            </span>
          </div>
      )}
    </div>
  );
};

export default MatchCard;
