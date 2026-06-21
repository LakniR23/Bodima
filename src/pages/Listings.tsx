import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ListingCard from '../components/listing/listingCard';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [locationStr, setLocationStr] = useState('');
  const [typeStr, setTypeStr] = useState('');
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;
  
  // Advanced Filters
  const [maxDistance, setMaxDistance] = useState(5); // in km
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [genderFilter, setGenderFilter] = useState('All');
  
  // Amenities
  const [needCooking, setNeedCooking] = useState(false);
  const [needMeals, setNeedMeals] = useState(false);
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [attachedBathroom, setAttachedBathroom] = useState(false);

  // Sort State
  const [sortBy, setSortBy] = useState('newest');

  // Accordion State
  const [openSections, setOpenSections] = useState({
    sort: true,
    location: true,
    type: true,
    price: false,
    distance: false,
    gender: false,
    amenities: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        const now = new Date();
        const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const createdAt = docData.createdAt ? new Date(docData.createdAt.toMillis()) : now;
          
          // Skip expired listings (older than 30 days)
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
            meals: docData.meals || false,
            weekend: docData.weekend || false,
            bathroom: docData.bathroom || false,
            image: docData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
            postedDate: docData.createdAt ? new Date(docData.createdAt.toMillis()).toISOString() : new Date().toISOString()
          });
        });
        setListings(data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();

    // Parse URL params initially to support cross-page navigation with filters
    const params = new URLSearchParams(window.location.search);
    
    // Auto-expand filter sections if user navigated here from a search on another page
    if (window.location.search) {
      setOpenSections({
        sort: true,
        location: true,
        type: true,
        price: true,
        distance: true,
        gender: true,
        amenities: true
      });
    }

    const loc = params.get('location');
    const typ = params.get('type');
    const minP = params.get('minPrice');
    const maxP = params.get('maxPrice');
    const gen = params.get('gender');
    const cook = params.get('cooking');
    const meal = params.get('meals');
    const week = params.get('weekend');
    const bath = params.get('bathroom');
    const dist = params.get('distance');

    if (loc) setLocationStr(loc);
    if (typ) setTypeStr(typ);
    if (minP) setMinPrice(parseInt(minP));
    if (maxP) setMaxPrice(parseInt(maxP));
    if (gen) setGenderFilter(gen);
    if (cook === 'true') setNeedCooking(true);
    if (meal === 'true') setNeedMeals(true);
    if (week === 'true') setWeekendOnly(true);
    if (bath === 'true') setAttachedBathroom(true);
    if (dist) setMaxDistance(parseFloat(dist));
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [locationStr, typeStr, maxDistance, minPrice, maxPrice, genderFilter, needCooking, needMeals, weekendOnly, attachedBathroom, sortBy]);

  const clearFilters = () => {
    setLocationStr(''); 
    setTypeStr(''); 
    setMaxDistance(10); 
    setMinPrice(0); 
    setMaxPrice(100000); 
    setGenderFilter('All'); 
    setNeedCooking(false);
    setNeedMeals(false);
    setWeekendOnly(false);
    setAttachedBathroom(false);
    setSortBy('newest');
    
    // Clear URL without refreshing
    window.history.pushState({}, '', '/listings');
  };

  // Filter Logic
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      if (locationStr && l.location !== locationStr) return false;
      if (typeStr && l.type !== typeStr) return false;
      if (l.distance > maxDistance) return false;
      if (l.price < minPrice || l.price > maxPrice) return false;
      if (genderFilter !== 'All' && l.gender !== 'Any' && l.gender !== genderFilter) return false;
      if (needCooking && !l.cooking) return false;
      if (needMeals && !l.meals) return false;
      if (weekendOnly && !l.weekend) return false;
      if (attachedBathroom && !l.bathroom) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      if (sortBy === 'oldest') return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [listings, locationStr, typeStr, maxDistance, minPrice, maxPrice, genderFilter, needCooking, needMeals, weekendOnly, attachedBathroom, sortBy]);

  // Pagination Logic
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredListings, currentPage]);

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-white to-brand/10 font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-28 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Mobile Filter Button */}
        <button 
          className="lg:hidden flex items-center justify-center gap-2 w-full bg-brand text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-brand/20 mb-6 active:scale-[0.98] transition-transform"
          onClick={() => setIsMobileFiltersOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          Filters & Sorting
        </button>

        {/* Overlay for mobile drawer */}
        {isMobileFiltersOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        )}

        {/* Filter Drawer / Sticky Sidebar Container */}
        <div className={`fixed inset-y-0 left-0 w-[85vw] sm:w-[320px] bg-brand shadow-2xl z-[70] transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-[310px] lg:z-auto lg:h-[calc(100vh-8rem)] rounded-r-[2rem] lg:rounded-[2rem] border-r lg:border border-brand/90 p-5 flex flex-col shrink-0 lg:sticky lg:top-28 ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 w-full">
                <h2 className="text-xl font-bold tracking-tight text-white">Filters</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                  className="text-[12px] font-bold text-rose-100 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-white/20 uppercase tracking-widest"
                >
                  Clear
                </button>
                <button 
                  className="lg:hidden text-white/70 hover:text-white p-1"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            <div className="space-y-0.5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              
              {/* Sort Accordion */}
              <div className="border-b border-white/5 pb-2">
                <button onClick={() => toggleSection('sort')} className="flex items-center justify-between w-full py-1.5 group">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-rose-100 group-hover:text-white transition-colors">Sort By</span>
                  <svg className={`w-3.5 h-3.5 text-rose-300 transition-transform duration-300 ${openSections.sort ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.sort ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="relative">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer appearance-none shadow-sm text-xs">
                      <option value="newest" className="text-slate-900">Date: Newest First</option>
                      <option value="oldest" className="text-slate-900">Date: Oldest First</option>
                      <option value="price-low" className="text-slate-900">Price: Low to High</option>
                      <option value="price-high" className="text-slate-900">Price: High to Low</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Accordion */}
              <div className="border-b border-white/5 pb-2">
                <button onClick={() => toggleSection('location')} className="flex items-center justify-between w-full py-1.5 group">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-rose-100 group-hover:text-white transition-colors">Area</span>
                  <svg className={`w-3.5 h-3.5 text-rose-300 transition-transform duration-300 ${openSections.location ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.location ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="relative">
                    <select value={locationStr} onChange={(e) => setLocationStr(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer appearance-none shadow-sm text-xs">
                      <option value="" className="text-slate-900">Anywhere</option>
                      <option value="Malabe City" className="text-slate-900">Malabe City Center</option>
                      <option value="Pittugala" className="text-slate-900">Pittugala</option>
                      <option value="Thalahena" className="text-slate-900">Thalahena</option>
                      <option value="Kaduwela Road" className="text-slate-900">Kaduwela Road</option>
                      <option value="Near SLIIT" className="text-slate-900">Near SLIIT</option>
                      <option value="Near CINEC" className="text-slate-900">Near CINEC</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Accordion */}
              <div className="border-b border-white/5 pb-2 pt-1">
                <button onClick={() => toggleSection('type')} className="flex items-center justify-between w-full py-1.5 group">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-rose-100 group-hover:text-white transition-colors">Property Type</span>
                  <svg className={`w-3.5 h-3.5 text-rose-300 transition-transform duration-300 ${openSections.type ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.type ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="relative">
                    <select value={typeStr} onChange={(e) => setTypeStr(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer appearance-none shadow-sm text-xs">
                      <option value="" className="text-slate-900">Any Type</option>
                      <option value="Single Room" className="text-slate-900">Single Room</option>
                      <option value="Double Sharing" className="text-slate-900">Double Sharing</option>
                      <option value="Triple Sharing" className="text-slate-900">Triple Sharing</option>
                      <option value="3+ Sharing" className="text-slate-900">3+ Sharing</option>
                      <option value="Annex" className="text-slate-900">Annex</option>
                      <option value="House" className="text-slate-900">House</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Accordion */}
              <div className="border-b border-white/5 pb-2 pt-1">
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full py-1.5 group">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-rose-100 group-hover:text-white transition-colors">Rent Range (Rs)</span>
                  <svg className={`w-3.5 h-3.5 text-rose-300 transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.price ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="flex gap-2">
                    <input type="number" min="0" step="1000" placeholder="Min" value={minPrice || ''} onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-rose-300 text-xs shadow-sm" />
                    <div className="flex items-center text-white font-bold">-</div>
                    <input type="number" min="0" step="1000" placeholder="Max" value={maxPrice || ''} onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-rose-300 text-xs shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Distance Accordion */}
              <div className="border-b border-white/5 pb-2 pt-1">
                <button onClick={() => toggleSection('distance')} className="flex items-center justify-between w-full py-1.5 group">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-rose-100 group-hover:text-white transition-colors">Max Distance</span>
                  <svg className={`w-3.5 h-3.5 text-rose-300 transition-transform duration-300 ${openSections.distance ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.distance ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="flex justify-end mb-1">
                    <span className="bg-white text-brand text-[9px] px-2 py-0.5 rounded-md font-black shadow-sm">{maxDistance} km</span>
                  </div>
                  <input type="range" min="0.1" max="10" step="0.1" value={maxDistance} onChange={(e) => setMaxDistance(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>
              </div>

              {/* Gender Accordion */}
              <div className="border-b border-white/5 pb-2 pt-1">
                <button onClick={() => toggleSection('gender')} className="flex items-center justify-between w-full py-1.5 group">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-rose-100 group-hover:text-white transition-colors">Tenant Gender</span>
                  <svg className={`w-3.5 h-3.5 text-rose-300 transition-transform duration-300 ${openSections.gender ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.gender ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    {['All', 'Boys', 'Girls'].map(g => (
                      <button key={g} onClick={() => setGenderFilter(g)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${genderFilter === g ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comprehensive Amenities Accordion */}
              <div className="pt-1">
                <button onClick={() => toggleSection('amenities')} className="flex items-center justify-between w-full py-1.5 group">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-rose-100 group-hover:text-white transition-colors">Amenities</span>
                  <svg className={`w-3.5 h-3.5 text-rose-300 transition-transform duration-300 ${openSections.amenities ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`transition-all duration-300 ${openSections.amenities ? 'max-h-96 opacity-100 mt-1 space-y-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                    
                    {/* Cooking Chip */}
                    <button 
                      onClick={() => setNeedCooking(!needCooking)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border w-full ${needCooking ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                      <span className="truncate">With Kitchen</span>
                    </button>

                    {/* Meals Chip */}
                    <button 
                      onClick={() => setNeedMeals(!needMeals)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border w-full ${needMeals ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>
                      <span className="truncate">With Meals</span>
                    </button>

                    {/* Weekend Chip */}
                    <button 
                      onClick={() => setWeekendOnly(!weekendOnly)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border w-full ${weekendOnly ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span className="truncate">Weekend Only</span>
                    </button>

                    {/* Bathroom Chip */}
                    <button 
                      onClick={() => setAttachedBathroom(!attachedBathroom)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border w-full ${attachedBathroom ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                      <span className="truncate">Att. Bathroom</span>
                    </button>

                  </div>
                </div>
              </div>

            </div>
          </div>

        {/* Listings Grid (Right Side) */}
        <div className="flex-1 w-full min-w-0 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Available Properties</h1>
              <p className="text-slate-500 font-medium mt-1">Showing {filteredListings.length} matching results</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] p-4 border border-slate-200 shadow-sm animate-pulse flex flex-col">
                  <div className="w-full aspect-[4/3] bg-slate-200 rounded-[1.5rem] mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded-lg w-1/2 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
                    <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
                  </div>
                  <div className="h-12 bg-slate-200 rounded-xl w-full mt-auto"></div>
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="w-full h-[400px] bg-white/80 backdrop-blur-md border border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center p-8 shadow-sm">
              <div className="w-20 h-20 bg-rose-50 text-brand rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">No Listings Found</h3>
              <p className="text-slate-500 max-w-md mb-8 text-lg">We couldn't find any properties matching your exact filters. Why not be the first to list a property here?</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={clearFilters}
                  className="bg-white text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
                  className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand/90 transition-colors shadow-lg shadow-brand/30 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                  Add Listing
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
                {paginatedListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 border-t border-slate-200 pt-8">
                  <button 
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white text-slate-700 shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    Previous
                  </button>
                  <div className="flex gap-1 items-center px-5 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm text-sm">
                    {currentPage} <span className="text-slate-400 font-medium mx-1">of</span> {totalPages}
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white text-slate-700 shadow-sm flex items-center gap-2"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
