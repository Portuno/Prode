import React, { useMemo } from 'react';
import { Match, Prediction, GroupStats, Team } from '../types';
import { calculateGroupStandings } from '../utils';

interface DashboardGroupsProps {
  matches: Match[];
  predictions: Record<string, Prediction>;
  teamsById: Record<string, Team>;
}

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const DashboardGroups: React.FC<DashboardGroupsProps> = ({ matches, predictions, teamsById }) => {
  const { standings, qualifiedThirds } = useMemo(() => {
    const rawStandings = calculateGroupStandings(matches, predictions);
    
    // Calculate Best 3rds
    const thirds: GroupStats[] = [];
    Object.values(rawStandings).forEach(groupTeams => {
        if (groupTeams[2]) thirds.push(groupTeams[2]);
    });
    
    // Sort thirds: Pts > GD > GF
    thirds.sort((a, b) => {
         if (b.points !== a.points) return b.points - a.points;
         if (b.gd !== a.gd) return b.gd - a.gd;
         return b.gf - a.gf;
    });

    const qualifiedIds = new Set(thirds.slice(0, 8).map(t => t.teamId));
    return { standings: rawStandings, qualifiedThirds: qualifiedIds };
  }, [matches, predictions]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
        {GROUPS.map(group => {
            const groupStats = standings[group] || [];
            return (
                <div key={group} className="bg-white rounded-xl shadow-lg overflow-hidden relative z-10">
                    <div className="bg-[#4CAF50] px-4 py-2 flex justify-between items-center">
                        <h3 className="text-white font-black italic uppercase tracking-tighter text-lg">Grupo {group}</h3>
                    </div>
                    <table className="w-full text-xs md:text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-3 text-left">Equipo</th>
                                <th className="p-3 text-center w-10">Pts</th>
                                <th className="p-3 text-center w-10">DG</th>
                                <th className="p-3 text-center w-10 hidden md:table-cell">GF</th>
                                <th className="p-3 text-center w-10 hidden md:table-cell">GC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {groupStats.map((stat, index) => {
                                const team = teamsById[stat.teamId];
                                if (!team) return null;
                                
                                const isQualified = index < 2 || (index === 2 && qualifiedThirds.has(stat.teamId));
                                const rowClass = isQualified ? 'bg-green-50' : 'bg-white';
                                const rankColor = index < 2 ? 'text-green-600' : (isQualified ? 'text-yellow-600' : 'text-gray-400');
                                const rankIcon = index < 2 ? '✓' : (isQualified ? '→' : '');

                                return (
                                    <tr key={stat.teamId} className={rowClass}>
                                        <td className="p-3 flex items-center gap-3">
                                            <span className={`font-bold w-4 text-center ${rankColor}`}>{index + 1}.</span>
                                            <img src={`https://flagcdn.com/w40/${team.flagCode}.png`} alt={team.code} className="w-6 h-4 rounded shadow-sm object-cover" />
                                            <span className={`font-bold ${isQualified ? 'text-slate-900' : 'text-gray-500'}`}>{team.name}</span>
                                            {isQualified && <span className="text-[10px] font-bold text-green-600 ml-auto">{rankIcon}</span>}
                                        </td>
                                        <td className="p-3 text-center font-bold text-slate-800">{stat.points}</td>
                                        <td className="p-3 text-center font-mono text-gray-600">{stat.gd > 0 ? `+${stat.gd}` : stat.gd}</td>
                                        <td className="p-3 text-center font-mono text-gray-400 hidden md:table-cell">{stat.gf}</td>
                                        <td className="p-3 text-center font-mono text-gray-400 hidden md:table-cell">{stat.gf - stat.gd}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )
        })}
    </div>
  );
};

export default DashboardGroups;