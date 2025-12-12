
import React, { useState } from 'react';
import { signInWithGoogle, signInWithGithub } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestLogin: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 4.66c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const GithubIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (provider: 'google' | 'github') => {
      setLoading(true);
      setError(null);
      try {
          if (provider === 'google') await signInWithGoogle();
          else await signInWithGithub();
          onClose();
      } catch (err: any) {
          console.error("Authentication Error Details:", err);
          
          let displayMsg = "";

          if (err.code === 'auth/unauthorized-domain') {
              const currentDomain = window.location.hostname;
              displayMsg = `⚠️ Domain Authorization Required\n\nThe current domain is not authorized:\n👉 ${currentDomain}\n\nAction: Copy the domain above and add it to: Firebase Console > Authentication > Settings > Authorized Domains`;
          } else if (err.code === 'auth/popup-closed-by-user') {
              displayMsg = "Login was cancelled by the user.";
          } else {
              displayMsg = `System Error (${err.code}): \n${err.message}`;
          }

          setError(displayMsg);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                <svg className="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" transform="rotate(45 12 12)" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" transform="rotate(-45 12 12)" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome to KANAD</h2>
            <p className="text-slate-400 mt-2">Sign in to save your research sessions</p>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3 rounded-lg mb-4 whitespace-pre-wrap font-mono break-words overflow-y-auto max-h-[150px]">
                {error}
            </div>
        )}

        <div className="space-y-3">
            <button 
                onClick={() => handleLogin('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
                {loading ? <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span> : <GoogleIcon />}
                <span>Continue with Google</span>
            </button>
            <button 
                onClick={() => handleLogin('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2f363d] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <GithubIcon />}
                <span>Continue with GitHub</span>
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <button 
                onClick={onGuestLogin}
                className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-colors border border-slate-700"
            >
                <span>Continue as Guest (Demo)</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
