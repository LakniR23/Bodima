export default function CTAListings() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_60px_rgba(221,45,74,0.07)] flex flex-col lg:flex-row min-h-[360px]">

          {/* Brand accent bar — left */}
          <div className="w-full h-2 lg:h-auto lg:w-2 bg-brand rounded-t-[2.5rem] lg:rounded-l-[2.5rem] lg:rounded-tr-none shrink-0" />

          {/* Left — Text + Buttons */}
          <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-12 lg:py-14">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-brand/8 border border-brand/15 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-brand text-xs font-black uppercase tracking-widest">Properties Available Now</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4">
              Your perfect stay <br />
              <span className="text-brand">is one click away.</span>
            </h2>
            <p className="text-slate-500 text-base font-medium max-w-md mb-8">
              Browse verified rooms, annexes and houses near campus. Filter by price, gender, and distance. Completely free.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/listings"
                className="group inline-flex items-center gap-2.5 bg-brand text-white px-7 py-4 rounded-2xl font-extrabold text-sm shadow-lg shadow-brand/25 hover:bg-brand/90 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Browse Listings
              </a>
              <button
                onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
                className="group inline-flex items-center gap-2.5 bg-white border-2 border-brand/20 text-brand px-7 py-4 rounded-2xl font-bold text-sm hover:bg-brand/5 hover:border-brand/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                List Your Property
              </button>
            </div>
          </div>

          {/* Right — Visual: floating property preview cards */}
          <div className="hidden lg:flex w-[420px] shrink-0 items-center justify-center px-8 py-10 relative">
            {/* Background blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-rose-50" />

            {/* Back card */}
            <div className="absolute right-14 top-12 w-56 h-36 bg-white rounded-2xl shadow-lg border border-slate-100 rotate-6 opacity-60" />

            {/* Front mock property card */}
            <div className="relative z-10 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-brand/20 to-rose-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-brand/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </div>
                <span className="absolute top-3 left-3 bg-brand text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-widest">For Rent</span>
                <span className="absolute bottom-3 left-3 text-white font-extrabold text-lg drop-shadow">Rs. 18,000</span>
              </div>
              <div className="p-4">
                <p className="font-extrabold text-slate-900 text-sm leading-tight mb-1">Cozy Single Room Near SLIIT</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                  <svg className="w-3 h-3 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  Malabe · 0.4 km away
                </div>
                {/* Mini amenity tags */}
                <div className="flex gap-1.5 mt-3">
                  {['WiFi', 'Cooking', 'Boys'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-brand/8 text-brand text-[10px] font-bold">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stat badge floating */}
            <div className="absolute bottom-10 left-8 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3 z-20">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-slate-900 font-extrabold text-sm leading-none">100+ Listings</p>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Updated daily</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
