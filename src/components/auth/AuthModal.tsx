import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  // GoogleAuthProvider,
  // signInWithPopup,
  updateProfile
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password'; // | 'google-auth'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset mode to login when opened
      setMode('login');
      setError('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        window.location.href = '/profile';
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = '/profile';
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent!");
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSelect = async () => {
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     await signInWithPopup(auth, provider);
  //     window.location.href = '/profile';
  //   } catch (err: any) {
  //     setError(err.message || 'Google Auth failed');
  //   }
  // };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Super deep blur backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity duration-500"
        onClick={onClose}
      />
      
      {/* Vertical Container */}
      <div className="relative w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(146,72,122,0.2)] overflow-hidden flex flex-col animate-fade-in-up max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full transition-all duration-300 shadow-sm bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Normal Top Header Section - Hidden in Google mode */}
        {true && (
          <div className="bg-brand relative py-4 px-6 flex items-center gap-4 text-left overflow-hidden shrink-0">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand/50" />
           
            <div className="relative z-10 flex flex-col justify-center">
              <h2 className="text-xl font-black text-white leading-tight">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Join Bodima'}
                {mode === 'forgot-password' && 'Reset Password'}
              </h2>
              <p className="text-rose-100/90 text-xs font-medium mt-0.5">
                {mode === 'login' && 'Sign in to access your properties.'}
                {mode === 'register' && 'Find your perfect stay.'}
                {mode === 'forgot-password' && "Create a strong new password."}
              </p>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
          </div>
        )}

        {/* Google Mock Selector Mode - DISABLED */}
        {/* {mode === 'google-auth' && (
          <div className="bg-white p-8 relative flex flex-col items-center text-center shrink-0 w-full animate-fade-in pt-12 pb-12">
            <svg className="w-12 h-12 mb-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign in with Google</h2>
            <p className="text-slate-500 text-sm mb-8">Choose an account to continue to <b>Bodima</b></p>
            
            <div className="w-full space-y-2">
              <button 
                onClick={handleGoogleSelect}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-lg shrink-0">G</div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 group-hover:text-brand transition-colors">Continue with Google</div>
                  <div className="text-xs text-slate-500">Secure sign in</div>
                </div>
              </button>
              
              <div className="w-full h-px bg-slate-100"></div>

              <button 
                onClick={() => setMode('login')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </div>
                <div className="flex-1 font-bold text-slate-600 group-hover:text-slate-900">
                  Cancel and go back
                </div>
              </button>
            </div>
          </div>
        )} */}

        {/* Normal Form Section - Hidden in Google mode */}
        {true && (
          <div className="bg-white p-6 sm:p-8 relative flex flex-col shrink-0">
            
            {mode !== 'forgot-password' && (
              <div className="flex bg-slate-100/80 p-1.5 rounded-4xl mb-6 relative shadow-inner">
                <div 
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-4xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) ${mode === 'login' ? 'left-1.5' : 'left-[calc(50%+0.375rem)]'}`} 
                />
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 text-[13px] font-bold rounded-4xl transition-colors relative z-10 ${mode === 'login' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  Log In
                </button>
                <button 
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-3 text-[13px] font-bold rounded-4xl transition-colors relative z-10 ${mode === 'register' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 text-rose-500 p-3 rounded-2xl text-xs font-bold text-center border border-rose-100">
                  {error}
                </div>
              )}
              
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 rounded-4xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm shadow-sm" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Phone</label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 rounded-4xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm shadow-sm" placeholder="077 XXX" />
                  </div>
                </div>
              )}

              {mode !== 'forgot-password' && (
                <div className="animate-fade-in">
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 rounded-4xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm shadow-sm" placeholder="you@example.com" />
                </div>
              )}
              
              {mode !== 'forgot-password' && (
                <div className="animate-fade-in">
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex justify-between items-center">
                    Password
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot-password')} className="text-brand hover:text-brand/90 capitalize font-bold">
                        Forgot Password?
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 rounded-4xl px-4 py-3.5 pr-12 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm shadow-sm" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand transition-colors">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="animate-fade-in">
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 rounded-4xl px-4 py-3.5 pr-12 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm shadow-sm" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand transition-colors">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'forgot-password' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Email to reset</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50/80 border border-slate-200 rounded-4xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm shadow-sm" placeholder="you@example.com" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white px-6 py-4 rounded-4xl font-bold hover:bg-brand hover:-translate-y-0.5 transition-all duration-300 shadow-xl hover:shadow-brand/20 mt-4 flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                {loading ? 'Processing...' : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot-password' && 'Send Reset Email'}
                    {mode !== 'forgot-password' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                  </>
                )}
              </button>
              
              {mode === 'forgot-password' && (
                <button 
                  type="button" 
                  onClick={() => setMode('login')}
                  className="w-full bg-slate-50 text-slate-600 px-6 py-3.5 rounded-4xl font-bold hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-all mt-3 text-[13px]"
                >
                  Back to Login
                </button>
              )}
            </form>

            {/* Exclusive Google Login - DISABLED */}
            {/* {mode !== 'forgot-password' && (
              <div className="mt-8 animate-fade-in">
                <div className="relative flex items-center mb-5">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] font-bold uppercase text-slate-400">Or continue instantly</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>
                
                <button 
                  type="button" 
                  onClick={handleGoogleSelect} 
                  className="w-full group flex justify-center items-center gap-3 py-3.5 bg-slate-50 border border-slate-200 rounded-4xl hover:bg-white hover:border-brand/30 hover:shadow-md hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="font-bold text-slate-600 group-hover:text-slate-900 transition-colors text-sm">
                    Continue with Google
                  </span>
                </button>
              </div>
            )} */}

          </div>
        )}
      </div>
    </div>
  );
}
