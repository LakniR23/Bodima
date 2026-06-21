export default function CTAAbout() {
  return (
    <section className="py-0 bg-white">
      <div className="w-full">
        <div className="relative overflow-hidden bg-brand text-center px-6 py-16 shadow-2xl shadow-brand/20">

          {/* Background Textures */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          {/* Subtle glow orbs */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-rose-900/30 rounded-full blur-[80px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center h-[300px]">
            
            {/* Top Icon */}
            <div className="w-16 h-48 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Love Bodima? 
              <span className="text-white/80"> Tell the community.</span>
            </h2>

            <p className="text-white/70 text-base sm:text-lg font-medium max-w-lg mb-10">
              Your honest review helps other students find the right place faster. Share your Bodima experience in just 30 seconds.
            </p>

            <a
              href="/about"
              className="group inline-flex items-center gap-2.5 bg-white text-brand px-8 py-4 rounded-2xl font-extrabold text-sm shadow-xl hover:shadow-2xl hover:bg-rose-50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Write a Review
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
