import React, { useState, useEffect, useCallback } from 'react';
import { Match, MatchStage, Prediction, UserProde, ScoreResult } from './types';
import { INITIAL_MATCHES } from './constants';
import { 
  generateUniqueId, 
  calculatePoints, 
  getTotalScore, 
  saveProde, 
  loadProde,
  mockSimulateResults 
} from './utils';
import MatchCard from './components/MatchCard';
import ShareView from './components/ShareView';
import AIModal from './components/AIModal';

// Icons
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.58-10.38L5.59 9.4A6 6 0 005.59 20a6 6 0 0010.82-3.17c1.4-1.12 2.65-2.6 3.59-4.46l-4.41-1z" /></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.063 2.063 0 00-1.875-2.063h-.04a2.063 2.063 0 00-1.875 2.063v7.925m5.007 0H9.497m5.007 0v2.25H9.497v-2.25" /></svg>;

enum ViewState {
  EDITING = 'EDITING',
  DASHBOARD = 'DASHBOARD',
  SHARE = 'SHARE',
}

function App() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [currentUser, setCurrentUser] = useState<UserProde | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.EDITING);
  const [activeStage, setActiveStage] = useState<MatchStage>(MatchStage.GROUP);
  
  // AI Modal State
  const [aiModalMatch, setAiModalMatch] = useState<Match | null>(null);

  // Initialize
  useEffect(() => {
    const saved = loadProde();
    if (saved) {
      setCurrentUser(saved);
      setPredictions(saved.predictions);
      setViewState(ViewState.DASHBOARD);
    }
  }, []);

  // Update matches for active stage
  const visibleMatches = matches.filter(m => m.stage === activeStage);
  
  // Handle input change
  const handlePredictionChange = (matchId: string, home: number | '', away: number | '') => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { matchId, homeScore: home, awayScore: away }
    }));
  };

  const handleSave = () => {
    // Basic validation: check if at least one match is predicted
    const hasPredictions = Object.keys(predictions).length > 0;
    if (!hasPredictions) {
      alert("Por favor, completa al menos un resultado antes de guardar.");
      return;
    }

    const userId = currentUser ? currentUser.userId : generateUniqueId('ARG'); // Default country ARG for demo
    
    const newProde: UserProde = {
      userId,
      countryCode: 'ARG',
      predictions,
      createdAt: Date.now()
    };

    saveProde(newProde);
    setCurrentUser(newProde);
    setViewState(ViewState.SHARE);
  };

  // Simulation Logic (For Demo Purposes)
  const toggleLiveSimulation = useCallback(() => {
    const updatedMatches = mockSimulateResults(matches);
    setMatches(updatedMatches);
  }, [matches]);

  const totalPoints = currentUser ? getTotalScore(currentUser.predictions, matches) : 0;

  // AI Integration
  const openAiForMatch = (match: Match) => {
    setAiModalMatch(match);
  };

  const applyAiPrediction = (home: number, away: number) => {
    if (aiModalMatch) {
      handlePredictionChange(aiModalMatch.id, home, away);
      setAiModalMatch(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">PRODE<span className="text-emerald-400">2026</span></h1>
          </div>
          
          {viewState === ViewState.DASHBOARD && (
             <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
               <span className="text-xs text-slate-400 uppercase font-bold">Puntos</span>
               <span className="text-lg font-bold text-emerald-400 score-font">{totalPoints}</span>
             </div>
          )}
        </div>

        {/* Navigation Tabs */}
        {viewState !== ViewState.SHARE && (
          <div className="flex overflow-x-auto no-scrollbar border-t border-slate-800">
            {Object.values(MatchStage).map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  activeStage === stage 
                    ? 'border-emerald-500 text-white bg-slate-800' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4">
        
        {viewState === ViewState.SHARE ? (
          <ShareView prode={currentUser!} onBack={() => setViewState(ViewState.DASHBOARD)} />
        ) : (
          <>
            {/* Status Bar for Dashboard */}
            {viewState === ViewState.DASHBOARD && (
              <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md mb-6 flex justify-between items-center relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                  <TrophyIcon />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-80 uppercase mb-1">Tu ID de Jugador</p>
                  <p className="font-mono text-xl font-bold tracking-wider">{currentUser?.userId}</p>
                </div>
                <button 
                  onClick={() => setViewState(ViewState.SHARE)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-4">
              {visibleMatches.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Aún no hay partidos en esta fase.</p>
                </div>
              ) : (
                visibleMatches.map(match => {
                  const prediction = predictions[match.id] || { matchId: match.id, homeScore: '', awayScore: '' };
                  const result = currentUser ? calculatePoints(prediction, match) : undefined;
                  
                  return (
                    <div key={match.id} className="relative group">
                       <MatchCard 
                        match={match} 
                        prediction={prediction}
                        onPredict={handlePredictionChange}
                        result={result}
                        readOnly={viewState === ViewState.DASHBOARD && match.finished}
                      />
                      
                      {/* AI Helper Button (Only in Edit mode or if match not finished) */}
                      {!match.finished && viewState === ViewState.EDITING && (
                        <button 
                          onClick={() => openAiForMatch(match)}
                          className="absolute top-2 left-2 p-1.5 bg-purple-100 text-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-purple-200"
                          title="Ask AI"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4 z-50">
              {viewState === ViewState.EDITING ? (
                 <button
                 onClick={handleSave}
                 className="w-full bg-slate-900 text-white py-4 rounded-2xl shadow-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all border border-slate-700"
               >
                 <span>GUARDAR PRODE</span>
                 <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
               </button>
              ) : (
                <div className="flex gap-2">
                   <button
                    onClick={() => setViewState(ViewState.EDITING)}
                    className="flex-1 bg-white text-slate-900 py-3 rounded-xl shadow-lg font-bold border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Editar
                  </button>
                   {/* SIMULATION BUTTON FOR DEMO */}
                   <button
                    onClick={toggleLiveSimulation}
                    className="flex-none bg-red-100 text-red-600 px-4 py-3 rounded-xl shadow-lg font-bold hover:bg-red-200 active:scale-95 transition-all"
                    title="Simular Resultados en Vivo (Demo)"
                  >
                    ⚡ LIVE
                  </button>
                </div>
              )}
            </div>
            
            <div className="h-20"></div> {/* Spacer for fixed bottom bar */}
          </>
        )}
      </main>

      {/* AI Modal */}
      {aiModalMatch && (
        <AIModal 
          match={aiModalMatch} 
          isOpen={true} 
          onClose={() => setAiModalMatch(null)} 
          onApplyPrediction={applyAiPrediction} 
        />
      )}

    </div>
  );
}

export default App;
