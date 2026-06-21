import { useState, useEffect } from 'react';

const carouselSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
    title: 'Find Your Perfect Boarding Place',
    subtitle: 'Verified hostels and annexes for students and professionals.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
    title: 'Comfortable & Affordable',
    subtitle: 'Browse hundreds of verified listings matching your budget.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
    title: 'Live Close to Campus',
    subtitle: 'Premium locations within walking distance to major universities.'
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (searchType) params.append('type', searchType);
    window.location.href = `/listings?${params.toString()}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-24 md:pt-28 pb-8 lg:pt-16 lg:pb-16 overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-rose-200/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row-reverse items-center gap-12 lg:gap-8">
        
        {/* Text Content - Right Side on Desktop */}
        <div className="flex-1 w-full relative z-40">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-rose-200 text-brand font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            Premium Boarding Finder
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight relative inline-block">
            Unlock Your <br/>
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-brand via-brand/80 to-brand/90">
              Next Chapter
            </span>
            <svg className="absolute w-[105%] h-4 sm:h-6 -bottom-1 -left-1 sm:-left-2 text-rose-200/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 15 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </h1>
          
          <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed border-l-4 border-rose-200 pl-5">
              Find hostels and annexes near your campus quickly and compare available options in one place without wasting time scrolling through multiple listings.
          </p>
          
          {/* Advanced Glassmorphism Search Island */}
          <div className="w-full relative group mt-4">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-brand/20 via-brand/30 to-brand/20 rounded-[2.5rem] blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative w-full bg-white/90 backdrop-blur-xl p-2.5 rounded-[2rem] shadow-xl shadow-brand/5 border border-white flex flex-col md:flex-row gap-2">
              
              {/* Search Input - Restricted to Malabe */}
              <div className="flex-1 relative flex items-center">
                <div className="w-12 h-12 ml-2 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 text-brand">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <select 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-3 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-slate-800 font-bold placeholder:text-slate-400 text-base md:text-sm appearance-none cursor-pointer"
                >
                  <option value="">Anywhere in Malabe</option>
                  <option value="Malabe City">Malabe City Center</option>
                  <option value="Pittugala">Pittugala</option>
                  <option value="Thalahena">Thalahena</option>
                  <option value="Kaduwela Road">Kaduwela Road</option>
                  <option value="Near SLIIT">Near SLIIT</option>
                  <option value="Near CINEC">Near CINEC</option>
                </select>
              </div>
              
              <div className="w-px h-12 bg-slate-200 hidden md:block my-auto mx-2"></div>
              
              {/* Select Input - Expanded Types */}
              <div className="w-full md:w-40 lg:w-42 xl:w-44 relative flex items-center">
                <div className="w-12 h-12 ml-2 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full pl-3 pr-8 py-3 bg-transparent border-none focus:ring-0 outline-none appearance-none text-slate-600 font-semibold text-base md:text-sm cursor-pointer"
                >
                  <option value="">Any Type</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                  <option value="3+ Sharing">3+ Sharing Rooms</option>
                  <option value="Annex">Annex</option>
                  <option value="House">House</option>
                </select>
              </div>

              <button onClick={handleSearch} className="bg-slate-900 text-white px-5 py-3 md:px-6 md:py-3.5 rounded-[1.5rem] font-bold text-sm hover:bg-brand hover:shadow-lg hover:shadow-brand/30 transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2 group/btn shrink-0">
                <span>Explore</span>
                <svg className="w-5 h-5 transform group-hover/btn:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Image Carousel - Left Side on Desktop */}
        <div className="hidden md:flex flex-1 relative z-10 w-full h-[380px] md:h-[450px] lg:h-[550px] justify-center items-center perspective-1000">
          {carouselSlides.map((slide, index) => {
            const isActive = index === currentSlide;
            const isNext = index === (currentSlide + 1) % carouselSlides.length;
            const isPrev = index === (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
            
            let transformClass = "opacity-0 scale-75 translate-y-12 z-0 pointer-events-none";
            if (isActive) {
              transformClass = "opacity-100 scale-100 translate-y-0 translate-x-0 z-30 shadow-[0_20px_50px_rgba(var(--brand),0.3)]";
            } else if (isNext) {
              transformClass = "opacity-0 md:opacity-70 scale-90 translate-x-0 md:translate-x-16 lg:translate-x-14 xl:translate-x-20 translate-y-0 md:translate-y-8 z-20 shadow-xl md:cursor-pointer pointer-events-none md:pointer-events-auto";
            } else if (isPrev) {
              transformClass = "opacity-0 md:opacity-70 scale-90 translate-x-0 md:-translate-x-16 lg:-translate-x-14 xl:-translate-x-20 translate-y-0 md:translate-y-8 z-10 shadow-xl md:cursor-pointer pointer-events-none md:pointer-events-auto";
            }

            return (
              <div 
                key={slide.id} 
                onClick={() => !isActive && setCurrentSlide(index)}
                className={`absolute top-0 bottom-0 left-0 right-0 m-auto w-full max-w-[260px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[280px] xl:max-w-[340px] h-[340px] sm:h-[360px] md:h-[400px] lg:h-[380px] xl:h-[460px] rounded-[2.5rem] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${transformClass}`}
              >
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="bg-white/20 backdrop-blur-md rounded-full w-fit px-3 py-1 text-xs text-white font-bold mb-3 border border-white/20">
                    Featured
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-1 leading-tight">{slide.title}</h3>
                  <p className="text-white/80 text-sm line-clamp-2">{slide.subtitle}</p>
                </div>
              </div>
            );
          })}
          
          <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2 z-40">
            {carouselSlides.map((_, index) => (
              <div key={index} className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-brand rounded-full transition-all duration-[5000ms] ease-linear ${
                    index === currentSlide ? 'w-full' : index < currentSlide ? 'w-full' : 'w-0'
                  }`}
                  style={{ transitionDuration: index === currentSlide ? '5000ms' : '300ms' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
