import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';

export default function ListingDetails({ id }: { id: string }) {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setListing({
            id: docSnap.id,
            title: data.title,
            location: data.location,
            distance: Number(data.distance) || 0,
            price: Number(data.price) || 0,
            type: data.propertyType,
            gender: data.genderPreference,
            cooking: data.cooking || false,
            meals: data.meals || false,
            weekend: data.weekend || false,
            bathroom: data.bathroom || false,
            image: data.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
            images: data.images && data.images.length > 0 ? data.images : [data.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop"],
            description: data.description || "No description provided.",
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            minStay: data.minStay || 'Any',
            moveInDate: data.moveInDate || 'Anytime',
            terms: data.terms || '',
            ownerName: data.ownerName || 'Property Manager',
            ownerContact: data.ownerContact || 'Not provided',
            postedDate: data.createdAt ? new Date(data.createdAt.toMillis()).toISOString() : new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const q = query(collection(db, `listings/${id}/reviews`), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReviews: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedReviews.push({
            id: doc.id,
            name: data.name,
            initial: data.name.charAt(0).toUpperCase(),
            color: ['bg-indigo-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500'][Math.floor(Math.random() * 5)],
            university: 'Student',
            date: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Just now',
            content: data.content
          });
        });
        setReviews(fetchedReviews);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    fetchListing();
    fetchReviews();
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!reviewName.trim() || !reviewContent.trim()) {
      alert("Please fill in both your name and your experience.");
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, `listings/${id}/reviews`), {
        name: reviewName,
        content: reviewContent,
        createdAt: serverTimestamp(),
        userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
      });
      alert("Review submitted successfully!");
      setReviewName("");
      setReviewContent("");
      setShowReviewForm(false);
      
      const q = query(collection(db, `listings/${id}/reviews`), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedReviews: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReviews.push({
          id: doc.id,
          name: data.name,
          initial: data.name.charAt(0).toUpperCase(),
          color: ['bg-indigo-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500'][Math.floor(Math.random() * 5)],
          university: 'Student',
          date: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Just now',
          content: data.content
        });
      });
      setReviews(fetchedReviews);
    } catch (err: any) {
      alert("Failed to submit review: " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!isAutoPlaying || !listing?.images?.length) return;
    const interval = setInterval(() => {
      setMainImageIndex(prev => (prev + 1) % listing.images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, listing]);

  const scrollThumbs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10) ? day % 10 : 0];
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="w-full">
              <div className="h-10 bg-slate-200 rounded-xl w-3/4 md:w-1/2 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-1/2 md:w-1/3"></div>
            </div>
            <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
          </div>
          
          {/* Gallery Skeleton */}
          <div className="w-full h-[400px] md:h-[500px] rounded-[1.5rem] bg-slate-200 mb-4"></div>
          <div className="flex gap-3 overflow-hidden mb-12">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-32 md:w-48 lg:w-56 aspect-[4/3] shrink-0 rounded-xl bg-slate-200"></div>
            ))}
          </div>

          {/* Content Layout Skeleton */}
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-[65%] space-y-8">
              <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-200 rounded-lg w-3/4"></div>
              </div>
              <div className="h-40 bg-slate-200 rounded-2xl w-full"></div>
            </div>
            <div className="lg:w-[35%]">
              <div className="h-[300px] bg-slate-200 rounded-3xl w-full"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-20">
          <div className="w-20 h-20 bg-rose-50 text-brand rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Listing Not Found</h1>
          <p className="text-slate-500 mb-6">The property you are looking for does not exist or has been removed.</p>
          <a href="/listings" className="bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20">Back to Search</a>
        </div>
        <Footer />
      </div>
    );
  }

  // Active amenities list
  const activeAmenities = [];
  if (listing.cooking) activeAmenities.push({ icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z", label: "Kitchen Access" });
  if (listing.meals) activeAmenities.push({ icon: "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z", label: "Meals Included" });
  if (listing.weekend) activeAmenities.push({ icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Weekend Stays" });
  if (listing.bathroom) activeAmenities.push({ icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z", label: "Attached Bathroom" });

  const images = listing.images || [listing.image];
  
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => window.location.href = '/listings'} className="text-slate-500 hover:text-brand transition-colors p-2 -ml-2 cursor-pointer bg-transparent border-none flex items-center justify-center relative z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{listing.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 pl-8 md:pl-0">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                {listing.location} <span className="text-slate-400 font-normal">({listing.distance}km from center)</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                4.92 (128 reviews)
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Posted on {formatDate(listing.postedDate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pl-8 md:pl-0">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: listing.title,
                    url: window.location.href
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              Share
            </button>
          </div>
        </div>

        {/* Scrollable Gallery */}
        <div 
          className="flex flex-col gap-3 mb-12 relative"
          onMouseEnter={() => setIsAutoPlaying(false)} 
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Hero Image */}
          <div className="w-full h-[400px] md:h-[500px] rounded-[1.5rem] overflow-hidden relative group bg-black">
            <img src={images[mainImageIndex]} alt="Main View" className="w-full h-full object-contain md:object-cover group-hover:scale-105 transition-transform duration-700" />
            
            {/* Overlay mock video play button if it's the video index */}
            {mainImageIndex === 4 && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center pl-1 shadow-2xl">
                  <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Horizontal Scrollable Thumbnails */}
          <div className="relative group/thumbs">
            {/* Left Scroll Button */}
            <button 
              onClick={() => scrollThumbs('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur text-slate-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/thumbs:opacity-100 transition-opacity hover:bg-white hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            <div 
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto py-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
            >
              {images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setMainImageIndex(idx)}
                  className={`w-32 md:w-48 lg:w-56 aspect-[4/3] shrink-0 rounded-xl overflow-hidden snap-start cursor-pointer group shadow-sm relative transition-all ${idx === mainImageIndex ? 'ring-4 ring-brand' : 'opacity-70 hover:opacity-100'}`}
                >
                  {/* Overlay mock video play button on the 5th item (idx 4) to simulate video */}
                  {idx === 4 && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 group-hover:bg-black/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center pl-1 shadow-lg">
                        <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                      </div>
                    </div>
                  )}
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button 
              onClick={() => scrollThumbs('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur text-slate-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/thumbs:opacity-100 transition-opacity hover:bg-white hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column (Details) */}
          <div className="lg:w-[65%] flex flex-col">
            
            {/* Title & Tags */}
            <div className="pb-8 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Entire {listing.type}</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                  {listing.gender} Only
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                  {listing.type}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="py-8 border-b border-slate-200">
              <p className="text-slate-600 leading-relaxed text-lg">
                {listing.description}
              </p>
            </div>

            {/* Terms */}
            <div className="py-8 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Terms & Rules</h3>
              {listing.terms && (
                <p className="text-slate-600 leading-relaxed text-lg mb-6 whitespace-pre-line">
                  {listing.terms}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Move-in Date</p>
                  <p className="text-lg font-bold text-slate-800">{listing.moveInDate || 'Anytime'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Minimum Stay</p>
                  <p className="text-lg font-bold text-slate-800">{listing.minStay || 'Any'}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Amenities List */}
            <div className="py-8 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">What this place offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {activeAmenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-slate-700">
                    <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={amenity.icon}></path>
                    </svg>
                    <span className="text-lg">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="py-8 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Where you'll be</h3>
              <p className="text-slate-600 font-medium mb-4">{listing.location}, Sri Lanka</p>
              
              <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 mb-6 bg-slate-100 relative">
                {/* Fallback/Loader background */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <iframe 
                  src={`https://maps.google.com/maps?q=${listing.latitude && listing.longitude ? `${listing.latitude},${listing.longitude}` : encodeURIComponent(listing.location + ' Sri Lanka')}&t=&z=14&ie=UTF8&iwloc=&output=embed`} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, position: 'relative', zIndex: 10 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${listing.location} Map`}
                ></iframe>
              </div>

              <div className="flex flex-wrap gap-4">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude && listing.longitude ? `${listing.latitude},${listing.longitude}` : encodeURIComponent(listing.location + ' Sri Lanka')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Open in Maps App
                </a>
                <button 
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${listing.latitude && listing.longitude ? `${listing.latitude},${listing.longitude}` : encodeURIComponent(listing.location + ' Sri Lanka')}`;
                    if (navigator.share) {
                      navigator.share({
                        title: `${listing.title} Location`,
                        text: `Check out the location for ${listing.title}`,
                        url: url
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(url);
                      alert('Location link copied to clipboard!');
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                  Share Location
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="py-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="text-2xl font-bold text-slate-900">Student Experiences</h3>
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)} 
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm text-sm"
                >
                  {showReviewForm ? 'Cancel' : 'Add your experience'}
                </button>
              </div>
              <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                Share your genuine experience about this property. <span className="font-bold text-brand">We strongly encourage using your real name</span> to foster a trusted, transparent community that helps fellow students find safe and reliable accommodations.
              </p>

              {/* Add Review Form */}
              {showReviewForm && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Add your experience</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Your Real Name</label>
                      <input type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Your Experience</label>
                      <textarea rows={4} value={reviewContent} onChange={e => setReviewContent(e.target.value)} placeholder="Describe the safety, cleanliness, and overall experience..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none font-medium"></textarea>
                    </div>
                    <button onClick={handleReviewSubmit} disabled={isSubmittingReview} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSubmittingReview ? "Submitting..." : "Submit Experience"}
                    </button>
                  </div>
                </div>
              )}

              {/* Real Reviews List */}
              <div className="space-y-4 mb-8">
                {reviews.slice((currentPage - 1) * 6, currentPage * 6).map((review) => (
                  <div key={review.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${review.color} text-white rounded-full flex items-center justify-center font-bold text-lg`}>
                        {review.initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                        <p className="text-xs text-slate-500">Student at {review.university} • {review.date}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {reviews.length > 6 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <span className="text-sm font-bold text-slate-700">
                    Page {currentPage} of {Math.ceil(reviews.length / 6)}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(reviews.length / 6), p + 1))}
                    disabled={currentPage === Math.ceil(reviews.length / 6)}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sticky Pricing Card) */}
          <div className="lg:w-[35%]">
            <div className="sticky top-32 bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">Rs. {listing.price.toLocaleString()}</span>
                <span className="text-slate-500 font-medium">/ month</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Owner Name</span>
                  <span className="text-slate-500 font-medium text-right">{listing.ownerName}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="font-bold text-slate-700">Owner Contact</span>
                  <span className="text-slate-500 font-medium text-right">{listing.ownerContact}</span>
                </div>
              </div>

              <a href={`tel:${listing.ownerContact}`} className="w-full bg-brand text-white py-4 rounded-xl font-bold text-lg hover:bg-brand/90 transition-all active:scale-[0.98] mb-4 shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                Call Owner
              </a>
              
              <p className="text-center text-sm text-slate-500 mb-6">You won't be charged yet</p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
