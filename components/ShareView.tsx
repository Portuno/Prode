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

  const shareText = `⚽ ¡Ya armé mi Prode para el Mundial 2026! \n\nMi Código: *${prode.userId}*\n\n¿Podrás ganarme? #MundialProde2026`;

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in-up">
      <div className="mb-6 p-4 bg-emerald-50 rounded-full inline-block">
        <span className="text-6xl">🏆</span>
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-2">¡PRODE GUARDADO!</h2>
      <p className="text-slate-500 mb-8 max-w-xs mx-auto">Tu pronóstico está seguro. Comparte tu código para desafiar a tus amigos.</p>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-lg mb-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Tu Código Único</p>
        <div 
          onClick={handleCopy}
          className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wider cursor-pointer active:scale-95 transition-transform select-all font-mono"
        >
          {prode.userId}
        </div>
        <div className={`text-emerald-500 text-xs font-bold mt-2 transition-opacity ${copied ? 'opacity-100' : 'opacity-0'}`}>
          ¡Copiado al portapapeles!
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
        <button 
          onClick={handleWhatsApp}
          className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Desafiar en WhatsApp</span>
        </button>
        
        <button 
          onClick={handleTwitter}
          className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Publicar en X</span>
        </button>

        <button 
          onClick={onBack}
          className="w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all mt-4"
        >
          Volver a mi Tablero
        </button>
      </div>
    </div>
  );
};

export default ShareView;
