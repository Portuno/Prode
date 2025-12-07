
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Match, MatchStage, Prediction, UserProde, Team } from './types';
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
import Onboarding from './components/Onboarding';

enum ViewState {
  ONBOARDING = 'ONBOARDING',
  EDITING = 'EDITING',
  DASHBOARD = 'DASHBOARD',
  SHARE = 'SHARE',
  COMPARE = 'COMPARE',
}

function App() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [currentUser, setCurrentUser] = useState<UserProde | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING);
  const [activeStage, setActiveStage] = useState<MatchStage>(MatchStage.GROUP);
  
  // Helper to swap placeholders with real teams based on user selection
  const resolveMatchesWithPlayoffs = (baseMatches: Match[], resolutions: Record<string, Team>): Match[] => {
      return baseMatches.map(match => {
          let newHome = match.homeTeam;
          let newAway = match.awayTeam;

          // Check if home team is a placeholder that needs resolution
          if (resolutions[match.homeTeam.id]) {
              newHome = resolutions[match.homeTeam.id];
          }
          // Check if away team is a placeholder
          if (resolutions[match.awayTeam.id]) {
              newAway = resolutions[match.awayTeam.id];
          }

          return { ...match, homeTeam: newHome, awayTeam: newAway };
      });
  };

  useEffect(() => {
    const saved = loadProde();
    if (saved) {
      setCurrentUser(saved);
      setPredictions(saved.predictions);
      
      // If we have saved resolutions, apply them to the initial match list
      if (saved.playoffResolutions) {
          const resolvedMatches = resolveMatchesWithPlayoffs(INITIAL_MATCHES, saved.playoffResolutions);
          setMatches(resolvedMatches);
      }
      
      setViewState(ViewState.DASHBOARD);
    } else {
      // No saved data, start onboarding
      setViewState(ViewState.ONBOARDING);
    }
  }, []);

  const handleOnboardingComplete = (data: { name: string; country: string; club: string; resolutions: Record<string, Team> }) => {
      const userId = generateUniqueId(data.country);
      
      // Update matches with the selected teams
      const resolvedMatches = resolveMatchesWithPlayoffs(INITIAL_MATCHES, data.resolutions);
      setMatches(resolvedMatches);

      // Create initial user profile
      const newProde: UserProde = {
          userId,
          userName: data.name,
          countryCode: data.country,
          club: data.club,
          predictions: {},
          playoffResolutions: data.resolutions,
          createdAt: Date.now()
      };

      setCurrentUser(newProde);
      // We don't save to localStorage yet, wait until they click "Save Prode" with predictions? 
      // Actually, UX-wise it's better to save the identity now so they don't lose the onboarding.
      saveProde(newProde);
      
      setViewState(ViewState.EDITING);
  };

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

    if (currentUser) {
        const updatedProde: UserProde = {
            ...currentUser,
            predictions: predictions,
        };
        saveProde(updatedProde);
        setCurrentUser(updatedProde);
        setViewState(ViewState.SHARE);
    }
  };

  const toggleLiveSimulation = useCallback(() => {
    const updatedMatches = mockSimulateResults(matches);
    setMatches(updatedMatches);
  }, [matches]);

  const totalPoints = currentUser ? getTotalScore(currentUser.predictions, matches) : 0;

  return (
    <div className="min-h-screen pattern-pitch font-sans text-gray-100 pb-32 selection:bg-[#1E90FF] selection:text-white">
      
      {viewState === ViewState.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Header */}
      {viewState !== ViewState.ONBOARDING && (
          <header className="bg-[#004d40] sticky top-0 z-40 border-b border-[#00332a] shadow-xl">
            <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-md">
                    Prode<span className="text-[#FFD700]">2026</span>
                </h1>
              </div>
              
              {viewState === ViewState.DASHBOARD && (
                 <div className="flex items-center gap-3">
                   <div className="text-right">
                      <span className="text-[10px] text-white/80 uppercase font-bold tracking-widest block">Tu Puntaje</span>
                      <span className="text-3xl font-black text-[#FFD700] leading-none score-font drop-shadow-md">{totalPoints}</span>
                   </div>
                   <span className="text-2xl">🏆</span>
                 </div>
              )}
            </div>

            {/* Navigation Tabs */}
            {(viewState === ViewState.EDITING || viewState === ViewState.DASHBOARD) && (
              <div className="flex overflow-x-auto no-scrollbar border-t border-[#00332a] bg-[#1a1a1a]">
                {Object.values(MatchStage).map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`flex-shrink-0 px-6 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                      activeStage === stage 
                        ? 'text-[#4CAF50] border-b-4 border-[#4CAF50] bg-white/5' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            )}
          </header>
      )}

      {/* Main Content */}
      {viewState !== ViewState.ONBOARDING && (
      <main className="max-w-2xl mx-auto p-4">
        
        {viewState === ViewState.SHARE && currentUser && (
          <ShareView prode={currentUser} onBack={() => setViewState(ViewState.DASHBOARD)} />
        )}

        {viewState === ViewState.COMPARE && currentUser && (
            <CompareView myProde={currentUser} matches={matches} onBack={() => setViewState(ViewState.DASHBOARD)} />
        )}

        {(viewState === ViewState.DASHBOARD || viewState === ViewState.EDITING) && (
          <>
            {/* User Dashboard Buttons */}
            {viewState === ViewState.DASHBOARD && (
              <div className="mb-8 grid grid-cols-2 gap-4 animate-fade-in-up">
                  <div className="bg-[#004d40]/90 border border-green-700/50 p-5 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer hover:border-green-400 transition-colors backdrop-blur-sm" onClick={() => setViewState(ViewState.SHARE)}>
                     <div className="relative z-10">
                        <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest mb-1">Identidad</p>
                        <p className="font-mono text-lg font-bold text-white truncate">{currentUser?.userName || currentUser?.userId}</p>
                     </div>
                     <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-2 translate-y-2">
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v12h1v4l-3-3h-4l-3 3v-4H4V4zm2 2v10h8v-2h2v2h2V6H6z" /></svg>
                     </div>
                  </div>

                  <button 
                    onClick={() => setViewState(ViewState.COMPARE)}
                    className="bg-gradient-to-br from-[#1E90FF] to-[#0056b3] text-white p-5 rounded-xl shadow-lg relative overflow-hidden hover:opacity-90 transition-all text-left border border-blue-400/30 backdrop-blur-sm"
                  >
                     <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Desafío</p>
                     <p className="font-bold text-lg leading-tight uppercase font-chakra">Comparar vs Amigo</p>
                     <div className="absolute right-3 bottom-3 text-blue-200">
                        <span className="text-xl">⚔️</span>
                     </div>
                  </button>
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-8 animate-fade-in-up">
              {Object.keys(groupedMatches).length === 0 ? (
                <div className="text-center py-20 text-white/50">
                  <p className="text-lg font-bold">No hay partidos disponibles.</p>
                </div>
              ) : (
                Object.entries(groupedMatches).map(([groupName, groupMatches]) => {
                  const matches = groupMatches as Match[];
                  return (
                    <div key={groupName} className="rounded-xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm">
                        {/* Net Pattern Header */}
                        <div className="pattern-net border-b-4 border-black/20 px-6 py-4 flex justify-between items-center relative shadow-inner">
                            <h3 className="font-black text-white text-2xl uppercase tracking-tighter italic shadow-black drop-shadow-md z-10">{groupName}</h3>
                            <span className="text-[10px] font-bold text-white bg-red-600 border border-red-500 px-3 py-1 rounded-full z-10 shadow-sm">{matches.length} PARTIDOS</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent pointer-events-none"></div>
                        </div>
                        
                        <div className="divide-y divide-gray-100/10 p-2 md:p-3 space-y-3">
                            {matches.map(match => {
                                const prediction = predictions[match.id] || { matchId: match.id, homeScore: '', awayScore: '' };
                                const result = currentUser ? calculatePoints(prediction, match) : undefined;
                                
                                return (
                                    <div key={match.id} className="relative group rounded-xl overflow-hidden shadow-lg">
                                    <MatchCard 
                                        match={match} 
                                        prediction={prediction}
                                        onPredict={handlePredictionChange}
                                        result={result}
                                        readOnly={viewState === ViewState.DASHBOARD && match.finished}
                                    />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#00332a] to-transparent z-50 pointer-events-none flex justify-center">
              <div className="pointer-events-auto w-full max-w-sm pb-4">
              {viewState === ViewState.EDITING ? (
                 <button
                 onClick={handleSave}
                 className="w-full bg-gradient-to-b from-[#FF5722] to-[#D84315] text-white py-4 rounded-full shadow-[0_4px_0_rgb(160,50,10),0_10px_20px_rgba(0,0,0,0.4)] font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 transform hover:translate-y-[-2px] hover:shadow-[0_6px_0_rgb(160,50,10),0_15px_25px_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-[0_2px_0_rgb(160,50,10),0_5px_10px_rgba(0,0,0,0.4)] transition-all border border-white/20"
               >
                 <span className="drop-shadow-sm">GUARDAR PRODE</span>
                 <svg className="w-6 h-6 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
               </button>
              ) : (
                <div className="flex gap-3">
                   <button
                    onClick={() => setViewState(ViewState.EDITING)}
                    className="flex-1 bg-white text-black py-4 rounded-full shadow-xl font-black text-sm uppercase tracking-widest border-2 border-gray-200 hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    Editar Pronósticos
                  </button>
                   {/* SIMULATION BUTTON FOR DEMO */}
                   <button
                    onClick={toggleLiveSimulation}
                    className="flex-none bg-gray-900 text-white px-5 py-4 rounded-full shadow-xl font-bold border border-gray-700 hover:bg-black active:scale-95 transition-all flex items-center justify-center"
                    title="Simular Resultados en Vivo (Demo)"
                  >
                    <span className="w-2 h-2 bg-[#FF4500] rounded-full animate-pulse mr-2"></span>
                    LIVE
                  </button>
                </div>
              )}
              </div>
            </div>
          </>
        )}
      </main>
      )}

    </div>
  );
}

export default App;
