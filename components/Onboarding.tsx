
import React, { useState, useEffect } from 'react';
import { Team, PlayoffGroup } from '../types';
import { PLAYOFF_GROUPS } from '../constants';

interface OnboardingProps {
  onComplete: (data: { name: string; country: string; club: string; resolutions: Record<string, Team> }) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'IDENTITY' | 'PLAYOFFS' | 'LOADING'>('IDENTITY');
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  
  // Identity State
  const [name, setName] = useState('');
  const [country, setCountry] = useState('ARG');
  const [club, setClub] = useState('');

  // Resolutions State
  const [resolutions, setResolutions] = useState<Record<string, Team>>({});

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('PLAYOFFS');
  };

  const handleTeamSelect = (group: PlayoffGroup, team: Team) => {
    // Save resolution
    const newResolutions = { ...resolutions, [group.id]: team };
    setResolutions(newResolutions);

    // Visual feedback delay then move next
    setTimeout(() => {
        if (currentGroupIndex < PLAYOFF_GROUPS.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
        } else {
            setStep('LOADING');
        }
    }, 400);
  };

  const handleRandomSelect = () => {
    const newResolutions: Record<string, Team> = {};
    PLAYOFF_GROUPS.forEach(group => {
        const randomTeam = group.candidates[Math.floor(Math.random() * group.candidates.length)];
        newResolutions[group.id] = randomTeam;
    });
    setResolutions(newResolutions);
    setStep('LOADING');
  };

  useEffect(() => {
    if (step === 'LOADING') {
        // Simulate processing/generation
        setTimeout(() => {
            onComplete({ name, country, club, resolutions });
        }, 2500);
    }
  }, [step, onComplete, name, country, club, resolutions]);

  const currentGroup = PLAYOFF_GROUPS[currentGroupIndex];

  if (step === 'IDENTITY') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
            <h2 className="text-3xl font-black text-gray-900 mb-2 italic uppercase">¡Bienvenido!</h2>
            <p className="text-gray-500 mb-8 font-medium">Empecemos a armar tu Mundial 2026.</p>
            
            <form onSubmit={handleIdentitySubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tu Nombre / Alias</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Campeón2026"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold text-lg text-slate-900 outline-none focus:border-[#4CAF50] focus:ring-4 focus:ring-green-100 transition-all bg-gray-50"
                        required
                        maxLength={15}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Tu País</label>
                    <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold text-lg text-slate-900 outline-none focus:border-[#4CAF50] focus:ring-4 focus:ring-green-100 transition-all bg-gray-50 appearance-none"
                    >
                        <option value="ARG">Argentina 🇦🇷</option>
                        <option value="BRA">Brasil 🇧🇷</option>
                        <option value="MEX">México 🇲🇽</option>
                        <option value="USA">USA 🇺🇸</option>
                        <option value="ESP">España 🇪🇸</option>
                        <option value="URU">Uruguay 🇺🇾</option>
                        <option value="COL">Colombia 🇨🇴</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Club de tus Amores <span className="text-gray-400 text-xs normal-case">(Opcional)</span></label>
                    <input 
                        type="text" 
                        value={club}
                        onChange={(e) => setClub(e.target.value)}
                        placeholder="Próximamente en Ligas Privadas..."
                        className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold text-gray-500 outline-none bg-gray-100 cursor-not-allowed"
                        disabled
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full py-4 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-full font-black text-lg uppercase tracking-widest shadow-lg transform active:scale-95 transition-all mt-4"
                >
                    Siguiente ➡️
                </button>
            </form>
        </div>
      </div>
    );
  }

  if (step === 'PLAYOFFS') {
      const progress = ((currentGroupIndex) / PLAYOFF_GROUPS.length) * 100;

      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#004d40] pattern-net">
            {/* DEV BUTTON: Random Select */}
            <button 
                onClick={handleRandomSelect}
                className="absolute top-4 right-4 bg-purple-600 text-white p-2 rounded-full shadow-lg z-50 text-xs font-bold hover:bg-purple-500"
                title="Auto-fill Randomly (Testing)"
            >
                ⚡ Random
            </button>

            <div className="w-full max-w-lg mb-8">
                 <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                     <div className="h-full bg-[#4CAF50] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-center text-green-200 text-xs font-bold mt-2 uppercase tracking-widest">Definiendo Clasificados {currentGroupIndex + 1}/{PLAYOFF_GROUPS.length}</p>
            </div>

            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up overflow-hidden relative">
                <div className="bg-gray-50 border-b border-gray-200 p-6 text-center">
                    <h3 className="text-xl font-black text-gray-800 uppercase italic">¿Quién clasifica?</h3>
                    <p className="text-sm font-bold text-[#FF5722] uppercase tracking-wider">{currentGroup.name}</p>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                    {currentGroup.candidates.map(team => (
                        <button
                            key={team.id}
                            onClick={() => handleTeamSelect(currentGroup, team)}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all group ${
                                resolutions[currentGroup.id]?.id === team.id 
                                ? 'border-[#4CAF50] bg-green-50 ring-4 ring-green-100 scale-105' 
                                : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                            }`}
                        >
                            <div className="w-16 h-12 shadow-md rounded mb-3 overflow-hidden">
                                <img 
                                    src={`https://flagcdn.com/w80/${team.flagCode}.png`} 
                                    alt={team.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-bold text-slate-800 text-sm uppercase">{team.name}</span>
                            
                            {resolutions[currentGroup.id]?.id === team.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center text-white shadow-sm animate-bounce">
                                    ✓
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  if (step === 'LOADING') {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#388E3C] pattern-pitch text-center">
            <div className="relative mb-8">
                <div className="w-24 h-24 border-8 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">⚽</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2 drop-shadow-md">
                Generando Fixture...
            </h2>
            <p className="text-green-100 font-bold uppercase tracking-widest text-sm animate-pulse">Confirmando grupos finales</p>
        </div>
      );
  }

  return null;
};

export default Onboarding;
