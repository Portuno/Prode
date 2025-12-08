
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthViewProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('¡Registro exitoso! Ya puedes iniciar sesión automáticamente.');
        // Auto sign-in or wait for user to switch tabs? Usually sign up logs you in if email confirm is off. 
        // If email confirm is on, this might behave differently. Assuming simple flow:
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative overflow-hidden">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[#004d40]">
                Prode<span className="text-[#FFD700]">2026</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">
                {isSignUp ? 'Guardar mi Progreso' : 'Acceder a mi Cuenta'}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#4CAF50] bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#4CAF50] bg-gray-50"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#FF5722] text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-[#F4511E] disabled:opacity-50 transition-all"
          >
            {loading ? 'Procesando...' : (isSignUp ? 'Crear Cuenta y Guardar' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-xs font-bold text-[#004d40] hover:underline uppercase tracking-wide"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
        
        <div className="mt-4 text-center border-t border-gray-100 pt-4">
             <p className="text-[10px] text-gray-400 leading-tight">
                 Al registrarte, podrás acceder a tu prode desde cualquier dispositivo y competir en el ranking global.
             </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
