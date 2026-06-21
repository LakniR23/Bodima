interface ListingProps {
  id: number;
  title: string;
  location: string;
  distance: number;
  price: number;
  type: string;
  gender: string;
  cooking: boolean;
  image: string;
}

export default function ListingCard({ listing }: { listing: ListingProps }) {
  const genderColor = listing.gender === 'Girls' ? 'bg-pink-500' : listing.gender === 'Boys' ? 'bg-blue-600' : 'bg-emerald-500';

  return (
    <a href={`/listings/${listing.id}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-[1.25rem] p-2 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col block">
      {/* Framed Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          onError={(e) => { e.currentTarget.src = "https://placehold.co/1200x800/e2e8f0/1e293b?text=Image+Unavailable" }}
        />
        
        {/* Floating Tags */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm ${genderColor}`}>
            {listing.gender}
          </span>
          <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest text-slate-800 shadow-sm">
            {listing.type}
          </span>
        </div>
      </div>

      {/* Info Container with Brand Gradient */}
      <div className="flex flex-col flex-1 p-4 mt-1 rounded-xl relative z-10">
        <div className="absolute inset-0 rounded-xl pointer-events-none -z-10" />
        
        <div className="flex justify-between items-start mb-1.5 relative z-10">
          <h3 className="font-extrabold text-slate-900 text-lg leading-tight line-clamp-1 group-hover:text-brand transition-colors pr-2">
            {listing.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-4 relative z-10">
          <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          {listing.location}
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-brand/10">
            <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-brand shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-400 uppercase font-extrabold tracking-wider">Distance</span>
              <span className="text-xs font-bold text-slate-800 leading-none">{listing.distance} km</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-brand/10">
            <div className="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center text-brand shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-400 uppercase font-extrabold tracking-wider">Cooking</span>
              <span className="text-xs font-bold text-slate-800 leading-none">{listing.cooking ? 'Allowed' : 'No'}</span>
            </div>
          </div>
        </div>
        
        {/* Price Section */}
        <div className="mt-auto pt-3 border-t border-brand/10 flex items-center justify-between relative z-10">
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-xl text-slate-900">Rs. {listing.price.toLocaleString()}</span>
            <span className="text-slate-500 font-bold text-xs">/ mo</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-brand hover:text-brand/80 transition-colors group/link">
            View Details
            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </span>
        </div>
      </div>
    </a>
  );
}
