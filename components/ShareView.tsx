
import React, { useState } from 'react';
import { UserProde } from '../types';

interface ShareViewProps {
  prode: UserProde;
  onBack: () => void;
}

const ShareView: React.FC<ShareViewProps> = ({ prode, onBack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prode.userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `⚽ ¡Acabo de armar mi prode, a ver quién me gana! \n\nMi Código: *${prode.userId}*\n\nJugá vos también en #MundialProde2026`;

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pattern-net fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-center min-h-[100dvh] text-center p-4 bg-[#004d40]">
      
      <div className="mb-6 animate-fade-in-up">
        <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-md">
            ¡Prode <span className="text-[#FFD700]">Listo!</span>
        </h2>
        <p className="text-white/80 font-bold tracking-[0.2em] text-xs mt-4 uppercase bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">Tu jugada está guardada</p>
      </div>

      {/* Ticket Card */}
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform mb-8">
        
        {/* Ticket Header */}
        <div className="bg-gray-900 p-4 border-b-2 border-dashed border-gray-600 flex justify-between items-center">
             <span className="text-[#1E90FF] font-bold text-xs uppercase tracking-widest">Ticket Oficial</span>
             <span className="text-gray-500 font-mono text-xs">{new Date().toLocaleDateString()}</span>
        </div>

        {/* Ticket Body */}
        <div className="p-8 relative">
            {/* Watermark */}
            <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="text-9xl font-black rotate-[-45deg]">2026</span>
            </div>

            <p className="text-xs text-gray-500 font-bold uppercase mb-2 tracking-wider">Tu Identificador de Jugador</p>
            
            <div 
            onClick={handleCopy}
            className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-2 cursor-pointer hover:bg-white hover:border-[#1E90FF] hover:text-blue-600 hover:shadow-lg transition-all group"
            >
                <div className="text-2xl font-mono font-bold text-gray-800 break-all leading-tight group-hover:scale-105 transition-transform">
                {prode.userId}
                </div>
            </div>
            
            <div className={`text-emerald-600 text-xs font-bold transition-opacity h-4 flex items-center justify-center gap-1 ${copied ? 'opacity-100' : 'opacity-0'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ¡Copiado!
            </div>
        </div>

        {/* Ticket Stub (Bottom) */}
        <div className="bg-gray-50 p-4 border-t-2 border-dashed border-gray-300 relative">
             <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#008000] rounded-full"></div>
             <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#008000] rounded-full"></div>
             <p className="text-xs text-gray-400 text-center font-medium">Comparte este código para jugar</p>
        </div>
      </div>

      <div className="space-y-3 w-full max-w-xs animate-fade-in-up delay-100">
        <button 
          onClick={handleWhatsApp}
          className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full font-bold shadow-lg active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          <span>Desafiar en WhatsApp</span>
        </button>
        
        <button 
          onClick={onBack}
          className="w-full py-4 px-6 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold hover:bg-white/20 active:scale-95 transition-all mt-4"
        >
          IR AL TRACKER DE PUNTOS
        </button>
      </div>
    </div>
  );
};

export default ShareView;
