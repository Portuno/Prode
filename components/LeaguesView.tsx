
import React, { useState, useEffect } from 'react';
import { League, UserProde } from '../types';
import { supabase } from '../supabaseClient';

interface LeaguesViewProps {
  currentUser: UserProde;
  totalScore: number;
}

const LeaguesView: React.FC<LeaguesViewProps> = ({ currentUser, totalScore }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
      fetchMyLeagues();
  }, []);

  const fetchMyLeagues = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get IDs of leagues I belong to
      const { data: memberships } = await supabase
          .from('league_members')
          .select('league_id')
          .eq('user_id', user.id);
      
      if (memberships && memberships.length > 0) {
          const leagueIds = memberships.map(m => m.league_id);
          
          // 2. Fetch League Details
          const { data: leaguesData } = await supabase
              .from('leagues')
              .select('*')
              .in('id', leagueIds);

          if (leaguesData) {
              // 3. For each league, fetch members and calculate ranking
              const fullLeagues: League[] = await Promise.all(leaguesData.map(async (l: any) => {
                  const { data: membersData } = await supabase
                    .from('league_members')
                    .select('user_id')
                    .eq('league_id', l.id);
                  
                  const memberIds = membersData?.map(m => m.user_id) || [];
                  
                  // Fetch member profiles
                  const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, username, total_score')
                    .in('id', memberIds);
                  
                  const members = profiles?.map((p: any) => ({
                      userId: p.id,
                      userName: p.username || 'Anon',
                      score: p.total_score || 0,
                      rank: 0, // calc below
                      isCurrentUser: p.id === user.id
                  })) || [];
                  
                  // Sort ranking
                  members.sort((a, b) => b.score - a.score);
                  members.forEach((m, i) => m.rank = i + 1);

                  return {
                      id: l.id,
                      name: l.name,
                      code: l.code,
                      creatorId: l.creator_id,
                      members: members,
                      memberCount: members.length
                  };
              }));
              setLeagues(fullLeagues);
          }
      }
      setLoading(false);
  };

  // Handle Join
  const handleJoin = async () => {
      if (!joinCode.trim()) return;
      setLoading(true);
      setErrorMsg(null);
      
      try {
          // Find league by code
          const { data: league, error } = await supabase
             .from('leagues')
             .select('id')
             .eq('code', joinCode.trim())
             .single();
          
          if (error || !league) throw new Error('Código de liga no válido');

          const { data: { user } } = await supabase.auth.getUser();
          
          // Insert membership
          const { error: joinError } = await supabase
             .from('league_members')
             .insert({ league_id: league.id, user_id: user?.id });
          
          if (joinError) {
              if (joinError.code === '23505') throw new Error('Ya estás en esta liga');
              throw joinError;
          }

          alert('¡Te uniste a la liga!');
          setJoinCode('');
          fetchMyLeagues();

      } catch (err: any) {
          setErrorMsg(err.message);
      } finally {
          setLoading(false);
      }
  };

  // Handle Create
  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLeagueName.trim()) return;
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const code = `LIGA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // 1. Create League
      const { data: league, error } = await supabase
          .from('leagues')
          .insert({
              name: newLeagueName,
              code: code,
              creator_id: user.id
          })
          .select()
          .single();
      
      if (error) {
          alert('Error creando liga');
          setLoading(false);
          return;
      }

      // 2. Add creator as member
      await supabase
          .from('league_members')
          .insert({ league_id: league.id, user_id: user.id });

      setShowCreateModal(false);
      setNewLeagueName('');
      fetchMyLeagues();
      setLoading(false);
  };

  return (
    <div className="animate-fade-in-up pb-24 space-y-8">
        
        {/* --- SECTION 1: ACTIONS --- */}
        <div className="space-y-4">
            
            {/* Create Button (Hero Action) */}
            <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-[#FF5722] to-[#F4511E] text-white p-5 rounded-2xl shadow-xl flex items-center justify-between group transform transition-all hover:scale-[1.02] active:scale-95"
            >
                <div className="text-left">
                    <p className="text-xs font-bold text-orange-200 uppercase tracking-widest mb-1">Competencia</p>
                    <h3 className="text-2xl font-black italic uppercase leading-none">Crear Nueva Liga</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
            </button>

            {/* Join Section */}
            <div className="bg-white p-2 rounded-2xl shadow-lg flex flex-col gap-2 border border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-3 rounded-xl">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-6-6 1-1 3.486 4.714A6 6 0 1115 7z" /></svg>
                    </div>
                    <input 
                        type="text" 
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder="Pegar Código de Invitación"
                        className="flex-1 font-bold text-slate-800 outline-none uppercase placeholder-gray-300 text-sm"
                    />
                    <button 
                        onClick={handleJoin}
                        disabled={!joinCode.trim() || loading}
                        className="bg-[#004d40] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-xs hover:bg-[#00695c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? '...' : 'Unirse'}
                    </button>
                </div>
                {errorMsg && <p className="text-red-500 text-xs font-bold px-2">{errorMsg}</p>}
            </div>
        </div>

        {/* --- SECTION 2: MY LEAGUES --- */}
        <div>
            <h3 className="text-white font-black italic uppercase text-xl mb-4 drop-shadow-md flex items-center gap-2">
                <span>Mis Ligas</span>
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full not-italic font-sans">{leagues.length}</span>
            </h3>

            {loading && leagues.length === 0 ? (
                <div className="text-white/50 text-center text-sm font-bold">Cargando ligas...</div>
            ) : leagues.length === 0 ? (
                <div className="bg-white/10 p-6 rounded-xl text-center">
                    <p className="text-white/70 font-bold">No estás en ninguna liga aún.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leagues.map(league => {
                        const myStats = league.members.find(m => m.isCurrentUser) || { rank: '-', userName: 'You', score: 0, isCurrentUser: true, userId: '' };
                        
                        // Safety check to avoid reduce on empty array
                        const leader = league.members.length > 0 
                            ? league.members.reduce((prev, current) => (prev.score > current.score) ? prev : current)
                            : { userName: '-', score: 0 };

                        return (
                            <div key={league.id} className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all relative group">
                                {/* Decorative Top Border */}
                                <div className="h-1 bg-gradient-to-r from-[#1E90FF] to-[#004d40]"></div>
                                
                                <div className="p-5 flex justify-between items-center relative z-10">
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg uppercase leading-tight mb-1 group-hover:text-[#1E90FF] transition-colors">{league.name}</h4>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Cód: {league.code}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{league.memberCount} Jugadores</p>
                                    </div>

                                    <div className="text-right">
                                        <div className="bg-gray-100 px-3 py-1 rounded-lg inline-block mb-1">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase mr-2">Tu Puesto</span>
                                            <span className={`text-lg font-black ${myStats.rank === 1 ? 'text-[#FFD700]' : 'text-slate-800'}`}>#{myStats.rank}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold">Líder: {leader.userName} ({leader.score})</p>
                                    </div>
                                </div>
                                
                                {/* Hover Arrow */}
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* CREATE MODAL */}
        {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                    <h3 className="text-xl font-black text-slate-900 uppercase mb-4">Nueva Liga</h3>
                    <form onSubmit={handleCreate}>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre de la Liga</label>
                        <input 
                            type="text" 
                            value={newLeagueName}
                            onChange={(e) => setNewLeagueName(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold text-lg text-slate-900 outline-none focus:border-[#FF5722] mb-6 bg-gray-50"
                            placeholder="Ej: Amigos del Fútbol"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase text-xs hover:bg-gray-200"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 py-3 bg-[#FF5722] text-white rounded-xl font-bold uppercase text-xs hover:bg-[#F4511E] shadow-lg disabled:opacity-50"
                            >
                                {loading ? '...' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

    </div>
  );
};

export default LeaguesView;
