import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 4500);

    // Completely unmount and notify parent
    const unmountTimer = setTimeout(() => {
      onComplete();
    }, 5100);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 w-screen h-screen bg-brand flex justify-center items-center z-[9999] transition-opacity duration-500 ease-in-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-[300px] h-[300px] flex justify-center items-center">
          {/* Outer circle */}
          <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-white border-r-white/30 animate-[spin_1.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite] z-0"></div>
          
          {/* Inner circle */}
          <div className="absolute inset-[20px] rounded-full border-[3px] border-transparent border-b-white border-l-white/30 animate-[spin_2s_linear_infinite_reverse] z-0"></div>
          
          {/* Dashed circle */}
          <div className="absolute inset-[40px] rounded-full border-2 border-dashed border-white opacity-50 animate-[spin_3s_linear_infinite] z-0"></div>
          
          <div className="w-[180px] h-[180px] bg-white rounded-full flex justify-center items-center z-10 shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-transform duration-500 ease-in-out p-4">
            <img
              src="/logo/logo.png"
              alt="Bodima Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        
      </div>
    </div>
  );
}
