export default function AmenitiesShowcase() {
  const amenities = [
    {
      title: "Cooking Facilities",
      desc: "Fully equipped kitchens or simple pantries for self-cooking.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
      ),
      url: "/listings?cooking=true"
    },
    {
      title: "Meals Provided",
      desc: "Don't want to cook? Find places that offer breakfast, lunch, and dinner.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>
      ),
      url: "/listings?meals=true"
    },
    {
      title: "Weekend Only Stays",
      desc: "Perfect for part-time students or professionals commuting on weekends.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      ),
      url: "/listings?weekend=true"
    },
    {
      title: "Attached Bathrooms",
      desc: "Maximum privacy with your own personal bathroom facilities.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
      ),
      url: "/listings?bathroom=true"
    }
  ];

  return (
    <section className="py-8 md:py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand font-bold tracking-widest text-sm uppercase mb-4 block">Tailor Your Stay</span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">Lifestyle & Amenities</h2>
          <p className="text-lg text-slate-500">
            A boarding house is more than just a bed. Filter by the specific facilities that matter to your daily routine, from home-cooked meals to weekend flexibilty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {amenities.map((item, idx) => (
            <a href={item.url} key={idx} className="block bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(146,72,122,0.06)] hover:shadow-[0_20px_50px_rgba(146,72,122,0.12)] transition-all duration-300 group cursor-pointer border border-rose-100/50 hover:border-rose-200 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 shadow-sm flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300 mb-6 group-hover:rotate-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand transition-colors">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {item.desc}
              </p>
            </a>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a href="/listings" className="inline-block bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-brand transition-colors shadow-xl hover:shadow-brand/20">
            Explore All Amenities
          </a>
        </div>
      </div>
    </section>
  );
}
