
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Match, MatchStage, Prediction, UserProde, Team, BracketSelection } from './types';
import { INITIAL_MATCHES, TEAMS, CANDIDATE_TEAMS } from './constants';
import { 
  generateUniqueId, 
  getTotalScore, 
  mockSimulateResults,
  calculateGroupStandings,
  generateKnockoutMatches,
  BRACKET_MAP,
  saveProde, // LocalStorage Save
  loadProde, // LocalStorage Load
  clearProde
} from './utils';
import { supabase } from './supabaseClient';
import MatchCard from './components/MatchCard';
import ShareView from './components/ShareView';
import CompareView from './components/CompareView';
import Onboarding from './components/Onboarding';
import GroupPredictor from './components/GroupPredictor';
import KnockoutPredictor from './components/KnockoutPredictor';
import DashboardGroups from './components/DashboardGroups';
import DashboardBracket from './components/DashboardBracket';
import LeaguesView from './components/LeaguesView';
import AuthView from './components/AuthView';

enum ViewState {
  ONBOARDING = 'ONBOARDING', // Stage 1
  GROUPS = 'GROUPS',         // Stage 2
  BRACKET = 'BRACKET',       // Stage 3
  SHARE = 'SHARE',           // Success
  DASHBOARD = 'DASHBOARD',   // Tracker
  COMPARE = 'COMPARE',       // VS
}

type MainTab = 'MY_PRODE' | 'LEAGUES' | 'GLOBAL';

type GlobalRankUser = {
    username: string;
    total_score: number;
    country: string;
}

