import { useState, useEffect } from 'react';
import AuthModal from '../auth/AuthModal';
import { auth } from '../../lib/firebase';

export default function Navbar() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsAuthOpen(true);
    window.addEventListener('open-auth-modal', handleOpen);
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener('open-auth-modal', handleOpen);
      unsubscribe();
    };
  }, []);

  return (
    <>
      <nav className="fixed w-full z-50 transition-all duration-300 bg-brand backdrop-blur-md shadow-lg shadow-brand/20 border-b border-brand/50">
        <div className="max-w-9xl px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        
        {/* Logo Container with White Pill background for contrast */}
        <a
          href="/"
          className="flex items-center justify-center gap-1 cursor-pointer group px-1 md:px-4 py-1 transition-all"
        >
          <img
            src="/logo/logo.png"
            alt="Bodima Logo"
            className="h-14 w-14 md:h-20 md:w-20 object-contain invert brightness-0 group-hover:scale-105 transition-transform duration-300"
          />

          <div className="flex flex-col leading-none">
            <span className="text-xl md:text-2xl font-bold text-white">
              Bodima
            </span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8 font-medium">
          <a href="/" className={`relative pb-1 ${path === '/' ? 'text-white font-bold' : 'text-rose-100 hover:text-white transition-colors duration-200 font-bold'}`}>
            Home
            <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${path === '/' ? 'w-full' : 'w-0'}`} />
          </a>
          
          <a href="/listings" className={`relative pb-1 ${path.startsWith('/listings') ? 'text-white font-bold' : 'text-rose-100 hover:text-white transition-colors duration-200 font-bold'}`}>
            Listings
            <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${path.startsWith('/listings') ? 'w-full' : 'w-0'}`} />
          </a>
          
          <a href="/about" className={`relative pb-1 ${path.startsWith('/about') ? 'text-white font-bold' : 'text-rose-100 hover:text-white transition-colors duration-200 font-bold'}`}>
            About
            <div className={`absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${path.startsWith('/about') ? 'w-full' : 'w-0'}`} />
          </a>
          
          <div className="flex items-center gap-4">
            {user ? (
              <a 
                href="/profile"
                className="bg-white text-brand px-6 py-2.5 rounded-full font-bold hover:bg-rose-50 transition-colors shadow-lg shadow-black/10 active:scale-95 text-center"
              >
                Profile
              </a>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="bg-white text-brand px-6 py-2.5 rounded-full font-bold hover:bg-rose-50 transition-colors shadow-lg shadow-black/10 active:scale-95"
              >
                List Property
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand border-b border-brand/50 shadow-xl py-4 px-6 flex flex-col gap-4 z-40">
          <a href="/" className={`text-lg block ${path === '/' ? 'text-white font-bold' : 'text-rose-100 hover:text-white'}`}>Home</a>
          <a href="/listings" className={`text-lg block ${path.startsWith('/listings') ? 'text-white font-bold' : 'text-rose-100 hover:text-white'}`}>Listings</a>
          <a href="/about" className={`text-lg block ${path.startsWith('/about') ? 'text-white font-bold' : 'text-rose-100 hover:text-white'}`}>About</a>
          <div className="pt-4 mt-2 border-t border-white/20">
            {user ? (
              <a href="/profile" className="block text-center w-full bg-white text-brand px-6 py-3.5 rounded-xl font-bold shadow-lg">Profile</a>
            ) : (
              <button onClick={() => { setMobileMenuOpen(false); setIsAuthOpen(true); }} className="w-full bg-white text-brand px-6 py-3.5 rounded-xl font-bold shadow-lg">List Property</button>
            )}
          </div>
        </div>
      )}
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
