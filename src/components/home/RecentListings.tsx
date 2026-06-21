import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import ListingCard from '../listing/listingCard';

export default function RecentListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCardsToShow(1);
      else if (window.innerWidth < 1024) setCardsToShow(2);
      else setCardsToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (listings.length <= cardsToShow) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + cardsToShow >= listings.length ? 0 : prev + cardsToShow));
    }, 4000);
    return () => clearInterval(timer);
  }, [listings.length, cardsToShow]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + cardsToShow >= listings.length ? 0 : prev + cardsToShow));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - cardsToShow < 0 ? Math.max(0, listings.length - cardsToShow) : prev - cardsToShow));
  };

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(12));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        const now = new Date();
        const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const createdAt = docData.createdAt ? new Date(docData.createdAt.toMillis()) : now;
          if (now.getTime() - createdAt.getTime() >= EXPIRY_MS) return;
          data.push({ 
            id: doc.id, 
            title: docData.title,
            location: docData.location,
            distance: Number(docData.distance) || 0,
            price: Number(docData.price) || 0,
            type: docData.propertyType,
            gender: docData.genderPreference,
            cooking: docData.cooking || false, 
            image: docData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"
          });
        });
        setListings(data);
      } catch (err) {
        console.error("Error fetching recent listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentListings();
  }, []);

  return (
    <section className="py-8 md:py-16 bg-white/20 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-black text-brand uppercase tracking-widest mb-3">Fresh on the Market</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Recently Added Properties
            </h3>
            <p className="mt-4 text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Discover the latest accommodations added by our trusted hosts. Find your perfect stay before someone else does.
            </p>
          </div>
          <a href="/listings" className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-xl font-bold transition-all border border-slate-200 shadow-sm hover:shadow flex items-center gap-2 group">
            View All Properties
            <svg className="w-5 h-5 text-brand group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
          </div>
        ) : listings.length > 4 ? (
          <div className="relative group/carousel overflow-hidden rounded-[2rem] p-4 -m-4">
            {/* Scroll Left Button */}
            <button 
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:text-brand transition-all hover:scale-105 border border-slate-100 opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            {/* Scrollable Track */}
            <div 
              className="flex gap-6 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(calc(-${(currentIndex / cardsToShow) * 100}% - ${(currentIndex / cardsToShow) * 24}px))` }}
            >
              {listings.map(listing => (
                <div 
                  key={listing.id} 
                  className="shrink-0"
                  style={{ width: `calc(${100 / cardsToShow}% - ${((cardsToShow - 1) * 24) / cardsToShow}px)` }}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>

            {/* Scroll Right Button */}
            <button 
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:text-brand transition-all hover:scale-105 border border-slate-100 opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        ) : listings.length > 0 ? (
          <div className="flex flex-wrap gap-6 pb-8 pt-4">
            {listings.map(listing => (
              <div key={listing.id} className="w-full sm:w-[350px] shrink-0">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 font-medium text-lg">No recent listings found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
