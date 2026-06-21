import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function BudgetPicksCarousel() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('price', 'asc'), limit(8));
        const snap = await getDocs(q);
        const data: any[] = [];
        const now = new Date();
        const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
        snap.forEach((doc) => {
          const d = doc.data();
          const createdAt = d.createdAt ? new Date(d.createdAt.toMillis()) : now;
          if (now.getTime() - createdAt.getTime() >= EXPIRY_MS) return;

          data.push({
            id: doc.id,
            title: d.title,
            location: d.location,
            price: Number(d.price) || 0,
            type: d.propertyType,
            gender: d.genderPreference,
            distance: Number(d.distance) || 0,
            image: d.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
            cooking: d.cooking || false,
          });
        });
        setListings(data);
      } catch (e) {
        console.error("BudgetPicksCarousel fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (listings.length <= 1) return;
    intervalRef.current = setInterval(() => {
      if (!isHoveredRef.current) {
        setActiveIdx(prev => (prev + 1) % listings.length);
      }
    }, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [listings.length]);

  if (loading || listings.length === 0) return null;

  const genderColor = (g: string) =>
    g === 'Girls' ? 'bg-pink-500' : g === 'Boys' ? 'bg-blue-600' : 'bg-emerald-500';

  const prev = () => setActiveIdx(i => (i - 1 + listings.length) % listings.length);
  const next = () => setActiveIdx(i => (i + 1) % listings.length);

  return (
    <section className="py-8 lg:py-16 bg-brand/80 relative overflow-hidden">
      {/* Soft brand glow decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/4 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

          {/* Left: Heading */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 border border-brand/15 mb-6">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-brand text-xs font-black uppercase tracking-widest">Best Value</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Budget <span className="text-rose-50">Picks</span>
              
            </h2>
            <p className="text-slate-100 text-lg font-medium leading-relaxed mb-10">
              Affordable rooms sorted by the lowest rent. Quality stays without breaking the bank.
            </p>

            {/* Nav Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="w-11 h-11 rounded-full border border-brand/20 bg-white hover:bg-brand hover:border-brand text-brand hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <div className="flex gap-2">
                {listings.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${i === activeIdx ? 'w-8 bg-brand' : 'w-1.5 bg-brand/20 hover:bg-brand/40'}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-11 h-11 rounded-full border border-brand/20 bg-white hover:bg-brand hover:border-brand text-brand hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>

            <a
              href="/listings?sortBy=price-low"
              className="mt-8 inline-flex items-center gap-2 text-rose-100 font-bold text-sm hover:text-white transition-colors group"
            >
              See all affordable listings
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>

          {/* Right: Stacked 3D Card Stage */}
          <div
            className="flex-1 w-full relative flex items-center justify-center"
            style={{ minHeight: '420px' }}
            onMouseEnter={() => { isHoveredRef.current = true; }}
            onMouseLeave={() => { isHoveredRef.current = false; }}
          >
            {listings.map((l, idx) => {
              const offset = (idx - activeIdx + listings.length) % listings.length;
              const isActive = offset === 0;
              const isNext = offset === 1;
              const isPrev = offset === listings.length - 1;
              const isHidden = !isActive && !isNext && !isPrev;

              const scale = isActive ? 1 : isNext || isPrev ? 0.88 : 0.78;
              const translateX = isActive ? 0 : isNext ? 55 : isPrev ? -55 : 0;
              const translateZ = isActive ? 0 : -60;
              const opacity = isActive ? 1 : isNext || isPrev ? 0.5 : 0;
              const zIndex = isActive ? 10 : isNext || isPrev ? 5 : 0;

              return (
                <div
                  key={l.id}
                  onClick={() => !isActive && setActiveIdx(idx)}
                  className={`absolute transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-[1.5rem] overflow-hidden ${isHidden ? 'pointer-events-none' : isActive ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{
                    width: '340px',
                    transform: `translateX(${translateX}%) scale(${scale}) translateZ(${translateZ}px)`,
                    opacity,
                    zIndex,
                  }}
                >
                  {/* Card */}
                  <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={l.image} alt={l.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm ${genderColor(l.gender)}`}>
                          {l.gender}
                        </span>
                        <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-slate-800 shadow-sm">
                          {l.type}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="text-white font-extrabold text-2xl leading-none">Rs. {l.price.toLocaleString()}</div>
                        <div className="text-white/70 text-xs font-bold mt-0.5">per month</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-1 line-clamp-1">{l.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                        <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        {l.location} · {l.distance} km
                      </div>
                      <a
                        href={`/listings/${l.id}`}
                        className="mt-3 w-full bg-brand text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors group cursor-pointer shadow-md shadow-brand/20"
                        target="_blank" rel="noopener noreferrer"
                      >
                        View Details
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
