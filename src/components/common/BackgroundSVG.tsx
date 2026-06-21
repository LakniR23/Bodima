export default function BackgroundSVG() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-transparent">
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-10deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-slow {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(15px, -15px) rotate(15deg); }
          66% { transform: translate(-15px, -15px) rotate(-15deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
      `}</style>

      {/* Floating Plus Sign - Top Left */}
      <svg className="absolute top-24 left-[10%] w-8 h-8 text-brand/20 animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>

      {/* Rotating Triangle - Top Right */}
      <svg className="absolute top-40 right-[15%] w-10 h-10 text-brand/20 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <polygon points="12 4 22 20 2 20" />
      </svg>

      {/* Floating Circle - Mid Left */}
      <svg className="absolute top-1/2 left-[5%] w-12 h-12 text-brand/10 animate-float-reverse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>

      {/* Dots Grid - Mid Right */}
      <svg className="absolute top-[60%] right-[8%] w-16 h-16 text-slate-400/20 animate-float-slow" width="100" height="100" viewBox="0 0 100 100">
        <pattern id="small-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle fill="currentColor" cx="2" cy="2" r="2" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#small-dots)" />
      </svg>

      {/* Wavy Line - Bottom Left */}
      <svg className="absolute bottom-32 left-[20%] w-16 h-16 text-brand/30 animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 12q3-6 6 0t6 0t6 0" />
      </svg>

      {/* Small X - Bottom Right */}
      <svg className="absolute bottom-48 right-[25%] w-6 h-6 text-brand/20 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
      
      {/* Tiny Diamond - Center Top */}
      <svg className="absolute top-24 left-[45%] w-5 h-5 text-slate-300/40 animate-float-reverse" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 22 12 12 22 2 12" />
      </svg>

    </div>
  );
}
