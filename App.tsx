import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Match, MatchStage, Prediction, UserProde, Team, BracketSelection } from './types';
import { INITIAL_MATCHES, TEAMS, CANDIDATE_TEAMS } from './constants';
import { 
  generateUniqueId, 
  calculatePoints, 
  getTotalScore, 
  saveProde, 
  loadProde,
  mockSimulateResults,
  calculateGroupStandings,
  generateKnockoutMatches
} from './utils';
import MatchCard from './components/MatchCard';
import ShareView from './components/ShareView';
import CompareView from './components/CompareView';
import Onboarding from './components/Onboarding';
import GroupPredictor from './components/GroupPredictor';
import KnockoutPredictor from './components/KnockoutPredictor';
import DashboardGroups from './components/DashboardGroups';
import DashboardBracket from './components/DashboardBracket';

enum ViewState {
  ONBOARDING = 'ONBOARDING', // Stage 1
  GROUPS = 'GROUPS',         // Stage 2
  BRACKET = 'BRACKET',       // Stage 3
  SHARE = 'SHARE',           // Success
  DASHBOARD = 'DASHBOARD',   // Tracker
  COMPARE = 'COMPARE',       // VS
}

function App() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [bracket, setBracket] = useState<BracketSelection>({});
  
  const [currentUser, setCurrentUser] = useState<UserProde | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING);
  
  // Dashboard Tabs
  const [dashboardTab, setDashboardTab] = useState<'GROUPS' | 'BRACKET'>('GROUPS');
  
  // Create a map of ALL potential teams indexed by their lowercase ID
  const teamsById = useMemo(() => {
    const map: Record<string, Team> = {};
    Object.values(TEAMS).forEach(t => map[t.id] = t);
    Object.values(CANDIDATE_TEAMS).forEach(t => map[t.id] = t);
    return map;
  }, []);

  // Helper to swap placeholders with real teams based on user selection
  const resolveMatchesWithPlayoffs = (baseMatches: Match[], resolutions: Record<string, Team>): Match[] => {
      return baseMatches.map(match => {
          let newHome = match.homeTeam;
          let newAway = match.awayTeam;

          if (resolutions[match.homeTeam.id]) newHome = resolutions[match.homeTeam.id];
          if (resolutions[match.awayTeam.id]) newAway = resolutions[match.awayTeam.id];

          return { ...match, homeTeam: newHome, awayTeam: newAway };
      });
  };

  useEffect(() => {
    const saved = loadProde();
    if (saved) {
      setCurrentUser(saved);
      setPredictions(saved.predictions);
      setBracket(saved.bracket || {});
      
      if (saved.playoffResolutions) {
          // Re-generate group matches
          let resolvedMatches = resolveMatchesWithPlayoffs(INITIAL_MATCHES, saved.playoffResolutions);
          
          // Re-generate Bracket Matches if predictions exist
          if (Object.keys(saved.predictions).length > 0) {
              const standings = calculateGroupStandings(resolvedMatches, saved.predictions);
              
              const knockoutMatches = generateKnockoutMatches(standings, teamsById);
              
              // Restore bracket state to matches (Populate the tree)
              const stages = [MatchStage.R32, MatchStage.R16, MatchStage.QF, MatchStage.SF, MatchStage.FINAL];
              let currentTree = [...resolvedMatches, ...knockoutMatches];

              // We need to propagate winners stage by stage
              stages.forEach(stage => {
                   const stageMatches = currentTree.filter(m => m.stage === stage);
                   stageMatches.forEach(match => {
                       const winnerId = saved.bracket ? saved.bracket[match.id] : undefined;
                       const winnerTeam = winnerId ? teamsById[winnerId] : undefined;
                       
                       if (winnerTeam && match.nextMatchId) {
                           // Update next match
                           currentTree = currentTree.map(nextMatch => {
                               if (nextMatch.id === match.nextMatchId) {
                                   // Logic to decide Home vs Away slot
                                   // Simple heuristic: If Home is Placeholder (MEX) or same as this match winner, use Home.
                                   // Since we are reconstructing from scratch, placeholders are MEX.
                                   // We fill Home first, then Away.
                                   // To do this correctly without specific mapping, we rely on the fact that
                                   // generateKnockoutMatches creates standard slots.
                                   // Note: This naive filling works if the array order is consistent.
                                   // A better way is to check if homeTeam.id === 'mex' (default placeholder)
                                   
                                   if (nextMatch.homeTeam.id === 'mex') {
                                       return { ...nextMatch, homeTeam: winnerTeam };
                                   } else if (nextMatch.awayTeam.id === 'mex') {
                                       return { ...nextMatch, awayTeam: winnerTeam };
                                   }
                               }
                               return nextMatch;
                           });
                       }
                   });
              });

              setMatches(currentTree);
          } else {
              setMatches(resolvedMatches);
          }
      }
      
      setViewState(ViewState.DASHBOARD);
    } else {
      setViewState(ViewState.ONBOARDING);
    }
  }, [teamsById]);

  // --- STAGE 1: ONBOARDING COMPLETE ---
  const handleOnboardingComplete = (data: { name: string; country: string; club: string; resolutions: Record<string, Team> }) => {
      const userId = generateUniqueId(data.country);
      
      const resolvedMatches = resolveMatchesWithPlayoffs(INITIAL_MATCHES, data.resolutions);
      setMatches(resolvedMatches);

      // Initialize User State (not saved yet)
      const newProde: UserProde = {
          userId,
          userName: data.name,
          countryCode: data.country,
          club: data.club,
          predictions: {},
          playoffResolutions: data.resolutions,
          bracket: {},
          createdAt: Date.now()
      };
      setCurrentUser(newProde);
      
      // Move to Stage 2
      setViewState(ViewState.GROUPS);
  };

  const handlePredictionChange = (matchId: string, home: number | '', away: number | '') => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { matchId, homeScore: home, awayScore: away }
    }));
  };

  // --- STAGE 2: GROUPS COMPLETE ---
  const handleGroupsComplete = () => {
      // 1. Calculate Standings
      const standings = calculateGroupStandings(matches, predictions);
      
      // 2. Generate R32 Bracket
      const knockoutMatches = generateKnockoutMatches(standings, teamsById);
      
      // 3. Update State
      setMatches(prev => [...prev.filter(m => m.stage === MatchStage.GROUP), ...knockoutMatches]);
      
      // 4. Move to Stage 3
      setViewState(ViewState.BRACKET);
  };

  // --- STAGE 3: BRACKET UPDATE ---
  const handleBracketUpdate = (matchId: string, winnerId: string, nextMatchId?: string) => {
      // 1. Update selection
      setBracket(prev => ({ ...prev, [matchId]: winnerId }));

      // 2. Propagate to next match
      if (nextMatchId) {
          setMatches(prev => prev.map(m => {
              if (m.id === nextMatchId) {
                  const winnerTeam = teamsById[winnerId];
                  // Simple fill logic for interaction phase
                  if (m.homeTeam.id === 'mex' && m.awayTeam.id === 'mex') {
                       return { ...m, homeTeam: winnerTeam };
                  } else if (m.homeTeam.id !== 'mex' && m.awayTeam.id === 'mex') {
                       return { ...m, awayTeam: winnerTeam };
                  }
                  // If updating an existing choice, we can't easily distinguish home/away without more state.
                  // For the linear flow, this naive approach is acceptable.
                  return m;
              }
              return m;
          }));
      }
  };

  // --- FINAL SAVE ---
  const handleFinalSave = () => {
      if (currentUser) {
          const finalProde: UserProde = {
              ...currentUser,
              predictions,
              bracket
          };
          saveProde(finalProde);
          setCurrentUser(finalProde);
          setViewState(ViewState.SHARE);
      }
  };

  const toggleLiveSimulation = useCallback(() => {
    const updatedMatches = mockSimulateResults(matches);
    setMatches(updatedMatches);
  }, [matches]);

  const totalPoints = currentUser ? getTotalScore(currentUser.predictions, matches) : 0;

  // Render Logic
  const showHeader = viewState === ViewState.DASHBOARD || viewState === ViewState.COMPARE;

  return (
    <div className="min-h-screen pattern-pitch font-sans text-gray-100 selection:bg-[#1E90FF] selection:text-white">
      
      {/* Header (Only Dashboard) */}
      {showHeader && (
          <header className="bg-[#004d40] sticky top-0 z-40 border-b border-[#00332a] shadow-xl">
            <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-md">
                    Prode<span className="text-[#FFD700]">2026</span>
                </h1>
              </div>
               <div className="flex items-center gap-3">
                 <div className="text-right">
                    <span className="text-[10px] text-white/80 uppercase font-bold tracking-widest block">Tu Puntaje</span>
                    <span className="text-3xl font-black text-[#FFD700] leading-none score-font drop-shadow-md">{totalPoints}</span>
                 </div>
                 <span className="text-2xl">🏆</span>
               </div>
            </div>
            {/* Tabs */}
            {viewState === ViewState.DASHBOARD && (
                <div className="flex w-full bg-[#1a1a1a]">
                    <button 
                       onClick={() => setDashboardTab('GROUPS')}
                       className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${dashboardTab === 'GROUPS' ? 'text-[#4CAF50] border-b-4 border-[#4CAF50] bg-white/5' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                       Fase de Grupos
                    </button>
                    <button 
                       onClick={() => setDashboardTab('BRACKET')}
                       className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${dashboardTab === 'BRACKET' ? 'text-[#4CAF50] border-b-4 border-[#4CAF50] bg-white/5' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                       Eliminatorias
                    </button>
                </div>
            )}
          </header>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 pt-6">
        
        {viewState === ViewState.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {viewState === ViewState.GROUPS && (
           <GroupPredictor 
              matches={matches} 
              predictions={predictions} 
              onPredict={handlePredictionChange} 
              onComplete={handleGroupsComplete} 
           />
        )}

        {viewState === ViewState.BRACKET && (
            <KnockoutPredictor 
               matches={matches}
               bracket={bracket}
               onUpdateBracket={handleBracketUpdate}
               onComplete={handleFinalSave}
            />
        )}

        {viewState === ViewState.SHARE && currentUser && (
          <ShareView prode={currentUser} onBack={() => setViewState(ViewState.DASHBOARD)} />
        )}

        {viewState === ViewState.COMPARE && currentUser && (
            <CompareView myProde={currentUser} matches={matches} onBack={() => setViewState(ViewState.DASHBOARD)} />
        )}

        {viewState === ViewState.DASHBOARD && currentUser && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 animate-fade-in-up">
                  <div className="bg-[#004d40]/90 border border-green-700/50 p-4 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer hover:border-green-400 transition-colors backdrop-blur-sm" onClick={() => setViewState(ViewState.SHARE)}>
                     <div className="relative z-10">
                        <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest mb-1">Identidad</p>
                        <p className="font-mono text-sm font-bold text-white truncate uppercase">{currentUser.userId}</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => setViewState(ViewState.COMPARE)}
                    className="bg-gradient-to-br from-[#1E90FF] to-[#0056b3] text-white p-4 rounded-xl shadow-lg relative overflow-hidden hover:opacity-90 transition-all text-left border border-blue-400/30 backdrop-blur-sm"
                  >
                     <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Desafío</p>
                     <p className="font-bold text-lg leading-tight uppercase font-chakra">Comparar</p>
                  </button>
            </div>

            {/* List Matches for Active Tab */}
            {dashboardTab === 'GROUPS' ? (
                <DashboardGroups 
                    matches={matches} 
                    predictions={predictions} 
                    teamsById={teamsById} 
                />
            ) : (
                <DashboardBracket 
                    matches={matches} 
                    bracket={bracket} 
                    teamsById={teamsById} 
                />
            )}

            {/* Sim Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleLiveSimulation}
                    className="bg-gray-900 text-white w-12 h-12 rounded-full shadow-xl font-bold border border-gray-700 hover:bg-black flex items-center justify-center"
                    title="Simular Resultados"
                >
                    ▶
                </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;