function App() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [bracket, setBracket] = useState<BracketSelection>({});
  
  const [currentUser, setCurrentUser] = useState<UserProde | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING); 
  const [session, setSession] = useState<any>(null);
  
  // UI State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('MY_PRODE');
  const [dashboardTab, setDashboardTab] = useState<'GROUPS' | 'BRACKET'>('GROUPS');
  
  // Global Ranking
  const [globalRanking, setGlobalRanking] = useState<GlobalRankUser[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  
  const teamsById = useMemo(() => {
    const map: Record<string, Team> = {};
    Object.values(TEAMS).forEach(t => map[t.id] = t);
    Object.values(CANDIDATE_TEAMS).forEach(t => map[t.id] = t);
    return map;
  }, []);

  const resolveMatchesWithPlayoffs = (baseMatches: Match[], resolutions: Record<string, Team>): Match[] => {
      return baseMatches.map(match => {
          let newHome = match.homeTeam;
          let newAway = match.awayTeam;

          if (resolutions[match.homeTeam.id]) newHome = resolutions[match.homeTeam.id];
          if (resolutions[match.awayTeam.id]) newAway = resolutions[match.awayTeam.id];

          return { ...match, homeTeam: newHome, awayTeam: newAway };
      });
  };

  // --- INITIALIZATION LOGIC (PRIORITIZE UX) ---
  useEffect(() => {
    const initApp = async () => {
        // 1. Check for Supabase Session first
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
            // If logged in, load from DB
            await loadProfileFromSupabase(session.user.id);
        } else {
            // If NOT logged in, check Local Storage
            const localData = loadProde();
            if (localData) {
                // Restore local state
                restoreStateFromData(localData);
            } else {
                // Brand new user -> Onboarding
                setViewState(ViewState.ONBOARDING);
            }
        }
    };
    initApp();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          loadProfileFromSupabase(session.user.id);
      } else {
          // If signed out, maybe clear current user or fallback to local?
          // For now, reload to reset state safely
          // window.location.reload(); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hydrate State from a UserProde object (Source agnostic)
  const restoreStateFromData = (data: UserProde) => {
      setCurrentUser(data);
      setPredictions(data.predictions);
      setBracket(data.bracket || {});

      if (data.playoffResolutions) {
          let resolvedMatches = resolveMatchesWithPlayoffs(INITIAL_MATCHES, data.playoffResolutions);
          
          // Re-calculate Bracket tree if predictions exist
          if (Object.keys(data.predictions).length > 0) {
              const standings = calculateGroupStandings(resolvedMatches, data.predictions);
              const knockoutMatches = generateKnockoutMatches(standings, teamsById);
              
              const stages = [MatchStage.R32, MatchStage.R16, MatchStage.QF, MatchStage.SF, MatchStage.FINAL];
              let currentTree = [...resolvedMatches, ...knockoutMatches];

              stages.forEach(stage => {
                    const stageMatches = currentTree.filter(m => m.stage === stage);
                    stageMatches.forEach(match => {
                        const winnerId = data.bracket ? data.bracket[match.id] : undefined;
                        if (winnerId && BRACKET_MAP[match.id]) {
                            const targetMap = BRACKET_MAP[match.id];
                            const winnerTeam = teamsById[winnerId];
                            if (winnerTeam) {
                                currentTree = currentTree.map(targetMatch => {
                                    if (targetMatch.id === targetMap.nextId) {
                                        if (targetMap.slot === 'home') return { ...targetMatch, homeTeam: winnerTeam };
                                        if (targetMap.slot === 'away') return { ...targetMatch, awayTeam: winnerTeam };
                                    }
                                    return targetMatch;
                                });
                            }
                        }
                    });
              });
              setMatches(currentTree);
          } else {
              setMatches(resolvedMatches);
          }

          // Smart Resume Logic
          const hasChampion = data.bracket && data.bracket['m64'];
          const hasGroupPredictions = Object.keys(data.predictions).length > 70; 
          
          if (hasChampion) {
              setViewState(ViewState.DASHBOARD);
          } else if (hasGroupPredictions) {
              setViewState(ViewState.BRACKET);
          } else {
              setViewState(ViewState.GROUPS);
          }
      } else {
          setViewState(ViewState.ONBOARDING);
      }
  };

  const loadProfileFromSupabase = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && data.prode_data) {
        restoreStateFromData(data.prode_data);
    } else {
        // User exists in Auth but has no profile data yet? 
        // Could happen if they registered but failed to save. 
        // Fallback to local data if available to merge?
        const local = loadProde();
        if (local) {
             restoreStateFromData(local);
             // Trigger immediate save to sync local to new empty profile
             saveProdeData(local, userId); 
        } else {
             setViewState(ViewState.ONBOARDING);
        }
    }
  };

  // --- HYBRID SAVE SYSTEM ---
  // Saves to LocalStorage (Always) AND Supabase (If Session exists)
  const saveProdeData = async (prode: UserProde, forceUserId?: string) => {
      // 1. Always save locally
      saveProde(prode);

      // 2. If logged in, save to Cloud
      const activeUserId = forceUserId || session?.user?.id;
      
      if (activeUserId) {
          const totalPoints = getTotalScore(prode.predictions, matches);
          // Omit updated_at if not in schema, include club if missing
          const updates = {
              id: activeUserId,
              username: prode.userName,
              country: prode.countryCode,
              club: prode.club,
              email: session?.user?.email,
              total_score: totalPoints,
              prode_data: prode
              // Removed updated_at to prevent schema errors if column missing
          };

          const { error } = await supabase.from('profiles').upsert(updates);
          if (error) console.error('Error saving to Cloud:', JSON.stringify(error));
      }
  };

  // --- ACTIONS ---

  const handleOnboardingComplete = (data: { name: string; country: string; club: string; resolutions: Record<string, Team> }) => {
      const userId = session?.user?.id || generateUniqueId(data.country);
      const resolvedMatches = resolveMatchesWithPlayoffs(INITIAL_MATCHES, data.resolutions);
      setMatches(resolvedMatches);

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
      saveProdeData(newProde);
      setViewState(ViewState.GROUPS);
  };

  const handlePredictionChange = (matchId: string, home: number | '', away: number | '') => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { matchId, homeScore: home, awayScore: away }
    }));
  };

  const handleGroupsComplete = () => {
      const standings = calculateGroupStandings(matches, predictions);
      const knockoutMatches = generateKnockoutMatches(standings, teamsById);
      setMatches(prev => [...prev.filter(m => m.stage === MatchStage.GROUP), ...knockoutMatches]);
      
      if (currentUser) {
          const updatedProde = { ...currentUser, predictions };
          setCurrentUser(updatedProde);
          saveProdeData(updatedProde);
      }
      setViewState(ViewState.BRACKET);
  };

  const handleBracketUpdate = (matchId: string, winnerId: string, nextMatchId?: string) => {
      setBracket(prev => ({ ...prev, [matchId]: winnerId }));

      if (BRACKET_MAP[matchId]) {
          const mapping = BRACKET_MAP[matchId];
          setMatches(prev => prev.map(m => {
              if (m.id === mapping.nextId) {
                  const winnerTeam = teamsById[winnerId];
                  if (mapping.slot === 'home') return { ...m, homeTeam: winnerTeam };
                  if (mapping.slot === 'away') return { ...m, awayTeam: winnerTeam };
              }
              return m;
          }));
      }
  };

  const handleFinalSave = () => {
      if (currentUser) {
          const finalProde = { ...currentUser, predictions, bracket };
          setCurrentUser(finalProde);
          saveProdeData(finalProde);
          setViewState(ViewState.DASHBOARD);
      }
  };

  const handleLoginSuccess = () => {
      setShowAuthModal(false);
      // If we have local data (`currentUser`), we need to re-save it now that we have a session
      // effectively merging the local "Anonymous" prode into the new "Account"
      if (currentUser) {
           // We might want to keep the local generated ID or swap to Auth ID? 
           // Usually better to keep the data but link to Auth ID.
           // `saveProdeData` will handle the upsert using the session ID.
           saveProdeData(currentUser).then(() => {
               alert('¡Tus pronósticos se han guardado en tu cuenta!');
           });
      }
  };

  const handleReset = async () => {
      if (window.confirm('¿Reiniciar todo? Se borrarán tus datos locales.')) {
          clearProde();
          if (session) {
             const { error } = await supabase.from('profiles').update({ prode_data: null, total_score: 0 }).eq('id', session.user.id);
          }
          window.location.reload();
      }
  };
  
  const handleSignOut = async () => {
      await supabase.auth.signOut();
      clearProde(); // Optional: clear local data on sign out?
      window.location.reload();
  };

  const toggleLiveSimulation = useCallback(() => {
    const updatedMatches = mockSimulateResults(matches);
    setMatches(updatedMatches);
    if (currentUser) saveProdeData(currentUser);
  }, [matches, currentUser]);

  const totalPoints = currentUser ? getTotalScore(currentUser.predictions, matches) : 0;

  // Fetch Global Ranking
  useEffect(() => {
      if (mainTab === 'GLOBAL') {
          setLoadingGlobal(true);
          supabase
            .from('profiles')
            .select('username, total_score, country')
            .order('total_score', { ascending: false })
            .limit(50)
            .then(({ data, error }) => {
                if (!error && data) setGlobalRanking(data as GlobalRankUser[]);
                setLoadingGlobal(false);
            });
      }
  }, [mainTab]);


  // --- RENDER ---

  const showHeader = viewState === ViewState.DASHBOARD || viewState === ViewState.COMPARE;

  return (
    <div className="min-h-screen pattern-pitch font-sans text-gray-100 selection:bg-[#1E90FF] selection:text-white relative">
      
      {/* AUTH MODAL OVERLAY */}
      {showAuthModal && (
          <AuthView 
            onLoginSuccess={handleLoginSuccess} 
            onClose={() => setShowAuthModal(false)}
          />
      )}

      {/* Header */}
      {showHeader && (
          <header className="bg-[#004d40] sticky top-0 z-40 shadow-xl">
            <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center border-b border-[#00332a]">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-md">
                    Prode<span className="text-[#FFD700]">2026</span>
                </h1>
              </div>
               <div className="flex items-center gap-3">
                 <div className="text-right">
                    <span className="text-[10px] text-white/80 uppercase font-bold tracking-widest block">Puntos</span>
                    <span className="text-2xl font-black text-[#FFD700] leading-none score-font drop-shadow-md">{totalPoints}</span>
                 </div>
                 {session ? (
                     <button onClick={handleSignOut} className="text-xs text-red-300 font-bold uppercase hover:text-white ml-2">Salir</button>
                 ) : (
                     <button onClick={() => setShowAuthModal(true)} className="bg-white text-[#004d40] px-3 py-1 rounded-full text-xs font-black uppercase hover:bg-gray-100">Login</button>
                 )}
               </div>
            </div>

            <nav className="flex w-full bg-[#00332a] max-w-2xl mx-auto">
                <button onClick={() => setMainTab('MY_PRODE')} className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all relative ${mainTab === 'MY_PRODE' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-gray-200'}`}>
                   Mi Prode
                   {mainTab === 'MY_PRODE' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4CAF50]"></div>}
                </button>
                <button onClick={() => setMainTab('LEAGUES')} className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all relative ${mainTab === 'LEAGUES' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-gray-200'}`}>
                   Ligas
                   {mainTab === 'LEAGUES' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4CAF50]"></div>}
                </button>
                <button onClick={() => setMainTab('GLOBAL')} className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all relative ${mainTab === 'GLOBAL' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-gray-200'}`}>
                   Global
                   {mainTab === 'GLOBAL' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4CAF50]"></div>}
                </button>
            </nav>

            {mainTab === 'MY_PRODE' && (
                <div className="flex w-full bg-[#1a1a1a] max-w-2xl mx-auto border-t border-white/5">
                    <button onClick={() => setDashboardTab('GROUPS')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${dashboardTab === 'GROUPS' ? 'text-[#4CAF50] bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Fase de Grupos</button>
                    <div className="w-px bg-white/10"></div>
                    <button onClick={() => setDashboardTab('BRACKET')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${dashboardTab === 'BRACKET' ? 'text-[#4CAF50] bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Eliminatorias</button>
                </div>
            )}
          </header>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 pt-6 pb-24">
        
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
            {/* REGISTRATION BANNER FOR ANONYMOUS USERS */}
            {!session && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center animate-fade-in-up">
                    <div>
                        <p className="font-bold text-sm uppercase">¡Guarda tu Prode!</p>
                        <p className="text-xs text-indigo-100 max-w-[200px] leading-tight mt-1">Regístrate para asegurar tus datos y competir en el ranking mundial.</p>
                    </div>
                    <button 
                        onClick={() => setShowAuthModal(true)}
                        className="bg-white text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase shadow-md hover:bg-indigo-50"
                    >
                        Crear Cuenta
                    </button>
                </div>
            )}

            {mainTab === 'MY_PRODE' && (
                <>
                    <div className="mb-6 grid grid-cols-2 gap-4 animate-fade-in-up">
                        <div className="bg-[#004d40]/90 border border-green-700/50 p-4 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer hover:border-green-400 transition-colors backdrop-blur-sm" onClick={() => setViewState(ViewState.SHARE)}>
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest mb-1">Tu Identidad</p>
                                <p className="font-mono text-sm font-bold text-white truncate uppercase">{currentUser.userName}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setViewState(ViewState.COMPARE)}
                            className="bg-gradient-to-br from-[#1E90FF] to-[#0056b3] text-white p-4 rounded-xl shadow-lg relative overflow-hidden hover:opacity-90 transition-all text-left border border-blue-400/30 backdrop-blur-sm"
                        >
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Desafío Rápido</p>
                            <p className="font-bold text-lg leading-tight uppercase font-chakra">Comparar</p>
                        </button>
                    </div>

                    {dashboardTab === 'GROUPS' ? (
                        <DashboardGroups matches={matches} predictions={predictions} teamsById={teamsById} />
                    ) : (
                        <DashboardBracket matches={matches} bracket={bracket} teamsById={teamsById} />
                    )}
                </>
            )}

            {mainTab === 'LEAGUES' && (
                <LeaguesView currentUser={currentUser} totalScore={totalPoints} />
            )}

            {mainTab === 'GLOBAL' && (
                <div className="animate-fade-in-up space-y-6">
                     <h2 className="text-2xl font-black uppercase italic text-center drop-shadow-md">Ranking Mundial</h2>
                     {loadingGlobal ? (
                         <div className="text-center p-8"><div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div></div>
                     ) : (
                         <div className="bg-white rounded-xl shadow-lg overflow-hidden text-slate-900">
                             {globalRanking.map((user, idx) => (
                                 <div key={idx} className={`flex items-center p-4 border-b border-gray-100 ${user.username === currentUser.userName ? 'bg-green-50' : ''}`}>
                                     <div className={`w-8 font-black text-lg ${idx < 3 ? 'text-[#FFD700]' : 'text-gray-400'}`}>#{idx + 1}</div>
                                     <div className="flex-1 font-bold uppercase">{user.username}</div>
                                     <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mr-3">{user.country}</div>
                                     <div className="font-black text-[#1E90FF]">{user.total_score} pts</div>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
            )}

            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                <button onClick={handleReset} className="bg-red-900/80 text-white w-12 h-12 rounded-full shadow-xl font-bold border border-red-700 hover:bg-red-800 flex items-center justify-center text-xs" title="Reiniciar App">RESET</button>
                <button onClick={toggleLiveSimulation} className="bg-gray-900 text-white w-12 h-12 rounded-full shadow-xl font-bold border border-gray-700 hover:bg-black flex items-center justify-center" title="Simular Resultados">▶</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
