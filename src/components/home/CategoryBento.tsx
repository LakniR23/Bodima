export default function CategoryBento() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Find Your Tribe</h2>
          <p className="text-lg text-slate-500 max-w-2xl">
            Filter by environment. Whether you need a boys-only hostel, a secure girls-only space, or an independent private annex, we have what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px] md:h-[600px]">
          
          {/* Large Card - Girls Only */}
          <a href="/listings?gender=Girls" className="block md:col-span-2 md:row-span-2 relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg shadow-slate-200/50">
            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2000&auto=format&fit=crop" alt="Girls Only" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <div className="flex justify-between items-end">
                <div>
                  <span className="bg-brand text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Highly Secure</span>
                  <h3 className="text-4xl font-bold text-white mb-2">Girls' Only Boardings</h3>
                  <p className="text-white/80 max-w-sm">Safe, secure, and comfortable spaces exclusively for female students and professionals.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform group-hover:translate-x-2 transition-transform border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </div>
            </div>
          </a>

          {/* Small Card - Boys Only */}
          <a href="/listings?gender=Boys" className="block relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg shadow-slate-200/50">
            <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop" alt="Boys Only" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Active Hubs</span>
              <h3 className="text-2xl font-bold text-white mb-1">Boys' Hostels</h3>
              <p className="text-white/80 text-sm">Vibrant communities and budget-friendly shared spaces.</p>
            </div>
          </a>

          {/* Small Card - Annexes */}
          <a href="/listings?type=Annex" className="block relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg shadow-slate-200/50">
            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop" alt="Private Annexes" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Total Privacy</span>
              <h3 className="text-2xl font-bold text-white mb-1">Private Annexes</h3>
              <p className="text-white/80 text-sm">Independent living spaces with attached bathrooms and kitchens.</p>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
}
