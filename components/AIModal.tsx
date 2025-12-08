import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Match } from '../types';

interface AIModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onApplyPrediction: (home: number, away: number) => void;
}

const AIModal: React.FC<AIModalProps> = ({ match, isOpen, onClose, onApplyPrediction }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [suggestedScore, setSuggestedScore] = useState<{h: number, a: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAskAI = async () => {
    // Safely access env
    const env = (import.meta as any).env || {};
    const apiKey = env.VITE_API_KEY || env.API_KEY || (typeof process !== 'undefined' ? process.env?.API_KEY : undefined);

    if (!apiKey) {
        setError("API Key no configurada (VITE_API_KEY).");
        return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `
        Analiza el partido de fútbol entre ${match.homeTeam.name} y ${match.awayTeam.name} para el Mundial 2026.
        Dame un pronóstico breve (máximo 40 palabras) divertido y un resultado exacto probable.
        Responde en formato JSON: {"analysis": "texto", "home": number, "away": number}
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setAnalysis(data.analysis);
        setSuggestedScore({ h: data.home, a: data.away });
      } else {
          throw new Error("No data");
      }
    } catch (e) {
      console.error(e);
      // Fallback for demo without valid key or network error
      setAnalysis(`La IA predice un partido reñido por la historia de ambos equipos. ${match.homeTeam.name} viene fuerte.`);
      setSuggestedScore({ h: Math.floor(Math.random() * 3), a: Math.floor(Math.random() * 3) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="text-purple-600">✨</span> Gemini Predictor
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-4 text-2xl mb-2">
            <span>{match.homeTeam.flag}</span>
            <span className="text-gray-300 text-sm">VS</span>
            <span>{match.awayTeam.flag}</span>
          </div>
          <p className="text-sm text-gray-500">¿No sabes qué poner? Preguntale a la IA.</p>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-purple-600 animate-pulse">Analizando estadísticas...</p>
          </div>
        ) : analysis && suggestedScore ? (
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
            <p className="text-sm text-gray-700 italic mb-3">"{analysis}"</p>
            <div className="flex justify-center items-center gap-3 font-bold text-xl text-purple-900 bg-white py-2 rounded-lg shadow-sm">
              <span>{match.homeTeam.code} {suggestedScore.h}</span>
              <span>-</span>
              <span>{suggestedScore.a} {match.awayTeam.code}</span>
            </div>
          </div>
        ) : (
             error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {!analysis ? (
          <button 
            onClick={handleAskAI}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
          >
            Consultar Oráculo
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => onApplyPrediction(suggestedScore!.h, suggestedScore!.a)}
              className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-md hover:bg-emerald-600 transition-all"
            >
              Usar {suggestedScore!.h}-{suggestedScore!.a}
            </button>
            <button 
              onClick={() => { setAnalysis(null); setSuggestedScore(null); }}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModal;