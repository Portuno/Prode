import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Match, MatchStage, Prediction, UserProde } from './types';
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
import CompareView from './components/CompareView';
import AIModal from './components/AIModal';

enum ViewState {
  EDITING = 'EDITING',
  DASHBOARD = 'DASHBOARD',
  SHARE = 'SHARE',
  COMPARE = 'COMPARE',
}

function App() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [currentUser, setCurrentUser] = useState<UserProde | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.EDITING);
  const [activeStage, setActiveStage] = useState<MatchStage>(MatchStage.GROUP);
  
  const [aiModalMatch, setAiModalMatch] = useState<Match | null>(null);

  useEffect(() => {
    const saved = loadProde();
    if (saved) {
      setCurrentUser(saved);
      setPredictions(saved.predictions);
      setViewState(ViewState.DASHBOARD);
    }
  }, []);

  // Sort matches by date then by group
  const visibleMatches = useMemo<Match[]>(() => {
     return matches
        .filter(m => m.stage === activeStage)
        .sort((a, b) => a.group && b.group ? a.group.localeCompare(b.group) : 0);
  }, [matches, activeStage]);

  // Group matches by Group Name for headings
  const groupedMatches = useMemo<Record<string, Match[]>>(() => {
      const groups: Record<string, Match[]> = {};
      visibleMatches.forEach(m => {
          const key = m.group ? `GRUPO ${m.group}` : m.stage;
          if (!groups[key]) groups[key] = [];
          groups[key].push(m);
      });
      return groups;
  }, [visibleMatches]);
  
  const handlePredictionChange = (matchId: string, home: number | '', away: number | '') => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { matchId, homeScore: home, awayScore: away }
    }));
  };

  const handleSave = () => {
    const hasPredictions = Object.keys(predictions).length > 0;
    if (!hasPredictions) {
      alert("Por favor, completa al menos un resultado antes de guardar.");
      return;
    }

    const userId = currentUser ? currentUser.userId : generateUniqueId('ARG');
    
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

  const toggleLiveSimulation = useCallback(() => {
    const updatedMatches = mockSimulateResults(matches);
    setMatches(updatedMatches);
  }, [matches]);

  const totalPoints = currentUser ? getTotalScore(currentUser.predictions, matches) : 0;

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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-20 selection:bg-emerald-200">
      
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                Prode<span className="text-emerald-500">2026</span>
            </h1>
          </div>
          
          {viewState === ViewState.DASHBOARD && (
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Puntos</span>
               <span className="text-2xl font-black text-emerald-600 leading-none score-font">{totalPoints}</span>
             </div>
          )}
        </div>

        {/* Navigation Tabs - Only show if not sharing/comparing */}
        {(viewState === ViewState.EDITING || viewState === ViewState.DASHBOARD) && (
          <div className="flex overflow-x-auto no-scrollbar border-t border-slate-100 bg-slate-50">
            {Object.values(MatchStage).map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`flex-shrink-0 px-5 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                  activeStage === stage 
                    ? 'text-emerald-600 border-b-2 border-emerald-500 bg-white' 
                    : 'text-slate-400 hover:text-slate-600'
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
        
        {viewState === ViewState.SHARE && currentUser && (
          <ShareView prode={currentUser} onBack={() => setViewState(ViewState.DASHBOARD)} />
        )}

        {viewState === ViewState.COMPARE && currentUser && (
            <CompareView myProde={currentUser} matches={matches} onBack={() => setViewState(ViewState.DASHBOARD)} />
        )}

        {(viewState === ViewState.DASHBOARD || viewState === ViewState.EDITING) && (
          <>
            {/* User Dashboard Header */}
            {viewState === ViewState.DASHBOARD && (
              <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setViewState(ViewState.SHARE)}>
                     <div className="relative z-10">
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Tu Código</p>
                        <p className="font-mono text-lg font-bold truncate">{currentUser?.userId.split('-')[1]}...{currentUser?.userId.split('-')[3]}</p>
                     </div>
                     <div className="absolute right-2 bottom-2 opacity-20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                     </div>
                  </div>

                  <button 
                    onClick={() => setViewState(ViewState.COMPARE)}
                    className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg relative overflow-hidden hover:bg-emerald-600 transition-colors text-left"
                  >
                     <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Competir</p>
                     <p className="font-bold text-lg leading-tight">Comparar Prode</p>
                  </button>
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-8">
              {Object.keys(groupedMatches).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Aún no hay partidos en esta fase.</p>
                </div>
              ) : (
                Object.entries(groupedMatches).map(([groupName, groupMatches]) => {
                  const matches = groupMatches as Match[];
                  return (
                    <div key={groupName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Sticky Group Header */}
                        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-4 py-2 z-10 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 uppercase tracking-widest text-sm">{groupName}</h3>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{matches.length} Partidos</span>
                        </div>
                        
                        <div>
                            {matches.map(match => {
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
                                    
                                    {/* AI Helper - Only visible when needed */}
                                    {!match.finished && viewState === ViewState.EDITING && (
                                        <button 
                                        onClick={() => openAiForMatch(match)}
                                        className="absolute top-2 right-2 md:right-auto md:left-2 p-1 bg-purple-100 text-purple-600 rounded-full opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-purple-200 z-20"
                                        title="Ask AI"
                                        >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
                                        </svg>
                                        </button>
                                    )}
                                    </div>
                                );
                            })}
                        </div>
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
                 className="w-full bg-slate-900 text-white py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] font-bold text-lg flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-[1px] transition-all border-b-4 border-slate-700 active:border-b-0"
               >
                 <span>GUARDAR PRODE</span>
                 <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
               </button>
              ) : (
                <div className="flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50">
                   <button
                    onClick={() => setViewState(ViewState.EDITING)}
                    className="flex-1 bg-white text-slate-900 py-3 rounded-xl shadow-sm font-bold border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-sm uppercase tracking-wider"
                  >
                    Editar
                  </button>
                   {/* SIMULATION BUTTON FOR DEMO */}
                   <button
                    onClick={toggleLiveSimulation}
                    className="flex-none bg-red-50 text-red-600 px-4 py-3 rounded-xl shadow-sm font-bold border border-red-100 hover:bg-red-100 active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center gap-1"
                    title="Simular Resultados en Vivo (Demo)"
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live Demo
                  </button>
                </div>
              )}
            </div>
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